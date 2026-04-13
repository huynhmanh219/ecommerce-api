import { InjectRepository } from "@nestjs/typeorm";
import { Category, Product } from "./entities/product.entity";
import { Repository } from "typeorm";
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';


@Injectable()
export class ProductService{
    constructor(
        @InjectRepository(Product)
        private productRepository: Repository<Product>,

        @InjectRepository(Category)
        private categoryRepository: Repository<Category>
    ){}

    async createProduct(data:{
        name:string;
        description:string;
        price:number;
        stock:number;
        categoryId:string;
        image?:string;
        sku?:string;
    }):Promise<Product>{
        const category = await this.categoryRepository.findOne({where:{id:data.categoryId}});
        if(!category){
            throw new BadRequestException('Invalid category ID');
        }
        const product = this.productRepository.create(data);
        return this.productRepository.save(product);
    }

    async getProducts(
        filter:{
            page?:number;
            limit?:number;
            categoryId?:string;
            minPrice?:number;
            maxPrice?:number;
            search?:string;
            sortBy?:'price'|'rating'|'newest';
        }
    ):Promise<{products:Product[], total:number}>{
        const page = filter.page || 1;
        const limit = filter.limit || 10;
        const skip = (page - 1) * limit;

        let query = this.productRepository.createQueryBuilder('p');

        if(filter.categoryId){
            query = query.where('p.categoryId = :categoryId',{
                categoryId:filter.categoryId
            });
        }

        if(filter.minPrice !== undefined || filter.maxPrice !== undefined){
            query = query.andWhere('p.price BETWEEN :min AND :max',{
                min:filter.minPrice ||0,
                max: filter.maxPrice || 999999
        });
        }

        if(filter.search){
            query = query.andWhere('p.name ILIKE :search OR p.description ILIKE :search',
                {search: `%${filter.search}%`}
            );
        }

        query = query.andWhere('p.isActive = true');

        if(filter.sortBy === 'price'){
            query = query.orderBy('p.price','ASC');
        }else if(filter.sortBy === 'rating'){
            query = query.orderBy('p.rating','DESC');
        }else{
            query = query.orderBy('p.createdAt','DESC');
        }

        const [products,total] = await query.skip(skip).take(limit).getManyAndCount();
        return {products,total};
    }

    async getProductById(id:string):Promise<Product>{
        const product = await this.productRepository.findOne({where:{id}})
        if(!product){
            throw new NotFoundException('Product not found');
        }
        return product;
    }

    async getProductsByIds(ids:string[]):Promise<Product[]>{
        return this.productRepository.findByIds(ids);
    }

    async reserveStock(productId:string,quantity:number):Promise<boolean>{
        const product = await this.getProductById(productId)
        
        if(product.stock < quantity){
            return false;
        }

        product.stock -= quantity;
        await this.productRepository.save(product);
        return true;
    }

    async releaseStock(productId:string,quantity:number):Promise<void>{
        const product = await this.getProductById(productId);
        product.stock += quantity;
        await this.productRepository.save(product);
    }

    async updateProductRating(
        productId:string,
        averageRating:number,
        reviewCount:number
    ):Promise<void>{
        const product = await this.getProductById(productId);
        product.rating - averageRating;
        product.reviewCount = reviewCount;
        await this.productRepository.save(product);
    }
}