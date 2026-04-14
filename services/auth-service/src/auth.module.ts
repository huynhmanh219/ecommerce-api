import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { User } from '@ecommerce/shared';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';



@Module({
    imports:[
        ConfigModule.forRoot({
            isGlobal:true,
            envFilePath:'.env.local'
        }),
    TypeOrmModule.forRoot({
        type:"postgres",
        host: process.env.DB_HOST || 'postgres-auth',
        port: parseInt(process.env.DB_PORT ?? "") || 5432,
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'auth_db',
        entities:[User],
        synchronize: process.env.NODE_ENV !== 'production',
        logging: process.env.NODE_ENV === 'development'
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
    controllers:[AuthController],
    providers:[AuthService,JwtStrategy],
    exports:[AuthService]
})
export class AppModule{}