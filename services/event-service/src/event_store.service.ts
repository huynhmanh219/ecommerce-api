import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EventStore } from "./entities/event_store.entities";
import { Repository } from "typeorm";


@Injectable()
export class EventStoreService{
    constructor(
        @InjectRepository(EventStore)
        private eventStoreRepository: Repository<EventStore>
    ){}

    async storeEvent(
        aggregatedId:string,
        aggregateType:string,
        eventType:string,
        data:any,
        metadata?:any
    ):Promise<EventStore>{
        const event = this.eventStoreRepository.create({
            aggregatedId,
            aggregateType,
            eventType,
            data,
            metadata
        });
        return this.eventStoreRepository.save(event);
    }

    async getEventsByAggregateId(aggregatedId:string,aggregateType:string):Promise<EventStore[]>{
        return this.eventStoreRepository.find({
            where:{aggregatedId},
            order:{timestamp:"ASC"}
        })
    }

    async rebuildAggregate(
        aggregatedId:string,
        aggregateType:string,
    ):Promise<any>{
        const events = await this.getEventsByAggregateId(aggregatedId,aggregateType);

        let state = {
            id:aggregatedId,
            type:aggregateType,
            status:"created",
            history:[]
        }

        for (const event of events){
            state = this.applyEvent(state,event);
        }
        return state
    }

    private applyEvent(state:any,event:EventStore):any{
        switch (event.eventType) {
            case 'OrderCreated':
                return{
                    ...state,
                    status:"pending",
                    items:event.data.items,
                    totalPrice:event.data.totalPrice,
                }
            case 'PaymentProcessing':
                return {
                    ...state,
                    status:"payment_processing",
                    paymentId:event.data.paymentId
                };
            case 'PaymentCompleted':
                return{
                    ...state,
                    status:"completed",
                    paymentId:event.data.paymentId
                }
            case 'PaymentFailed':
                return {
                ...state,
                status: 'cancelled',
                failureReason: event.data.reason,
                };

            case 'OrderShipped':
                return {
                ...state,
                status: 'shipped',
                trackingNumber: event.data.trackingNumber,
                };

            case 'OrderDelivered':
                return {
                ...state,
                status: 'delivered',
                deliveredAt: event.data.deliveredAt,
                };

            default:
                return state; 
        }
    }


}