import {
    Body,
    Controller,
    Get,
    HttpCode, HttpStatus,
    Param,
    Post,
    Query,
    Req,
    Res,
    UnauthorizedException,
    UseGuards
} from '@nestjs/common';
import {Request, Response} from 'express'
import {AuthJwtPayload, AuthService, JWT_CONFIG} from './auth.service';

import {TokenTypes} from "@entities/token.entity";
import {LoginDto} from "@modules/auth/dto/login.dto";
import {RegisterDto} from "@modules/auth/dto/register.dto";
import {AUTH_COOKIES, AuthProvider} from '@modules/auth/auth.constants';
import {AuthGuard} from '@modules/auth/guards/auth.guard';
import {
    buildCookieOptions,
    clearAuthCookies,
    clearResetPasswordCookie,
    setAuthCookies,
    setResetPasswordCookie
} from '@modules/auth/utils/cookie';
import {ForgotPasswordDto} from '@modules/auth/dto/forgot-password.dto';
import {ResetPasswordDto} from '@modules/auth/dto/reset-password.dto';

type AuthenticatedRequest = Request & {
    user: AuthJwtPayload;
};

@Controller('auth')
export class AuthController {
  constructor(
      private readonly authService: AuthService,
  ) {}

  @Post('/register')
  async register(@Res({passthrough: true}) res: Response, @Body() dto: RegisterDto) {
      console.log(dto)
    const { accessToken, refreshToken } = await this.authService.register(dto)
    setAuthCookies(res, accessToken, refreshToken);

    return { ok: true }
  }

  @Post('/login')
 async login( @Body() dto: LoginDto, @Res({passthrough: true}) res: Response ) {
      const {accessToken, refreshToken } = await this.authService.login(dto);
      setAuthCookies(res, accessToken, refreshToken);

      return { ok: true }
  }

  @Get('/oauth/:provider')
  async oauthLogin(
      @Param('provider') provider: AuthProvider,
      @Res() res: Response,
  ) {
      const state = crypto.randomUUID();
      const authorizationUrl = this.authService.getOAuthAuthorizationUrl(provider, state);

      res.cookie(AUTH_COOKIES.oauthState, state, buildCookieOptions(JWT_CONFIG[TokenTypes.ACCESS].expiresAtTime));

      return res.redirect(authorizationUrl);
  }

  @Get('/oauth/:provider/callback')
  async oauthCallback(
      @Param('provider') provider: AuthProvider,
      @Query('code') code: string,
      @Query('state') state: string | undefined,
      @Req() req: Request,
      @Res({passthrough: true}) res: Response,
  ) {
      const expectedState: string | undefined = req.cookies?.[AUTH_COOKIES.oauthState];

      const {accessToken, refreshToken, user} = await this.authService.authenticateWithOAuth(
          provider,
          code,
          state,
          expectedState,
      );

      res.clearCookie(AUTH_COOKIES.oauthState, buildCookieOptions());
      setAuthCookies(res, accessToken, refreshToken);

      const redirectUrl = process.env.AUTH_OAUTH_SUCCESS_REDIRECT;

      if (redirectUrl) {
          return res.redirect(redirectUrl);
      }

      return {
          ok: true,
          provider,
          user: {
              id: user.id,
              phone: user.phone,
              yandexId: user.yandexId,
          },
      };
  }

  @Post('/refresh')
  async refresh(@Req() req: Request, @Res({passthrough: true}) res: Response) {
      const refreshToken: string | undefined = req.cookies?.[AUTH_COOKIES[TokenTypes.REFRESH]];

      if (!refreshToken) {
          throw new UnauthorizedException('Refresh-токен не найден');
      }

      const {accessToken, refreshToken: nextRefreshToken} = await this.authService.refresh(refreshToken);
      setAuthCookies(res, accessToken, nextRefreshToken);

      return { ok: true }
  }

  @HttpCode(HttpStatus.OK)
  @Post('/forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Res({passthrough: true}) res: Response) {
      const resetToken = await this.authService.forgotPassword(dto);

      if (resetToken) {
          setResetPasswordCookie(res, resetToken);
      }

      return { ok: true };
  }

  @HttpCode(HttpStatus.OK)
  @Post('/reset-password')
  async resetPassword(
      @Body() dto: ResetPasswordDto,
      @Req() req: Request,
      @Res({passthrough: true}) res: Response,
  ) {
      const resetToken: string | undefined = req.cookies?.[AUTH_COOKIES[TokenTypes.RESET_PASSWORD]];

      if (!resetToken) {
          throw new UnauthorizedException('Токен сброса пароля не найден');
      }

      await this.authService.resetPassword(dto, resetToken);
      clearResetPasswordCookie(res);

      return { ok: true };
  }

  @UseGuards(AuthGuard)
  @Get('/whoami')
  async whoAmI(@Req() req: AuthenticatedRequest) {
      const user = await this.authService.getWhoAmI(req.user.sub);

      return {
          ok: true,
          user,
      }
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/logout')
  async logout(@Req() req: AuthenticatedRequest, @Res({passthrough: true}) res: Response) {
      const refreshToken: string | undefined = req.cookies?.[AUTH_COOKIES[TokenTypes.REFRESH]];

      await this.authService.logout(req.user.jti, refreshToken);
      clearAuthCookies(res);

      return { ok: true }
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/logout-all')
  async logoutAll(@Req() req: AuthenticatedRequest, @Res({passthrough: true}) res: Response) {
      await this.authService.logoutAll(req.user.sub);
      clearAuthCookies(res);

      return { ok: true }
  }


}
