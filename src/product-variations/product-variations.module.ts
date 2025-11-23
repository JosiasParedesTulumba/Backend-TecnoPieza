import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductVariationsService } from './product-variations.service';
import { ProductVariationsController } from './product-variations.controller';
import { ProductVariation } from './entities/product-variation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductVariation])
  ],
  controllers: [ProductVariationsController],
  providers: [ProductVariationsService],
  exports: [ProductVariationsService],
})
export class ProductVariationsModule {}

