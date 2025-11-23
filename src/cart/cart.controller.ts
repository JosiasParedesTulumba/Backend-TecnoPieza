import { Controller, Get, Post, Body, Param, Delete, Put, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { CartService } from './cart.service';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { AddItemToCartDto } from './dto/add-item-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Request() req): Promise<Cart> {
    const userId = req.user.userId; // El ID del usuario viene del JWT
    return this.cartService.getCart(userId);
  }

  @Post('items')
  async addItem(@Request() req, @Body() addItemDto: AddItemToCartDto): Promise<CartItem> {
    const userId = req.user.userId;
    return this.cartService.addItem(userId, addItemDto);
  }

  @Put('items/:itemId')
  async updateItem(
    @Request() req,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() updateDto: UpdateCartItemDto
  ): Promise<CartItem> {
    const userId = req.user.userId;
    return this.cartService.updateItem(userId, itemId, updateDto);
  }

  @Delete('items/:itemId')
  async removeItem(@Request() req, @Param('itemId', ParseIntPipe) itemId: number): Promise<void> {
    const userId = req.user.userId;
    await this.cartService.removeItem(userId, itemId);
  }

  @Delete()
  async clearCart(@Request() req): Promise<void> {
    const userId = req.user.userId;
    await this.cartService.clearCart(userId);
  }
}

