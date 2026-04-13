import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { EVENT_KEYS } from '@ecommerce/shared/src/events/order.events';
import { OrderCreatedEvent } from '@ecommerce/shared';
import { timestamp } from 'rxjs';

@Injectable()
export class PaymentService{
    private stripe: InstanceType<typeof Stripe>;
    
    constructor(
        @InjectRepository(Payment)
        private paymentRepository:Repository<Payment>,
        private amqpConnection: AmqpConnection
    ){
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "",{
            apiVersion:'2026-03-25.dahlia'
        })
    }

        @RabbitSubscribe({
        exchange:'ecommerce.exchange',
        routingKey:EVENT_KEYS.ORDER_CREATED,
        queue:'payment-order-created-queue',
        queueOptions:{
            durable:true
        }
    })
    async handleOrderCreated(msg:OrderCreatedEvent){
        console.log(`Received order created event for order ${msg.orderId}`);
        try {
            const payment = this.paymentRepository.create({
                orderId:msg.orderId,
                userId:msg.userId,
                amount:msg.totalPrice,
                status:PaymentStatus.PENDING
            });
            await this.paymentRepository.save(payment);

            await this.amqpConnection.publish(
                'ecommerce.exchange',
                EVENT_KEYS.PAYMENT_COMPLETED,
                {
                    paymentId:payment.id,
                    orderId:msg.orderId,
                    amouunt:msg.totalPrice,
                    transactionId:'charge_123',
                    timestamp:new Date(),
                }
            )
        } catch (error) {
            console.error(`Failed to process payment for order ${msg.orderId}:`, error);
            await this.amqpConnection.publish(
                'ecommerce.exchange',
                EVENT_KEYS.PAYMENT_FAILED,
                {
                    paymentId:"",
                    orderId:msg.orderId,
                    reason:(error as Error).message,
                    timestamp: new Date(),
                }
            )
        }
    }

    async processPayment(
        orderId:string,
        userId:string,
        amount:number,
        paymentMethodId:string,
    ):Promise<Payment>{
        const payment = this.paymentRepository.create({
            orderId,
            userId,
            amount,
            status:PaymentStatus.PENDING
        });
        await this.paymentRepository.save(payment);
        try {
            const charge = await this.stripe.paymentIntents.create({
                amount:Math.round(amount* 100),
                currency:"usd",
                payment_method:paymentMethodId,
                confirm:true,
                metadata:{
                    orderId,
                    userId
                }
            })
            payment.transactionId = charge.id;
            payment.status  = PaymentStatus.COMPLETED;
            await this.paymentRepository.save(payment);
            return payment;
        } catch (error) {
            const err = error as Error;
            payment.status = PaymentStatus.FAILED;
            payment.failureReason = err.message;
            await this.paymentRepository.save(payment);
            throw new BadRequestException(`Payment failed: ${err.message}`);            
        }
    }

    async getPaymentById(id:string):Promise<Payment>{
        const payment = await this.paymentRepository.findOne({where:{id}});
        if(!payment){
            throw new NotFoundException('payment not found');
        }
        return payment;
    }

    async refundPayment(paymentId:string,reason:string):Promise<Payment>{
        const payment = await this.getPaymentById(paymentId);
        if(payment.status !== PaymentStatus.COMPLETED){
            throw new BadRequestException("Can only refund completed payments");
        }
        try {
            await this.stripe.refunds.create({
                payment_intent:payment.transactionId,
                reason:"requested_by_customer",
                metadata:{refundReason:reason}
            })
            payment.status = PaymentStatus.REFUNDED;
            await this.paymentRepository.save(payment);

            return payment;
        } catch (error: Error | any) {
            throw new BadRequestException('Refund failed: ' + error.message);
        }
    }
}
