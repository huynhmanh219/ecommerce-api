// services/api-gateway/src/gateway.service.ts

import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GatewayService {
  /**
   * Service URLs - Centralized config
   * 
   * TẠI SAO centralized?
   * - Change URL once, everywhere updates
   * - Easy to switch services to load balancer
   * - Support multiple instances
   */
  private readonly SERVICE_URLS = {
    auth: 'http://auth-service:3001',
    product: 'http://product-service:3002',
    order: 'http://order-service:3003',
    payment: 'http://payment-service:3004',
    notification: 'http://notification-service:3006',
  };

  constructor(private http: HttpService) {}

  /**
   * Generic method to call any service
   * 
   * TẠI SAO generic?
   * - Avoid code duplication
   * - Consistent error handling
   * - Central retry logic
   */
  private async callService(
    serviceName: string,
    method: 'get' | 'post' | 'put' | 'delete',
    endpoint: string,
    data?: any,
  ): Promise<any> {
    const url = `${this.SERVICE_URLS[serviceName]}${endpoint}`;

    try {
      console.log(`📤 [${method.toUpperCase()}] ${url}`);

      let response;
      if (method === 'get') {
        response = await firstValueFrom(this.http.get(url));
      } else if (method === 'post') {
        response = await firstValueFrom(this.http.post(url, data));
      } else if (method === 'put') {
        response = await firstValueFrom(this.http.put(url, data));
      } else if (method === 'delete') {
        response = await firstValueFrom(this.http.delete(url));
      }

      console.log(`✅ [${response.status}] Success`);
      return response.data;
    } catch (error) {
        let err = error as Error;
        console.error(`❌ Service call failed: ${url}`, err.message);
      
      throw error;
    }
  }

  // ===== AUTH SERVICE =====

  /**
   * Register user
   */
  async registerUser(data: { email: string; password: string; firstName: string; lastName: string }) {
    return this.callService('auth', 'post', '/api/auth/register', data);
  }

  /**
   * Login user
   */
  async loginUser(data: { email: string; password: string }) {
    return this.callService('auth', 'post', '/api/auth/login', data);
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token: string) {
    return this.callService('auth', 'post', '/api/auth/verify', { token });
  }

  /**
   * Get user profile
   */
  async getUserProfile(token: string) {
    return this.callService('auth', 'get', '/api/auth/profile');
  }

  // ===== PRODUCT SERVICE =====

  /**
   * Get all products with filters
   * 
   * TẠI SAO pass filters?
   * - Query params (page, categoryId, etc)
   * - Gateway transparent to client
   */
  async getProducts(filters?: { page?: number; categoryId?: string; search?: string }) {
    const queryString = new URLSearchParams(filters as any).toString();
    const endpoint = `/api/products${queryString ? '?' + queryString : ''}`;
    
    return this.callService('product', 'get', endpoint);
  }

  /**
   * Get single product
   */
  async getProductById(id: string) {
    return this.callService('product', 'get', `/api/products/${id}`);
  }

  /**
   * Create product (admin only)
   */
  async createProduct(data: any) {
    return this.callService('product', 'post', '/api/products', data);
  }

  /**
   * Update product
   */
  async updateProduct(id: string, data: any) {
    return this.callService('product', 'put', `/api/products/${id}`, data);
  }

  /**
   * Delete product
   */
  async deleteProduct(id: string) {
    return this.callService('product', 'delete', `/api/products/${id}`);
  }

  // ===== ORDER SERVICE =====

  /**
   * Create order
   */
  async createOrder(data: { items: any[]; shippingAddress: string }) {
    return this.callService('order', 'post', '/api/orders', data);
  }

  /**
   * Get user orders
   */
  async getUserOrders() {
    return this.callService('order', 'get', '/api/orders');
  }

  /**
   * Get order by ID
   */
  async getOrderById(id: string) {
    return this.callService('order', 'get', `/api/orders/${id}`);
  }

  // ===== PAYMENT SERVICE =====

  /**
   * Get payment by ID
   */
  async getPaymentById(id: string) {
    return this.callService('payment', 'get', `/api/payments/${id}`);
  }

  /**
   * Refund payment
   */
  async refundPayment(id: string, reason: string) {
    return this.callService('payment', 'post', `/api/payments/${id}/refund`, { reason });
  }

  // ===== NOTIFICATION SERVICE =====

  /**
   * Send notification (internal)
   */
  async sendNotification(userId: string, message: string) {
    return this.callService('notification', 'post', '/api/notifications', {
      userId,
      message,
    });
  }

  // ===== HEALTH CHECK =====

  /**
   * Check all services health
   * 
   * TẠI SAO health check?
   * - Know which services are down
   * - Dashboard view
   * - Auto-failover (future)
   */
  async checkHealthStatus(): Promise<{
    gateway: string;
    services: Record<string, string>;
  }> {
    const services: Record<string, string> = {};

    for (const [name, url] of Object.entries(this.SERVICE_URLS)) {
      try {
        await firstValueFrom(
          this.http.get(`${url}/health`, { timeout: 5000 })
        );
        services[name] = '✅ UP';
      } catch {
        services[name] = '❌ DOWN';
      }
    }

    return {
      gateway: '✅ UP',
      services,
    };
  }
}