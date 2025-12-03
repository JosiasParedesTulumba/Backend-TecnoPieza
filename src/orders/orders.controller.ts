import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post()
  async create(@Request() req, @Body() createOrderDto: CreateOrderDto): Promise<Order> {
    const userId = req.user.userId;
    console.log('🆕 POST /orders - userId:', userId);
    return this.ordersService.create(userId, createOrderDto);
  }

  @Get()
  async findAll(@Request() req): Promise<Order[]> {
    const userId = req.user.userId;
    console.log('📦 GET /orders - userId:', userId);
    return this.ordersService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id', ParseIntPipe) id: number): Promise<Order> {
    const userId = req.user.userId;
    const order = await this.ordersService.findOne(id);

    // Verificar que el pedido pertenece al usuario
    if (order.usuario_id !== userId) {
      throw new NotFoundException('Pedido no encontrado');
    }

    return order;
  }

  @Put(':id/status')
  async updateStatus(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateOrderStatusDto
  ): Promise<Order> {
    const userId = req.user.userId;
    return this.ordersService.updateStatus(id, updateDto, userId);
  }

  @Delete(':id')
  async cancelOrder(@Request() req, @Param('id', ParseIntPipe) id: number): Promise<Order> {
    const userId = req.user.userId;
    return this.ordersService.cancelOrder(id, userId);
  }
}

