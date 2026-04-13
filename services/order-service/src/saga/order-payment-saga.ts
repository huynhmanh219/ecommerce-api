import type { PaymentcompletedEvent,PaymentFailedEvent } from './../../../../packages/shared/dist/events/order.events.d';
import { AmqpConnection, RabbitSubscribe } from "@golevelup/nestjs-rabbitmq";
import { Injectable } from "@nestjs/common";
import { OrderService } from "../order.service";
import { EVENT_KEYS  } from "@ecommerce/shared/src/events/order.events";
import { OrderCreatedEvent } from "@ecommerce/shared";
import { OrderStatus } from '../entities/order.entity';



interface SagaState{
    orderId:string;
    userId:string;
    items: any[];
    reservedItems:string[];
    status:"pending" | "completed" | "failed";
}

@Injectable()
export class OrderPaymentSaga{
    private sagaStates = new Map<string,SagaState>();

    constructor(
        private amqpConnection: AmqpConnection,
        private orderService: OrderService
    ){}

    @RabbitSubscribe({
        exchange:"ecommere.exchange",
        routingKey:EVENT_KEYS.ORDER_CREATED,
        queue:"saga-order-created-queue",
    })
    async startOrderPaymentSaga(event:OrderCreatedEvent){
        console.log(`Saga started for order ${event.orderId}`);

        const state:SagaState = {
            orderId:event.orderId,
            userId:event.userId,
            items:event.items,
            reservedItems:[],
            status:"pending"
        }

        this.sagaStates.set(event.orderId,state);
        try {
            for (const item of event.items) {
                await this.amqpConnection.publish(
                    'ecommerce.exchange',
                    'inventory.reserve',
                    {
                        orderId:event.orderId,
                        productId:item.productId,
                        quantity:item.quantity
                    }
                );

                state.reservedItems.push(item.productId);
            }

        await this.amqpConnection.publish(
            'ecommerce.exchange',
            'payment.process',
            {
                orderId:event.orderId,
                userId:event.userId,
                amount:event.totalPrice
            }
        )
        } catch (error) {
            console.error(`Saga failed for order ${event.orderId}:`, error);
            state.status = "failed";

            await this.compensateReservedStock(state);
        }
    }


    @RabbitSubscribe({
        exchange:"ecommerce.exchange",
        routingKey:EVENT_KEYS.PAYMENT_COMPLETED,
        queue:"saga-payment-completed-queue",
    })
    async handlePaymentCompleted(event:PaymentcompletedEvent){
        console.log(`Payment completed for order ${event.orderId}`);

        const state = this.sagaStates.get(event.orderId);
        if(!state){
            console.warn(`Saga state not found for order ${event.orderId}`);
            return;
        }

        await this.orderService.updateOrderStatus(event.orderId,OrderStatus.CONFIRMED);
        state.status = "completed";
        this.sagaStates.delete(event.orderId);
    }

    @RabbitSubscribe({
        exchange:"ecommerce.exchange",
        routingKey:EVENT_KEYS.PAYMENT_FAILED,
        queue:"saga-payment-failed-queue",
    })
    async handlePaymentFailed(event:PaymentFailedEvent){
        console.log(`Payment failed for order ${event.orderId}: ${event.reason}`);
        const state = this.sagaStates.get(event.orderId);
        if(!state){
            console.warn(`Saga state not found for order ${event.orderId}`);
            return;
        }

        await this.compensateReservedStock(state);
        await this.orderService.updateOrderStatus(event.orderId,OrderStatus.CANCELLED);

        state.status = "failed";
        this.sagaStates.delete(event.orderId);
    }

    private async compensateReservedStock(state:SagaState):Promise<void>{
        console.log(`Compensating reserved stock for order ${state.orderId}`);

        for (const productId of state.reservedItems) {
            const item = state.items.find(i=>i.productId === productId);
            if(!item) continue;
            if(item){
                await this.amqpConnection.publish(
                    'ecommerce.exchange',
                    'inventory.release',
                    {
                        orderId:state.orderId,
                        productId,
                        quantity:item.quantity
                    }
                )
            }
        }
    }
}