import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types, UpdateQuery } from "mongoose";
import slugify from "slugify";
import { IBrand, IUser } from "src/common";


@Schema({ timestamps: true, strictQuery: true })
export class Brand implements IBrand {


    @Prop({ type: String, required: true, unique: true, minlength: 2, maxlength: 25 })
    name: string;

    @Prop({ type: String, unique: true, minlength: 2, maxlength: 50 })
    slug: string;

    @Prop({ type: String, required: true, unique: true, minlength: 2, maxlength: 25 })
    slogan: string;

    @Prop({ type: String, required: true })
    image: string;


    @Prop({ type: Types.ObjectId, required: true, ref: "User" })
    createdBy: Types.ObjectId | IUser

    @Prop({ type: Types.ObjectId, ref: "User" })
    updatedBy: Types.ObjectId | IUser

    @Prop({ type: Date })
    freezedAt?: Date;
    @Prop({ type: Date })
    restoredAt?: Date;

}

export type BrandDocument = HydratedDocument<Brand>
const brandSchema = SchemaFactory.createForClass(Brand);

brandSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 })




brandSchema.pre("save", async function (next) {
    if (this.isModified('name')) {
        this.slug = slugify(this.name)

    }
    next()
})



//update hook
brandSchema.pre(['updateOne', 'findOneAndUpdate'], async function (next) {

    const update = this.getUpdate() as UpdateQuery<BrandDocument>;
    if (update.name) {
        this.setUpdate({
            ...update, slug: slugify(update.name)
        })
    }
    //soft dele
    const query = this.getQuery();
    if (query.paranoId === false) { //all brand

        this.setQuery({ ...query });  //update all
    }
    else { //All Brand exception HD && SD 
        this.setQuery({
            ...query,
            freezedAt: { $exists: false } //update all (only not freezed)
        })
    }

    next()
})





brandSchema.pre(['findOne', 'find'], async function (next) {
    //before reade
    const query = this.getQuery();
    if (query.paranoId === false) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ ...query, freezedAt: { $exists: false } })
    }


    next()
})





export const BrandModel = MongooseModule.forFeature([{ name: Brand.name, schema: brandSchema }])