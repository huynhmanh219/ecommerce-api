

import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';

export enum UserRole{
    ADMIN = 'admin',
    CUSTOMER = 'customer',
    SELLER = 'seller'
}

type User_type={
    id:string
}


@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    @IsEmail()
    email: string;

    @Column()
    password: string;

    @Column()
    @IsNotEmpty()
    firstName:string
    
    @Column()
    @IsNotEmpty()
    lastName:string

    @Column({
        type:'enum',
        enum:UserRole,
        default:UserRole.CUSTOMER
    })
    @IsEnum(UserRole)
    role: UserRole;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ nullable: true })
    lastLogin?: Date;
    
}