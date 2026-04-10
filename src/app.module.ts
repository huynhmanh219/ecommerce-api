import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { User } from '@ecommerce/shared';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal:true,
      envFilePath:'.env.local',
    }),

    TypeOrmModule.forRoot({
      type:'postgres',
      host: process.env.DB_HOST || 'postgres-auth',
      //docker network hostname
      port: Number(process.env.DB_PORT) || 5432,
      username:process.env.DB_USERNAME || 'postgres',
      password:process.env.DB_PASSWORD || 'password',
      database:process.env.DB_NAME || 'auth_db',
      entities:[User],
      synchronize:process.env.NODE_ENV !== 'production',
      logging:process.env.NODE_ENV === 'development'
    }),

    TypeOrmModule.forFeature([User]),

    JwtModule.register({
      secret:process.env.JWT_SECRET || "22-11-1999",
      signOptions:{
        expiresIn: (process.env.JWT_EXPIRY || 24*60*60) as number
      }
    }),
    PassportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
