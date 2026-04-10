import { NestFactory } from '@nestjs/core';
import 'reflect-metadata';
import { AppModule } from '../../../src/app.module';


async function bootstrap(){
    const app = await NestFactory.create(AppModule);

    //API prefix: /api/auth/login 
    app.setGlobalPrefix('api/auth');

    const port = process.env.PORT || 3000;
    await app.listen(port);

    console.log(`Auth Service is running on port ${port}`);
    console.log(`Database: ${process.env.DB_NAME || "auth_db"}`);
    
}

bootstrap().catch((err)=>{
    console.error('Error starting Auth Service:', err);
    process.exit(1);
});