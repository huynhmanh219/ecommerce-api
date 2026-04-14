import { Module } from '@nestjs/common';
import * as winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';

@Module({
    providers: [{
        provide: "LOGGER",
        useFactory: () => {
            const esTransport = new ElasticsearchTransport({
                level: "info",
                clientOpts: {
                    node: `http://${process.env.ELASTICSEARCH_HOST || 'elasticsearch'}:9200`,
                },
                index: "ecommerce-logs",
            });
            return winston.createLogger({
                format: winston.format.json(),
                transports: [
                    new winston.transports.Console(),
                    esTransport
                ]
            });
        }
    }],
    exports: ["LOGGER"]
})
export class LoggerModule {}