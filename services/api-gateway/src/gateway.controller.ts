
import { Controller, Post, Get, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { GatewayService } from './gateway.service';

@Controller()
export class GatewayController {
  constructor(private gatewayService: GatewayService) {}

  // ===== AUTH =====

  @Post('api/auth/register')
  async register(@Body() body: any) {
    return this.gatewayService.registerUser(body);
  }

  @Post('api/auth/login')
  async login(@Body() body: any) {
    return this.gatewayService.loginUser(body);
  }

  @Post('api/auth/verify')
  async verify(@Body('token') token: string) {
    return this.gatewayService.verifyToken(token);
  }

  // ===== PRODUCTS =====

  @Get('api/products')
  async getProducts(
    @Query('page') page?: string,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
  ) {
    return this.gatewayService.getProducts({
      page: page ? parseInt(page) : undefined,
      categoryId,
      search,
    });
  }

  @Get('api/products/:id')
  async getProduct(@Param('id') id: string) {
    return this.gatewayService.getProductById(id);
  }

  @Post('api/products')
  async createProduct(@Body() data: any) {
    return this.gatewayService.createProduct(data);
  }

  // ===== ORDERS =====

  @Post('api/orders')
  async createOrder(@Body() data: any) {
    return this.gatewayService.createOrder(data);
  }

  @Get('api/orders')
  async getUserOrders() {
    return this.gatewayService.getUserOrders();
  }

  @Get('api/orders/:id')
  async getOrder(@Param('id') id: string) {
    return this.gatewayService.getOrderById(id);
  }

  // ===== PAYMENTS =====

  @Get('api/payments/:id')
  async getPayment(@Param('id') id: string) {
    return this.gatewayService.getPaymentById(id);
  }

  @Post('api/payments/:id/refund')
  async refundPayment(@Param('id') id: string, @Body('reason') reason: string) {
    return this.gatewayService.refundPayment(id, reason);
  }

  // ===== HEALTH =====

  @Get('health')
  async health() {
    return this.gatewayService.checkHealthStatus();
  }
}