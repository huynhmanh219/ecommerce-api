import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { Order } from './entities/order.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { JwtStrategy } from '@ecommerce/shared';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.local',
    }),

    // Database - Order Service's own database
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'postgres-order',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'order_db',  // ← Order DB only!
      entities: [Order],                             // ← Order entities only!
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
    }),

    TypeOrmModule.forFeature([Order]),

    // For calling other services (Product, Payment)
    HttpModule,

    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: (process.env.JWT_EXPIRY || 24*60*60) as number    },
    }),

    PassportModule,
  ],

  controllers: [OrderController],
  providers: [OrderService, JwtStrategy],
  exports: [OrderService],
})
export class AppModule {}