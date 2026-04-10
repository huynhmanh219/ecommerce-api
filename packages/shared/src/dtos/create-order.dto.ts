import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsString, IsUUID, Min, ValidateNested } from "class-validator";


export class CreateOrderItemDto{
    @IsUUID()
    productId:string;

    @IsNotEmpty()
    @Min(1)
    quantity:number;

}

export class CreateOderDto{
    @IsArray()
    @ValidateNested({each:true})
    @Type(()=> CreateOrderItemDto)
    items:CreateOrderItemDto[];

    @IsString()
    @IsNotEmpty()
    shippingAddress:string;
}