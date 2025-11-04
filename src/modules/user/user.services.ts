import { Injectable } from "@nestjs/common";
import { url } from "inspector";
import { S3Service, StorageEnum } from "src/common";
import { UserDocument, UserRepository } from "src/DB";

@Injectable()
export class UserService {

    constructor(
        private readonly userRepository: UserRepository,
        private readonly s3Service: S3Service
    ) { }

    async Profile(data: any): Promise<string> {

        console.log(data);
        return `Done`
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