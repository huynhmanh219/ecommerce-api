import { Body, Controller, Get, Param, Post, Query, Request, UnauthorizedException, UseGuards } from "@nestjs/common";
import { ProductService } from "./product.service";
import { JwtAuthGuard } from "../../auth-service/src/guards/jwt-auth.guard";


@Controller('products')
export class ProductController{
    constructor(private productService:ProductService){}


    @Post()
    @UseGuards(JwtAuthGuard)
    async createProduct(@Body() data:any, @Request() req){
        if(req.user.role !== 'admin'){
            throw new UnauthorizedException('Only admin can create product');
        }
        return this.productService.createProduct(data);
    }

    @Get()
    async getProducts(
        @Query('page') page?:string,
        @Query('limit') limit?:string,
        @Query('categoryId') categoryId?:string,
        @Query('minPrice') minPrice?:string,
        @Query('maxPrice') maxPrice?:string,
        @Query('search') search?:string,
        @Query('sortBy') sortBy?:'price'|'rating'|'newest'
    ){
        return this.productService.getProducts({
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
            categoryId,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            search,
            sortBy
        });
    }

    @Get('id')
    async getProductById(@Query('id') id:string){
        return this.productService.getProductById(id);
    }

    @Post('batch/get-by-ids')
    async getProductsByIds(@Body('ids') ids: string[]){
        return this.productService.getProductsByIds(ids);
    }

    @Post(':id/reserve-stock')
    async reserveStock(
        @Param('id') id:string,
        @Body('quantity') quantity:number
    ){
        const success = await this.productService.reserveStock(id,quantity);
        return {success};
    }

    @Post(':id/release-stock')
    async releaseStock(
        @Param('id') id:string,
        @Body('quantity') quantity:number
    ){
        await this.productService.releaseStock(id,quantity);
        return {success:true};
    }

    @Get('health')
    health(){
        return {status:'ok',service:'product'};
    }

    

    
}