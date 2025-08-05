import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRequest } from '../interfaces/user.interface';
import { Config } from '../schemas/config.schema';
import { TokenPayload, tokenPayloadSchema } from '../schemas/token.schema';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService<Config, true>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<UserRequest>();

    const headerKey = this.config.get<Config['auth']>('auth').gatewayJwtHeader;
    const token = request.headers[headerKey]?.toString();
    if (!token) {
      Logger.error(
        `AuthGuard: No token found in header ${headerKey}`,
        'AuthGuard',
      );
      throw new UnauthorizedException('Invalid token');
    }

    const secret = this.config.get<Config['auth']>('auth').gatewayJwtSecret;

    const verifiedToken = await this.jwtService
      .verifyAsync<TokenPayload>(token, {
        secret,
      })
      .catch(() => {
        Logger.error(`AuthGuard: Invalid token`, 'AuthGuard');
        throw new UnauthorizedException('Invalid token');
      });

    const parsedTokenPayload = await tokenPayloadSchema.safeParseAsync({
      uuid: verifiedToken.uuid,
    });

    if (!parsedTokenPayload.success) {
      Logger.error(
        `AuthGuard: Invalid token payload ${JSON.stringify(
          parsedTokenPayload.error,
        )}`,
        'AuthGuard',
      );
      throw new UnauthorizedException('Invalid token');
    }

    // Set the user object to the request object
    request.user = {
      uuid: parsedTokenPayload.data.uuid,
    };
    return true;
  }
}
