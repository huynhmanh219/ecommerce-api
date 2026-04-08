import { Injectable } from "@nestjs/common";


@Injectable()
export class ProductService{
    private products = [];
    private idCounter = 1;

    create(createProductDto: CreateProductDto){
        
    }
}