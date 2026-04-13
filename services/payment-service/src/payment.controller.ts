import { Request } from '@nestjs/common';
import { Param } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { Body, Get, Post } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../../auth-service/src/guards/jwt-auth.guard';


@Controller('payment')
export class PaymentController{
    constructor(
        private paymentService:PaymentService
    ){}

    @Post('process')
    async processPayment(@Body() body:any){
        return this.paymentService.processPayment(
            body.orderId,
            body.userId,
            body.amount,
            body.paymentMethodId
        );
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async getPayment(@Param("id") id:string,@Request() req){
        const payment = await this.paymentService.getPaymentById(id);
        if (payment.userId !== req.user.id && req.user.role !== 'admin') {
         throw new Error('Unauthorized');
        }
        return payment;
    }

    @Post(':id/refund')
    @UseGuards(JwtAuthGuard)
    async refundPayment(
        @Param('id') id:string,
        @Body('reason') reason:string,
        @Request() req,
    ){
        const payment = await this.paymentService.getPaymentById(id);

        if (payment.userId !== req.user.id && req.user.role !== 'admin') {
            throw new Error('Unauthorized');
        }

        return this.paymentService.refundPayment(id, reason);
    }

    @Get('health')
    health() {
        return { status: 'ok', service: 'payment' };
    }
}