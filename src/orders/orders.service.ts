import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
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
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
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
      const producto = await this.productRepository.findOne({
        where: { id: cartItem.producto.id }
      });

      if (!producto) {
        throw new NotFoundException(`Producto no encontrado`);
      }

      // Crear ítem del pedido
      const orderItem = this.orderItemRepository.create({
        producto_id: producto.id,
        nombre_producto: producto.nombre,
        cantidad: cartItem.cantidad,
        precio_unitario: producto.precio,
      });

      orderItems.push(orderItem);
      montoTotal += producto.precio * cartItem.cantidad;
    }

    // Crear el pedido
    const order = this.orderRepository.create({
      usuario_id: userId,
      monto_total: montoTotal,
      estado: OrderStatus.PROCESANDO,
      items: orderItems,
    });

    const savedOrder = await this.orderRepository.save(order);

    // Vaciar el carrito
    await this.cartService.clearCart(userId);

    // Retornar el pedido con sus items
    return this.findOne(savedOrder.id);
  }

  private buildVariationDetails(): string | null {
    // No se utiliza en este ejemplo ya que eliminamos las variaciones
    return null;
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

