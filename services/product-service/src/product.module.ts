import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Category, Product } from './entities/product.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { JwtAuthGuard } from '../../auth-service/src/guards/jwt-auth.guard';
import { JwtStrategy } from '../../auth-service/src/strategies/jwt.strategy';


@Module({
    imports:[
        ConfigModule.forRoot({
            isGlobal:true,
            envFilePath:".env.local"
        }),

        TypeOrmModule.forRoot({
            type:"postgres",
            host: process.env.DB_HOST || 'postgres-product',
            port: parseInt(process.env.DB_PORT ?? "") || 5432,
            username: process.env.DB_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD || 'password',
            database: process.env.DB_NAME || 'product_db',
            entities:[Product,Category],
            synchronize: process.env.NODE_ENV !== 'production',
            logging: process.env.NODE_ENV === 'development'
        }),
        TypeOrmModule.forFeature([Product,Category]),
        JwtModule.register({
            secret:process.env.JWT_SECRET || "22-11-1999",
            signOptions:{
                expiresIn: (process.env.JWT_EXPIRY || 24*60*60) as number   
            }
        }),
        PassportModule,
    ],
    controllers:[ProductController],
    providers:[ProductService,JwtStrategy],
    exports:[ProductService]
})
export class AppModule{}