import { Controller, Get, Post, Body, Param, Delete, Put, ParseIntPipe } from '@nestjs/common';
import { ProductVariationsService } from './product-variations.service';
import { ProductVariation } from './entities/product-variation.entity';
import { CreateProductVariationDto } from './dto/create-product-variation.dto';
import { UpdateProductVariationDto } from './dto/update-product-variation.dto';

@Controller('product-variations')
export class ProductVariationsController {
  constructor(private readonly variationsService: ProductVariationsService) {}

  @Post()
  async create(@Body() createDto: CreateProductVariationDto): Promise<ProductVariation> {
    return this.variationsService.create(createDto);
  }

  @Get()
  async findAll(): Promise<ProductVariation[]> {
    return this.variationsService.findAll();
  }

  @Get('product/:productId')
  async findByProduct(@Param('productId', ParseIntPipe) productId: number): Promise<ProductVariation[]> {
    return this.variationsService.findByProductId(productId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ProductVariation> {
    return this.variationsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateProductVariationDto
  ): Promise<ProductVariation> {
    return this.variationsService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.variationsService.remove(id);
  }
}

