import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ProductModule } from "./product.module";



@Controller("api/v1/products")
export class ProductsController{
    constructor(private readonly productService: ProductModule){}

    @Get()
    findAll(){
        return this.productService.findAll();
    }

    @Post()
    create(@Body() createProductDto: CreateProductDto){
        return this.productService.create(createProductDto);
    }

    @Patch(":id")
    update(
        @Param("id") id: string
        @Body() updateProductDto: UpdateProductDto,
    ){
        return this.productService.update(id,updateProductDto);
    }

    @Delete(":id")
    remove(@Param('id') id:string){
        return this.productService.remove(id);
    }
}
