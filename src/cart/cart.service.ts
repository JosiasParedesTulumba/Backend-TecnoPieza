import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { AddItemToCartDto } from './dto/add-item-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @Inject(forwardRef(() => ProductsService))
    private readonly productsService: ProductsService,
  ) { }

  // Archivo: src/cart/cart.service.ts

  async getOrCreateCart(userId: number): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { usuario: { id: userId } },
      relations: ['items', 'items.producto']
    });

    if (!cart) {
      cart = this.cartRepository.create({ usuario: { id: userId } });
      cart = await this.cartRepository.save(cart);

      // --- LA CORRECCIÓN ESTÁ AQUÍ ---
      // Después de crear un carrito, nos aseguramos de que
      // su lista de items sea un array vacío.
      cart.items = [];
    }

    return cart;
  }

  async getCart(userId: number): Promise<Cart> {
    // En lugar de lanzar error, crear carrito si no existe
    return this.getOrCreateCart(userId);
  }

  async addItem(userId: number, addItemDto: AddItemToCartDto): Promise<Cart> {
    const { producto_id, cantidad } = addItemDto;

    // Verificar que el producto existe
    const producto = await this.productsService.findOne(producto_id);

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    const cart = await this.getOrCreateCart(userId);

    // Verificar si el producto ya está en el carrito
    const existingItem = cart.items.find(item => item.producto.id === producto_id);

    if (existingItem) {
      // Actualizar cantidad si ya existe
      existingItem.cantidad += cantidad;
      await this.cartItemRepository.save(existingItem);
    } else {
      // Crear nuevo ítem
      const newItem = this.cartItemRepository.create({
        carrito: cart,
        producto: producto,
        cantidad,
      });
      await this.cartItemRepository.save(newItem);
      cart.items.push(newItem);
    }

    return this.getCart(userId);
  }

  async updateItem(userId: number, itemId: number, updateDto: UpdateCartItemDto): Promise<Cart> {
    const item = await this.cartItemRepository.findOne({
      where: { id: itemId },
      relations: ['carrito', 'carrito.usuario'] // Cargar también la relación usuario
    });

    if (!item) {
      throw new NotFoundException('Ítem no encontrado en el carrito');
    }

    // Verificar que el carrito pertenece al usuario
    if (item.carrito.usuario.id !== userId) {
      throw new BadRequestException('No tienes permiso para modificar este carrito');
    }

    if (updateDto.cantidad !== undefined) {
      if (updateDto.cantidad <= 0) {
        // Si la cantidad es 0 o menor, eliminar el ítem
        return this.removeItem(userId, itemId);
      }

      item.cantidad = updateDto.cantidad;
      await this.cartItemRepository.save(item);
    }

    return this.getCart(userId);
  }

  async removeItem(userId: number, itemId: number): Promise<Cart> {
    const item = await this.cartItemRepository.findOne({
      where: { id: itemId },
      relations: ['carrito', 'carrito.usuario'] // Cargar también la relación usuario
    });

    if (!item) {
      throw new NotFoundException('Ítem no encontrado en el carrito');
    }

    // Verificar que el carrito pertenece al usuario
    if (item.carrito.usuario.id !== userId) {
      throw new BadRequestException('No tienes permiso para modificar este carrito');
    }

    await this.cartItemRepository.remove(item);
    return this.getCart(userId);
  }

  async clearCart(userId: number): Promise<void> {
    const cart = await this.getCart(userId);
    await this.cartItemRepository.remove(cart.items);
  }
}
