import { Controller, Get, Headers, MaxFileSizeValidator, Param, ParseFilePipe, Patch, Req, UploadedFile, UseInterceptors } from "@nestjs/common";
import { UserService } from "./user.services";
import * as common from "src/common";
import { Auth } from "src/common/decorators/auth.decorators";
import type { UserDocument } from "src/DB";
import { PreferredLanguageInterceptor } from "src/common/interceptors";
import { delay, Observable, of } from "rxjs";
import { FileInterceptor } from "@nestjs/platform-express";
import { cloudFileUpload, fileValidation, localFileUpload } from "src/common/utils/multer";
import { IResponse, IUser, RoleEnum, StorageEnum, successResponse, User, type IMulterFile } from "src/common";
import { promises } from "dns";
import { profileResponse } from "./entity/user.entity";



@Controller('user')
export class UserController {

  constructor(
    private readonly userService: UserService
  ) { }

  @UseInterceptors(PreferredLanguageInterceptor)
  @Auth([common.RoleEnum.admin, common.RoleEnum.user])
  @Get('profile')
  Profile(
    @Headers() header: any,
    @common.User()
    user: UserDocument
  ):
    Observable<any> {
    console.log({
      hang: header['accept-language'],
      user
    });

    return of([{ message: 'Done' }]).pipe(delay(200))
  }

  @UseInterceptors(
    FileInterceptor(
      'profileImage',
      cloudFileUpload({
        storageApproach: StorageEnum.disk,
        validation: fileValidation.image,
        fileSize: 2,
      })))


  @Auth([RoleEnum.user])
  @Patch('profile-image')
  async ProfileImage( //name in format data
    @User() user: UserDocument,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 })],
        fileIsRequired: true
      })
    )
    file: Express.Multer.File
  ): Promise<IResponse<profileResponse>> {
    const profile = await this.userService.ProfileImage(file, user)
    return successResponse<profileResponse>({ data: { profile } })
  }






}
