import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { ProductVariation } from '../product-variations/entities/product-variation.entity';
import { CartService } from '../cart/cart.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(ProductVariation)
    private readonly variationRepository: Repository<ProductVariation>,
    private readonly cartService: CartService,
  ) {}

  async create(userId: number, createOrderDto: CreateOrderDto): Promise<Order> {
    // Obtener el carrito del usuario
    const cart = await this.cartService.getCart(userId);

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    // Calcular el monto total
    let montoTotal = 0;
    const orderItems: OrderItem[] = [];

    for (const cartItem of cart.items) {
      const variation = cartItem.variacion;
      const producto = variation.producto;

      // Verificar inventario
      if (variation.inventario < cartItem.cantidad) {
        throw new BadRequestException(
          `No hay suficiente inventario para ${producto.nombre}`
        );
      }

      const subtotal = Number(variation.precio) * cartItem.cantidad;
      montoTotal += subtotal;

      // Crear item del pedido
      const orderItem = this.orderItemRepository.create({
        sku_comprado: variation.sku,
        nombre_producto: producto.nombre,
        detalles_variacion: this.buildVariationDetails(variation),
        cantidad: cartItem.cantidad,
        precio_unitario: Number(variation.precio)
      });

      orderItems.push(orderItem);
    }

    // Crear el pedido
    const order = this.orderRepository.create({
      usuario_id: userId,
      monto_total: montoTotal,
      estado: OrderStatus.PROCESANDO,
      items: orderItems
    });

    const savedOrder = await this.orderRepository.save(order);

    // Actualizar inventario y limpiar carrito
    for (const cartItem of cart.items) {
      const variation = cartItem.variacion;
      variation.inventario -= cartItem.cantidad;
      await this.variationRepository.save(variation);
    }

    await this.cartService.clearCart(userId);

    // Retornar el pedido con sus items
    return this.findOne(savedOrder.id);
  }

  private buildVariationDetails(variation: any): string | null {
    const details: string[] = [];
    if (variation.color) details.push(`Color: ${variation.color}`);
    if (variation.capacidad) details.push(`Capacidad: ${variation.capacidad}`);
    if (variation.potencia) details.push(`Potencia: ${variation.potencia}`);
    return details.length > 0 ? details.join(', ') : null;
  }

  async findAll(userId: number): Promise<Order[]> {
    return await this.orderRepository.find({
      where: { usuario_id: userId },
      relations: ['items'],
      order: { creado_el: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'usuario']
    });

    if (!order) {
      throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
    }

    return order;
  }

  async updateStatus(id: number, updateDto: UpdateOrderStatusDto, userId: number): Promise<Order> {
    const order = await this.findOne(id);

    // Verificar que el pedido pertenece al usuario
    if (order.usuario_id !== userId) {
      throw new NotFoundException('Pedido no encontrado');
    }

    order.estado = updateDto.estado;
    return await this.orderRepository.save(order);
  }

  async cancelOrder(id: number, userId: number): Promise<Order> {
    const order = await this.findOne(id);

    if (order.usuario_id !== userId) {
      throw new NotFoundException('Pedido no encontrado');
    }

    if (order.estado === OrderStatus.ENTREGADO) {
      throw new BadRequestException('No se puede cancelar un pedido ya entregado');
    }

    if (order.estado === OrderStatus.CANCELADO) {
      throw new BadRequestException('El pedido ya está cancelado');
    }

    order.estado = OrderStatus.CANCELADO;
    return await this.orderRepository.save(order);
  }
}

