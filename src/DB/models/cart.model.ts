import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

import { ICart, ICartProduct } from "src/common/interfaces/cart.interfaces ";


//listed schema OR subDocument
@Schema({ timestamps: true, strictQuery: true })
export class CartProduct implements ICartProduct {

    @Prop({ type: Types.ObjectId, ref: "Product", required: true })
    productId: Types.ObjectId

    @Prop({ type: Number, required: true, default: 0 })
    quantity: number;






}


@Schema({ timestamps: true, strictQuery: true })
export class Cart implements ICart {

    @Prop({ type: Types.ObjectId, ref: "User", required: true })
    createdBy: Types.ObjectId;

    @Prop([CartProduct])
    products: ICartProduct[];


}

export type CartProductDocument = HydratedDocument<Cart>
export type CartDocument = HydratedDocument<Cart>

const cartSchema = SchemaFactory.createForClass(Cart);

cartSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 })





export const CartModel = MongooseModule.forFeature([{ name: Cart.name, schema: cartSchema }])