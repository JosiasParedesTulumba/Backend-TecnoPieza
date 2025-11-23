import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVariation } from './entities/product-variation.entity';
import { CreateProductVariationDto } from './dto/create-product-variation.dto';
import { UpdateProductVariationDto } from './dto/update-product-variation.dto';

@Injectable()
export class ProductVariationsService {
  constructor(
    @InjectRepository(ProductVariation)
    private readonly variationRepository: Repository<ProductVariation>,
  ) {}

  async create(createDto: CreateProductVariationDto): Promise<ProductVariation> {
    const variation = this.variationRepository.create(createDto);
    return await this.variationRepository.save(variation);
  }

  async findAll(): Promise<ProductVariation[]> {
    return await this.variationRepository.find({ relations: ['producto'] });
  }

  async findByProductId(productId: number): Promise<ProductVariation[]> {
    return await this.variationRepository.find({
      where: { producto_id: productId },
      relations: ['producto']
    });
  }

  async findOne(id: number): Promise<ProductVariation> {
    const variation = await this.variationRepository.findOne({
      where: { id },
      relations: ['producto']
    });
    if (!variation) {
      throw new NotFoundException(`Variación con ID ${id} no encontrada`);
    }
    return variation;
  }

  async update(id: number, updateDto: UpdateProductVariationDto): Promise<ProductVariation> {
    const variation = await this.findOne(id);
    Object.assign(variation, updateDto);
    return await this.variationRepository.save(variation);
  }

  async remove(id: number): Promise<void> {
    const result = await this.variationRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Variación con ID ${id} no encontrada`);
    }
  }
}

