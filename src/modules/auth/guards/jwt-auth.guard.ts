import { AuthService } from './../auth.service';
import { CanActivate, ExecutionContext, Inject, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { ERROR_MESSAGES } from 'src/common/messages';
import { TOKEN_TYPE } from '../constants';

export class JwtAuthGuard implements CanActivate {
  constructor(@Inject(AuthService) private authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    return this.validateRequest(request);
  }

  async validateRequest(request: Request): Promise<boolean> {
    try {
      const token = this.extractTokenFromHeader(request);

      if (!token) {
        throw new UnauthorizedException(ERROR_MESSAGES.TOKEN_INVALID);
      }

      const payload = await this.authService.verifyToken(token, TOKEN_TYPE.ACCESS_TOKEN);

      if (!payload) {
        throw new UnauthorizedException(ERROR_MESSAGES.TOKEN_INVALID);
      }

      request['user'] = payload;
      request['role'] = await this.authService.getRoleByUserId(payload.sub);

      return true;
    } catch (error) {
      console.log('🚀 ~ error:', error);
      throw new UnauthorizedException(ERROR_MESSAGES.TOKEN_INVALID);
    }
  }

  extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer' ? token : undefined;
  }
}
