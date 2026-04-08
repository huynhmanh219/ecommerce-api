import { Injectable, Module } from "@nestjs/common";


@Module({
    controllers:[ProductController],
    providers:[ProductService],
    exports:[ProductService]
})


export class ProductModule{
    private product = [];
    private idCounter = 1;

    create(createProductDto: CreateProductDto){
        const product
    }
}