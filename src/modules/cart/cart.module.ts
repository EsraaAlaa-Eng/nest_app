import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { CartModel, CartRepository, ProductModel } from 'src/DB';
import { ProductRepository } from 'src/DB/repository/product.repository';

@Module({
  imports: [ProductModel, CartModel],
  controllers: [CartController],
  providers: [CartService, ProductRepository, CartRepository],
})
export class CartModule { }
