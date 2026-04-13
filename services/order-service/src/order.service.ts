import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Order, OrderStatus } from "./entities/order.entity";
import { Repository } from "typeorm";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom, NotFoundError, timestamp } from "rxjs";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { EVENT_KEYS } from "@ecommerce/shared/src/events/order.events";
import { OrderCreatedEvent } from "@ecommerce/shared";


@Injectable()
export class OrderService{
    constructor(
        @InjectRepository(Order)
        private orderRepository:Repository<Order>,
        private amqpConnection: AmqpConnection,
        private httpService:HttpService,
    ){}

    async createOrder(userId:string,items:any[],shippingAddress:string) : Promise<Order>{
        if(!items || items.length ===0){
            throw new Error('Order must have items');
        }

        const productIds = items.map(i => i.productId);
        const products = await this.getProductsByIds(productIds);

        const itemsWithPrices = items.map(i => {
            const product = products.find(p => p.id === i.productId);
            if(!product){
                throw new BadRequestException(`Product with id ${i.productId} not found`);
            }

            if (product.stock  < i.quantity){
                throw new BadRequestException(`Insufficient stock for product ${product.name}`);
            }
            return {
                ...i,
                price:product.price,
            }
        });
        
        const totalPrice = itemsWithPrices.reduce((sum,item)=> sum + item.price * item.quantity,0);
        const order = this.orderRepository.create({
            userId,
            items:itemsWithPrices,
            totalPrice,
            shippingAddress,
            status:OrderStatus.PENDING
        });
        const savedOrder = await this.orderRepository.save(order);
        
        try {
            for(const item of itemsWithPrices){
                const reserved = await this.reserveProductStock(item.productId,item.quantity);
                if(!reserved){
                    throw new BadRequestException(`Failed to reserve stock for product ${item.productId}`);
                }
            }
            
            await this.amqpConnection.publish(
                'ecommerce.exchange',
                EVENT_KEYS.ORDER_CREATED,
                {
                    orderId:savedOrder.id,
                    userId,
                    items:itemsWithPrices,
                    totalPrice,
                    shippingAddress,
                    timestamp:new Date()
                } as OrderCreatedEvent
            );

            const payment = await this.processPayment(savedOrder.id,userId,totalPrice);
            savedOrder.paymentId = payment.id;
            savedOrder.paymentStatus = "pending";
            savedOrder.status = OrderStatus.CONFIRMED;
            await this.orderRepository.save(savedOrder);
            
            return savedOrder;
        } catch (error) {
            for (const item of itemsWithPrices){
                await this.releaseProductStock(item.productId,item.quantity);
            }
            savedOrder.status = OrderStatus.CANCELLED;
            await this.orderRepository.save(savedOrder);
            throw error;
        }
    }

    async getOrdersByUser(userId:string):Promise<Order[]>{
        return this.orderRepository.find({
            where:{userId},
            order:{createdAt:"DESC"}
        })
    }

    async getOrderById(id: string): Promise<Order> {
        const order = await this.orderRepository.findOne({ where: { id } });
        if (!order) {
        throw new NotFoundError('Order not found');
        }
     return order;
     }
    private async getProductsByIds(ids:string[]):Promise<any[]>{
        try {
            const response = await firstValueFrom(
                this.httpService.post('http://localhost:3001/products/batch/get-by-ids',{ids})
            );
            return response.data;
        } catch (error) {
            throw new BadRequestException('Could not verify products');
        }
    }

    private async reserveProductStock(productId:string,quantity:number):Promise<boolean>{
        try {
            const response = await firstValueFrom(
                this.httpService.post('http://localhost:3001/products/reserve-stock',{productId,quantity})
            );
            return response.data.success;
        } catch (error) {
            console.error('Error reserving stock for product',productId,error);
            return false;
        }
    }

    private async releaseProductStock(productId:string,quantity:number):Promise<void>{
        try {
            await firstValueFrom(
                this.httpService.post('http://localhost:3001/products/release-stock',{productId,quantity})
            );
        } catch (error) {
            console.error('Error releasing stock for product',productId,error);
        }
    }

    private async processPayment(
        orderId:string,
        userId:string,
        amount:number
    ):Promise<any>{
        try {
            const response = await firstValueFrom(
                this.httpService.post('http://localhost:3002/payments/process',{
                    orderId,
                    userId,
                    amount
                })
            );
            return response.data;
        } catch (error) {
            throw new BadRequestException('Payment processing failed');
        }
    }

    async updateOrderStatus(orderId:string,status:OrderStatus):Promise<Order>{
        const order = await this.getOrderById(orderId);
        order.status = status;
        return this.orderRepository.save(order);
    }

    // private async getOrderById(orderId:string):Promise<Order>{
    //     const order = await this.orderRepository.findOne({where:{id:orderId}});
    //     if(!order){
    //         throw new BadRequestException('Order not found');
    //     }
    //     return order;
    // }
}