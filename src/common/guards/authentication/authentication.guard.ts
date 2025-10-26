import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { tokenName } from 'src/common/decorators/tokenType.decorator';
import { TokenEnum } from 'src/common/enums';
import { TokenServices } from 'src/common/service/token.service';

@Injectable()
export class AuthenticationGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: TokenServices,
  ) { }
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const tokenType: TokenEnum =
      this.reflector.getAllAndOverride<TokenEnum>(
        tokenName,
        [
          context.getHandler(),
          context.getClass(),
        ]
      ) ?? TokenEnum.access

    let req: any;
    let authorization: string = '';
    switch (context.getType()) {
      case 'http':

        const httpCtx = context.switchToHttp();
        req = httpCtx.getRequest();
        authorization = req.headers.authorization;

        break;

      // case 'rpc':
      //   const RPCtx = context.switchToRpc();
      //   break;

      // case 'ws':
      //   const WSCtx = context.switchToWs();
      //   break;

      default:
        break;
    }
    const { decoded, user } = await this.tokenService.decodeToken(
      {
        authorization,
        tokenType,
      }
    )

    req.credentials = { decoded, user }
    return true;
  }
}
