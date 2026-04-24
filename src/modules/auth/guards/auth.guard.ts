import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import {Request} from 'express';
import {TokenTypes} from '@entities/token.entity';
import {AUTH_COOKIES} from '@modules/auth/auth.constants';
import {AuthJwtPayload, AuthService} from '@modules/auth/auth.service';

type AuthenticatedRequest = Request & {
    user: AuthJwtPayload;
};

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly authService: AuthService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const token: string | undefined = req.cookies?.[AUTH_COOKIES[TokenTypes.ACCESS]];

        if (!token) {
            throw new UnauthorizedException('Access token not found');
        }

        const payload = await this.authService.validateToken(token, TokenTypes.ACCESS);

        if (!payload) {
            throw new UnauthorizedException('Invalid access token');
        }

        req.user = payload;

        return true;
    }
}
