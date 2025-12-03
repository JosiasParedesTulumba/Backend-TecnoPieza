import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post()
  async create(@Body() product: CreateProductDto): Promise<Product> {
    return this.productsService.create(product);
  }

  @Get()
  async findAll(@Query('search') searchTerm: string): Promise<Product[]> {
    return this.productsService.findAll(searchTerm);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() product: Product): Promise<void> {
    await this.productsService.update(id, product);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    await this.productsService.remove(id);
  }
}