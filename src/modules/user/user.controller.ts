import { Controller, Get, Headers, Req, UseInterceptors } from "@nestjs/common";
import { UserService } from "./user.services";
import { RoleEnum, User, } from "src/common";
import { Auth } from "src/common/decorators/auth.decorators";
import type { UserDocument } from "src/DB";
import { PreferredLanguageInterceptor } from "src/common/interceptors";
import { delay, Observable, of } from "rxjs";



@Controller('user')
export class UserController {

  constructor(
    private readonly userService: UserService
  ) { }

  @UseInterceptors(PreferredLanguageInterceptor)
  @Auth([RoleEnum.admin, RoleEnum.user])
  @Get('profile')
  Profile(
    @Headers() header: any,
    @User()
    user: UserDocument
  ):
    Observable<any> {
    console.log({
      hang: header['accept-language'],
      user
    });

    return of([{ message: 'Done' }]).pipe(delay(200))
  }
}
