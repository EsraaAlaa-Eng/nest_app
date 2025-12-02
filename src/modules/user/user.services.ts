import { Injectable, NotFoundException } from "@nestjs/common";
import { url } from "inspector";
import { S3Service, StorageEnum } from "src/common";
import { Lean, ProductDocument, UserDocument, UserRepository } from "src/DB";
import { ProductParamsDto } from "../product/dto/update-product.dto";
import { Types } from "mongoose";
import { ProductRepository } from "src/DB/repository/product.repository";

@Injectable()
export class UserService {

    constructor(
        private readonly userRepository: UserRepository,
        private readonly productRepository: ProductRepository,

        private readonly s3Service: S3Service
    ) { }

    async Profile(data: any): Promise<string> {

        console.log(data);
        return data
    }

    async ProfileImage(
        file: Express.Multer.File,
        user: UserDocument
    ): Promise<UserDocument> {

        user.profilePicture = await this.s3Service.uploadFile({
            file,
            storageApproach: StorageEnum.disk,
            path: `user/${user._id.toString()}`
        })
        await user.save()

        return user;

    }


 

}