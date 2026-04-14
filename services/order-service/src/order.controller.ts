import { Body, Controller, Get, Param, Post, Request, UseGuards } from "@nestjs/common";
import { OrderService } from "./order.service";
import { JwtAuthGuard } from "../../auth-service/src/guards/jwt-auth.guard";


@Controller('orders')
export class OrderController{
    constructor(private orderService: OrderService){}

    @Post()
    @UseGuards(JwtAuthGuard)
    async createOrder(
        @Body() body: {items:any[],shippingAddress:string},
        @Request() req,
    ){
        return this.orderService.createOrder(req.user.id,body.items,body.shippingAddress);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async getUserOrders(@Request() req){
        return this.orderService.getOrdersByUser(req.user.id);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async getOrder(@Param('id') id:string, @Request() req){
        const order = await this.orderService.getOrderById(id);

        if(order.userId !== req.user.id && req.user.role !== 'admin'){
            throw new Error('Unauthorized');
        }
        return order;
    }

    @Get(':id/history')
    async getOrderHistory(@Param('id') id:string){
        return this.orderService.getOrderHistory(id);
    }

    @Get('health')
    health(){
        return {status:'ok',service:'order'};
    }
}