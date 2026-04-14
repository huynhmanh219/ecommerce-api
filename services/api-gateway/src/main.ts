// services/api-gateway/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('API Gateway');

  /**
   * TẠI SAO set global prefix?
   * - All routes start with /api
   * - Example: /api/products, /api/orders
   * - Keep consistent with services
   */
  app.setGlobalPrefix('api');

  /**
   * Enable CORS
   * 
   * TẠI SAO CORS?
   * - Frontend runs on different port (React: 3001, etc)
   * - Need permission to call gateway (http://localhost:3000)
   * - Allow multiple origins for testing
   */
  app.enableCors({
    origin: [
      'http://localhost:3001',      // React dev server
      'http://localhost:3000',      // Current gateway
      'http://localhost:4200',      // Angular
      'http://localhost:8080',      // Vue
      process.env.FRONTEND_URL || '*',  // Production
    ],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
  });

  /**
   * Port configuration
   * 
   * TẠI SAO từ environment?
   * - Development: 3000 (default)
   * - Docker: read from container env
   * - Production: custom port
   */
  const port = process.env.GATEWAY_PORT || 3000;
  const nodeEnv = process.env.NODE_ENV || 'development';

  await app.listen(port);

  /**
   * Startup message
   * 
   * TẠI SAO detailed logging?
   * - Know server started
   * - See all connected services
   * - Monitor health
   */
  logger.log(`🚀 API Gateway running on port ${port}`);
  logger.log(`📡 Environment: ${nodeEnv}`);
  logger.log(`📋 Services:`);
  logger.log(`   - Auth Service: http://auth-service:3001`);
  logger.log(`   - Product Service: http://product-service:3002`);
  logger.log(`   - Order Service: http://order-service:3003`);
  logger.log(`   - Payment Service: http://payment-service:3004`);
  logger.log(`   - Notification Service: http://notification-service:3006`);
  logger.log(`\n🌐 Access gateway at: http://localhost:${port}`);
  logger.log(`📍 Full docs: http://localhost:${port}/api\n`);
}

bootstrap().catch(err => {
  console.error('❌ Failed to start API Gateway:', err);
  process.exit(1);
});