import { MiddlewareConsumer, Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { PreAuth } from "src/common/middleware/authentication.middleware";
import { UserService } from "./user.services";
import { SharedAuthenticationModule } from "src/common/modules/auth.module";
import { UserRepository } from "src/DB";



@Module({
    imports: [SharedAuthenticationModule],
    controllers: [UserController],
    providers: [ UserService,UserRepository ],
    exports: [],
})
export class UserModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(PreAuth).forRoutes(UserController)
    }
}