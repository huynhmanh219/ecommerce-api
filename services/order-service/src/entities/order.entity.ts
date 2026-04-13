import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum OrderStatus{
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled'
}


@Entity('orders')
@Index(['userId'])

@Index(['status'])
export class Order{
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column('jsonb')
    items:Array<{
        productId:string;
        quantity:number;
        price:number;
    }>

    @Column()
    userId:string;

    @Column('decimal',{precision:10,scale:2})
    totalPrice: number;

    @Column({
        type:'enum',
        enum:OrderStatus,
        default:OrderStatus.PENDING
    })
    status:OrderStatus;

    @Column()
    shippingAddress:string;

    @Column({nullable:true})
    paymentId:string

    @Column({nullable:true})
    paymentStatus:'pending' | 'completed' | 'failed';

    @CreateDateColumn()
    createdAt:Date;

    @UpdateDateColumn()
    updatedAt:Date;

}