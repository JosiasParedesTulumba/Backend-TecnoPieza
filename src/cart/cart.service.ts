import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { ProductVariation } from '../product-variations/entities/product-variation.entity';
import { AddItemToCartDto } from './dto/add-item-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(ProductVariation)
    private readonly variationRepository: Repository<ProductVariation>,
  ) {}

  async getOrCreateCart(userId: number): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { usuario_id: userId },
      relations: ['items', 'items.variacion', 'items.variacion.producto']
    });

    if (!cart) {
      cart = this.cartRepository.create({ usuario_id: userId });
      cart = await this.cartRepository.save(cart);
    }

    return cart;
  }

  async getCart(userId: number): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { usuario_id: userId },
      relations: ['items', 'items.variacion', 'items.variacion.producto']
    });

    if (!cart) {
      throw new NotFoundException('Carrito no encontrado');
    }

    return cart;
  }

  async addItem(userId: number, addItemDto: AddItemToCartDto): Promise<CartItem> {
    // Verificar que la variación existe y tiene inventario
    const variation = await this.variationRepository.findOne({
      where: { id: addItemDto.variacion_id }
    });

    if (!variation) {
      throw new NotFoundException('Variación de producto no encontrada');
    }

    if (variation.inventario < addItemDto.cantidad) {
      throw new BadRequestException('No hay suficiente inventario');
    }

    // Obtener o crear carrito
    const cart = await this.getOrCreateCart(userId);

    // Verificar si el item ya existe en el carrito
    let cartItem = await this.cartItemRepository.findOne({
      where: {
        carrito_id: cart.id,
        variacion_id: addItemDto.variacion_id
      }
    });

    if (cartItem) {
      // Actualizar cantidad
      const newQuantity = cartItem.cantidad + addItemDto.cantidad;
      if (variation.inventario < newQuantity) {
        throw new BadRequestException('No hay suficiente inventario');
      }
      cartItem.cantidad = newQuantity;
      return await this.cartItemRepository.save(cartItem);
    } else {
      // Crear nuevo item
      cartItem = this.cartItemRepository.create({
        carrito_id: cart.id,
        variacion_id: addItemDto.variacion_id,
        cantidad: addItemDto.cantidad
      });
      return await this.cartItemRepository.save(cartItem);
    }
  }

  async updateItem(userId: number, itemId: number, updateDto: UpdateCartItemDto): Promise<CartItem> {
    const cart = await this.getCart(userId);
    
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId, carrito_id: cart.id },
      relations: ['variacion']
    });

    if (!cartItem) {
      throw new NotFoundException('Item del carrito no encontrado');
    }

    if (updateDto.cantidad <= 0) {
      throw new BadRequestException('La cantidad debe ser mayor a 0');
    }

    if (cartItem.variacion.inventario < updateDto.cantidad) {
      throw new BadRequestException('No hay suficiente inventario');
    }

    cartItem.cantidad = updateDto.cantidad;
    return await this.cartItemRepository.save(cartItem);
  }

  async removeItem(userId: number, itemId: number): Promise<void> {
    const cart = await this.getCart(userId);
    
    const result = await this.cartItemRepository.delete({
      id: itemId,
      carrito_id: cart.id
    });

    if (result.affected === 0) {
      throw new NotFoundException('Item del carrito no encontrado');
    }
  }

  async clearCart(userId: number): Promise<void> {
    const cart = await this.getCart(userId);
    await this.cartItemRepository.delete({ carrito_id: cart.id });
  }
}

