import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, Res } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { RemoveItemsFromCartDto, UpdateCartDto } from './dto/update-cart.dto';
import { Auth, IResponse, RoleEnum, successResponse, User } from 'src/common';
import { type UserDocument } from 'src/DB';
import { CartResponse } from './entities/cart.entity';
import type { Response } from "express"
import { date } from 'zod';

@Auth([RoleEnum.user])
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('cart')
export class CartController {
  constructor(
    private readonly cartService: CartService
  ) { }


  @Post()
  async create(
    @User() user: UserDocument,
    @Body() createCartDto: CreateCartDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<IResponse<CartResponse>> {
    const { cart, status } = await this.cartService.create(createCartDto, user);
    res.status(status)
    return successResponse<CartResponse>({ status, data: { cart } })
  }


  @Patch("remove-from-cart")
  async removeFromCart(
    @User() user: UserDocument,
    @Body() removeItemsFromCartDto: RemoveItemsFromCartDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<IResponse<CartResponse>> {
    const cart = await this.cartService.removeItemFromCart(removeItemsFromCartDto, user);
    return successResponse<CartResponse>({ data: { cart } })
  }

  @Delete()
  async deleteCart(
    @User() user: UserDocument,

  ): Promise<IResponse> {
    await this.cartService.deleteCart(user)
    return successResponse<IResponse>()
  }


  @Get()
  async findOne(
    @User() user: UserDocument,
  ): Promise<IResponse> {
    const cart = await this.cartService.findOne(user)
    return successResponse<CartResponse>({ data: { cart } })
  }
}
