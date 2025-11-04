import { MiddlewareConsumer, Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { PreAuth } from "src/common/middleware/authentication.middleware";
import { UserService } from "./user.services";
import { SharedAuthenticationModule } from "src/common/modules/auth.module";
import { UserRepository } from "src/DB";
import { MulterModule } from "@nestjs/platform-express";
import { S3Service } from "src/common";


@Module({
    imports: [SharedAuthenticationModule,
        MulterModule.register({
            // storage: diskStorage({
            //     destination(
            //         req: Request,
            //         file: Express.Multer.File,
            //         callback: Function
            //     ) {

            //         callback(null, './uploads')
            //     },
            //     filename(

            //         req: Request,
            //         file: Express.Multer.File,
            //         callback: Function
            //     ) {
            //         const fileName = randomUUID() + '_' + Date.now() + '_' + file.originalname;
            //         callback(null, fileName)

            //     }
            // })
        })
    ],
    controllers: [UserController],
    providers: [UserService, UserRepository,S3Service],
    exports: [],
})
export class UserModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(PreAuth).forRoutes(UserController)
    }
}