import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum PaymentStatus{
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
    REFUNDED = 'refunded'
}


@Entity('payments')
@Index(['orderId'])
@Index(['userId'])
export class Payment{
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column()
    orderId:string;

    @Column()
    userId:string;

    @Column('decimal',{precision:10,scale:2})
    amount:number

    @Column({
        type:'enum',
        enum:PaymentStatus,
        default:PaymentStatus.PENDING
    })
    status:PaymentStatus;
    
    @Column({nullable:true})
    transactionId:string;

    @Column({nullable:true})
    failureReason:string;

    @CreateDateColumn()
    createAt:Date;

    @UpdateDateColumn()
    updatedAt:Date;


}