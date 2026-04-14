import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Tree } from "typeorm";


@Entity('event_store')
export class EventStore{
    @PrimaryGeneratedColumn('uuid')
    id:string;


    @Column()
    aggregatedId:string;


    @Column()
    aggregateType:string;

    @Column()
    eventType:string;
    

    @Column('jsonb')
    data:any;

    @Column({default:1})
    version:number;

    @CreateDateColumn()
    timestamp:Date;

    @Column('jsonb',{nullable:true})
    metadata:any;
}