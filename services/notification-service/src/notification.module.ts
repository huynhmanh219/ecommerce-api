// import { Module } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';
// import { RabbitModule } from '@golevelup/nestjs-rabbitmq';

// import { NotificationService } from './notification.service';

// @Module({
//   imports: [
//     ConfigModule.forRoot({
//       isGlobal: true,
//       envFilePath: '.env.local',
//     }),

//     // RabbitMQ for subscribing to events
//     RabbitModule.forRoot(RabbitModule, {
//       exchanges: [
//         {
//           name: 'ecommerce.exchange',
//           type: 'topic',
//         },
//       ],
//       uri: `amqp://${process.env.RABBITMQ_USER || 'guest'}:${process.env.RABBITMQ_PASSWORD || 'guest'}@${process.env.RABBITMQ_HOST || 'rabbitmq'}:5672`,
//     }),
//   ],

//   providers: [NotificationService],
// })
// export class AppModule {}