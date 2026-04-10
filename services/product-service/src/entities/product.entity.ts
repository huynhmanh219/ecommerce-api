import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


@Entity('categories')
export class Category{
    @PrimaryGeneratedColumn("uuid")
    id:string;

    @Column({unique:true})
    name:string;

    @Column()
    description:string;

    @CreateDateColumn()
    createdAt:Date;

    @UpdateDateColumn()
    updatedAt:Date;
}


@Entity('products')
@Index(["categoryId"])
@Index(["name","description"],{fulltext:true})
export class Product{
    @PrimaryGeneratedColumn("uuid")
    id:string;

    @Column()
    name:string;

    @Column()
    description:string;

    @Column('decimal',{precision:10,scale:2})
    price:number

    @Column({default:0})
    stock:number;

    @Column({nullable:true})
    sku:string;

    @ManyToOne(()=>Category,{eager:true})
    @JoinColumn({name:'categoryId'})
    category:Category;

    @Column()
    categoryId:string;

    @Column({nullable:true})
    image:string;
    @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
    rating: number;

    @Column({ default: 0 })
    reviewCount: number;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}