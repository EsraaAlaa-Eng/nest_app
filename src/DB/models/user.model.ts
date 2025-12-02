import { MongooseModule, Prop, Schema, SchemaFactory, Virtual } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { generateHash, IProduct, IUser } from "src/common";
import { GenderEnum, languageEnum, ProviderEnum, RoleEnum } from "src/common/enums";
import { OtpDocument } from "./otp.model";

//new Schema ({property },{optional})
@Schema({ strictQuery: true, timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class User implements IUser {

    //property
    @Prop({
        type: String,
        required: true,
        minLength: 2,
        maxLength: 25,
        trim: true
    })
    firstName: string;

    @Prop({
        type: String,
        required: true,
        minLength: 2,
        maxLength: 25,
        trim: true
    })
    lastName: string;

    @Prop({
        type: String,
        required: true,
        unique: true,
    })
    email: string;

    @Prop({
        type: Date,
        required: false,
    })
    confirmEmail: Date;


    @Prop({
        type: String,
        required: function (this: User) {
            return this.provider === ProviderEnum.GOOGLE ? false : true
        }
    })
    password: string;


    @Prop({
        type: String,
        enum: ProviderEnum,
        default: ProviderEnum.SYSTEM,

    })
    provider: ProviderEnum

    @Prop({
        type: String,
        enum: RoleEnum,
        default: RoleEnum.user,

    })
    role: RoleEnum


    @Prop({
        type: String,
        enum: GenderEnum,
        default: GenderEnum.female
    })
    gender: GenderEnum;


    @Prop({
        type: Date,
        required: false,
    })
    changeCredentialsTime: Date;


    @Prop({ type: Date })
    confirmAt: Date;



    @Virtual({
        get: function (this: User) {
            return this.firstName + ' ' + this.lastName;
        },
        set: function (value: string) {
            const [firstName, lastName] = value.split(' ') || [];

            this.firstName = firstName;
            this.lastName = lastName;
            // this.set()

        }

    })
    username: string;

    @Virtual()
    otp: OtpDocument[];


    @Prop({
        type: String,
        enum: languageEnum,
        default: languageEnum.EN
    })
    PreferredLanguage: languageEnum;

    
    @Prop({ type: String })
    profilePicture: string

    @Prop({type:[{type:Types.ObjectId,ref:"Product"}]})
    wishList?: Types.ObjectId[] ;

}

//mongoose schema
const userSchema = SchemaFactory.createForClass(User);
export type UserDocument = HydratedDocument<User>


//list for all  the otp with user => for when do find it back user with his otp
userSchema.virtual('otp', {
    localField: "_id",
    foreignField: "createdBy",
    ref: "Otp",
})

//Hooks
userSchema.pre('save', async function (next) {

    if (this.isModified('password')) {
        this.password = await generateHash(this.password)
    }
    next()
})


export const UserModel = MongooseModule.forFeature([
    { name: User.name, schema: userSchema }
]);

