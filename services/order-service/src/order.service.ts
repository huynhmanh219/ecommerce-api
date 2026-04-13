import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Order, OrderStatus } from "./entities/order.entity";
import { Repository } from "typeorm";
import { HttpService } from "@nestjs/axios";
    import { firstValueFrom } from "rxjs";


Injectable()
export class OrderService{
    constructor(
        @InjectRepository(Order)
        private orderRepository:Repository<Order>,
        private httpService:HttpService,
    ){}

    async createOrder(userId:string,items:any[],shippingAddress:string):Promise<Order>{
        if(!items || items.length ===0){
            throw new Error('Order must have items');
        }

        const productIds = items.map(i => i.productId);
        const products = await this.getProductsByIds(productIds);
    }
    private async getProductsByIds(ids:string[]):Promise<any[]>{
        try {
            const response = await firstValueFrom(
                this.httpService.post('http://localhost:3001/products/batch/get-by-ids',{ids})
            );
            return response.data;
        } catch (error) {
            throw new BadRequestException('Counld not verify products');
        }
    }

    private async reserveProductStock(productId:string,quantity:number):Promise<boolean>{
        try {
            const response = await firstValueFrom(
                this.httpService.post('http://localhost:3001/products/reserve-stock',productId,quantity)
            );
            return response.data.success;
        } catch (error) {
            console.error('Error reserving stock for product',productId,error);
            return false;
        }
    }

    private async realeaseProductStock(productId:string,quantity:number):Promise<void>{
        try {
            await firstValueFrom(
                this.httpService.post('http://localhost:3001/products/release-stock',productId,quantity)
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

    private async getOrderById(orderId:string):Promise<Order>{
        const order = await this.orderRepository.findOne({where:{id:orderId}});
        if(!order){
            throw new BadRequestException('Order not found');
        }
        return order;
    }
}