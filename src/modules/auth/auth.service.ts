import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import {RegisterDto} from './dto/register.dto';
import {JwtService} from "@nestjs/jwt";
import {InjectModel} from "@nestjs/sequelize";
import {User} from "@entities/user.entity";
import {Token, TokenTypes} from "@entities/token.entity";
import {LoginDto} from "@modules/auth/dto/login.dto";
import {hashPassword, verifyPassword} from "@modules/auth/utils/password";
import {hashToken} from "@modules/auth/utils/token";
import {AUTH_PROVIDERS, AuthProvider} from '@modules/auth/auth.constants';
import {YandexClient, YandexUserResponse} from '@modules/auth/clients/yandex.client';
import {ForgotPasswordDto} from '@modules/auth/dto/forgot-password.dto';
import {ResetPasswordDto} from '@modules/auth/dto/reset-password.dto';

export const JWT_CONFIG = {
  [TokenTypes.ACCESS]: { expiresIn: '15m', expiresAtTime: 15 * 60 * 1000 },
  [TokenTypes.REFRESH]: { expiresIn: '7d', expiresAtTime: 7 * 24 * 60 * 60 * 1000 },
  [TokenTypes.RESET_PASSWORD]: { expiresIn: '15m', expiresAtTime: 15 * 60 * 1000 },
} as const

export type AuthJwtPayload = {
  sub: User['id'];
  jti: string;
  type: TokenTypes;
};

@Injectable()
export class AuthService {
  constructor(
      private jwtService: JwtService,
      private readonly yandexClient: YandexClient,
      @InjectModel(User)
      private userModel: typeof User,
      @InjectModel(Token)
      private tokenModel: typeof Token
  ) {
  }

  getOAuthAuthorizationUrl(provider: AuthProvider, state: string) {
    if (provider !== AUTH_PROVIDERS.YANDEX) {
      throw new BadRequestException(`Unsupported OAuth provider: ${provider}`);
    }

    return this.yandexClient.getAuthorizationUrl(state);
  }

  async register(dto: RegisterDto) {
    const hash = await hashPassword(dto.passwd)
    const existedUser = await this.userModel.findOne({where:{phone: dto.phone}})
    if (existedUser){
      throw new ConflictException('User already exist')
    }
    const user = await this.userModel.create(
        {
          phone: dto.phone,
          passwdSalt: null,
          passwdHash: hash
        }
    )

    const accessToken = await this.issueToken(user.id, TokenTypes.ACCESS)
    const refreshToken = await  this.issueToken(user.id, TokenTypes.REFRESH)

    return {
      accessToken: accessToken.token,
      refreshToken: refreshToken.token
    }



  }

  async login(dto: LoginDto) {

    const user = await this.userModel.findOne({ where:{phone: dto.phone } })

    if (!user){
      throw new UnauthorizedException('Введен неверный логин или пароль')
    }

    if (!user.passwdHash) {
      throw new UnauthorizedException('Для этого аккаунта вход по паролю недоступен')
    }

    const isValidPassword = await verifyPassword(user.passwdHash, dto.passwd)

    if (!isValidPassword){
      throw new UnauthorizedException('Введен неверный логин или пароль')
    }

    const accessToken = await this.issueToken(user.id, TokenTypes.ACCESS)
    const refreshToken = await  this.issueToken(user.id, TokenTypes.REFRESH)

    return {
      accessToken: accessToken.token,
      refreshToken: refreshToken.token
    }


  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userModel.findOne({ where: { phone: dto.phone } });

    if (!user) {
      return null;
    }

    await this.revokeAllTokensByUserId(user.id, TokenTypes.RESET_PASSWORD);

    const resetToken = await this.issueToken(user.id, TokenTypes.RESET_PASSWORD);

    return resetToken.token;
  }

  async resetPassword(dto: ResetPasswordDto, resetToken: string) {
    const payload = await this.validateToken(resetToken, TokenTypes.RESET_PASSWORD);

    if (!payload) {
      throw new UnauthorizedException('Reset password token is invalid');
    }

    const user = await this.userModel.findByPk(payload.sub);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwdHash = await hashPassword(dto.newPassword);

    await user.update({
      passwdSalt: null,
      passwdHash,
    });

    await this.revokeTokenByJti(payload.jti, TokenTypes.RESET_PASSWORD);
    await this.logoutAll(user.id);
  }

  async issueToken(userId: User['id'], TokenType: TokenTypes){
    const jti = crypto.randomUUID()
    const payload: AuthJwtPayload = { sub: userId, type: TokenType, jti: jti }
    const token = await this.jwtService.signAsync(  payload, { expiresIn: JWT_CONFIG[TokenType].expiresIn } )
    const hash = await hashToken(token)
    const expiresAt = new Date(Date.now() + JWT_CONFIG[TokenType].expiresAtTime);
    await this.tokenModel.create({type: TokenType, expiresAt: expiresAt, hash: hash, jti: jti, userId: userId})

    return {
      type: TokenType,
      jti: jti,
      token: token,
    }
  }

  async validateToken(
      token: string,
      type: TokenTypes,
  ): Promise<AuthJwtPayload | null> {
    try {
      const payload = await this.jwtService.verifyAsync<AuthJwtPayload>(token);

      if (payload.type !== type) {
        return null;
      }

      const tokenRecord = await this.tokenModel.findOne({
        where: {
          jti: payload.jti,
          type,
          revoked: false,
        },
      });

      if (!tokenRecord) {
        return null;
      }

      const hash = await hashToken(token);

      if (hash !== tokenRecord.hash){
        return null
      }

      if (tokenRecord.expiresAt.getTime() <= Date.now()) {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }

  private async revokeTokenByJti(jti: string, type: TokenTypes) {
    await this.tokenModel.update(
      {
        revoked: true,
      },
      {
        where: {
          jti,
          type,
          revoked: false,
        },
      },
    );
  }

  private async revokeAllTokensByUserId(userId: User['id'], type?: TokenTypes) {
    const where = type
        ? {
          userId,
          type,
          revoked: false,
        }
        : {
          userId,
          revoked: false,
        };

    await this.tokenModel.update(
      {
        revoked: true,
      },
      {
        where,
      },
    );
  }

  async logoutAll(userId: User['id']) {
    await this.revokeAllTokensByUserId(userId);
  }

  async refresh(refreshToken: string) {
    const payload = await this.validateToken(refreshToken, TokenTypes.REFRESH);

    if (!payload) {
      throw new UnauthorizedException('Refresh token is invalid');
    }

    const refreshTokenRecord = await this.tokenModel.findOne({
      where: {
        jti: payload.jti,
        type: TokenTypes.REFRESH,
        revoked: false,
      },
    });

    if (!refreshTokenRecord) {
      throw new UnauthorizedException('Refresh token is invalid');
    }

    const accessToken = await this.issueToken(payload.sub, TokenTypes.ACCESS);
    const nextRefreshToken = await this.issueToken(payload.sub, TokenTypes.REFRESH);

    await refreshTokenRecord.update({
      revoked: true,
      replacedByJti: nextRefreshToken.jti,
    });

    return {
      accessToken: accessToken.token,
      refreshToken: nextRefreshToken.token,
    };
  }

  async logout(accessJti: string, refreshToken?: string) {
    await this.revokeTokenByJti(accessJti, TokenTypes.ACCESS);

    if (refreshToken) {
      const refreshPayload = await this.validateToken(refreshToken, TokenTypes.REFRESH);

      if (refreshPayload) {
        await this.revokeTokenByJti(refreshPayload.jti, TokenTypes.REFRESH);
      }
    }
  }

  async getWhoAmI(userId: User['id']) {
    const user = await this.userModel.findByPk(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      phone: user.phone,
      yandexId: user.yandexId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async authenticateWithOAuth(provider: AuthProvider, code: string, state?: string, expectedState?: string) {
    if (provider !== AUTH_PROVIDERS.YANDEX) {
      throw new BadRequestException(`Unsupported OAuth provider: ${provider}`);
    }

    if (!code) {
      throw new BadRequestException('OAuth code is required');
    }

    if (!state || !expectedState || state !== expectedState) {
      throw new UnauthorizedException('OAuth state is invalid');
    }

    const yandexToken = await this.yandexClient.exchangeCode(code);
    const yandexUser = await this.yandexClient.fetchUser(yandexToken.access_token);
    const user = await this.findOrCreateOAuthUser(yandexUser);
    const accessToken = await this.issueToken(user.id, TokenTypes.ACCESS);
    const refreshToken = await this.issueToken(user.id, TokenTypes.REFRESH);

    return {
      accessToken: accessToken.token,
      refreshToken: refreshToken.token,
      user,
    };
  }

  private async findOrCreateOAuthUser(yandexUser: YandexUserResponse) {
    if (!yandexUser.id) {
      throw new BadGatewayException('Yandex user profile did not include id');
    }

    const phone = yandexUser.default_phone?.number ?? null;

    let existingUser = await this.userModel.findOne({
      where: { yandexId: yandexUser.id},
    });

    if (existingUser) {
        return existingUser;
    } else {
      existingUser = await this.userModel.findOne({where:{phone: phone}})

      if (existingUser){
          await existingUser.update({
              yandexId: yandexUser.id
          });
          return existingUser
      }

    }

    return this.userModel.create({
      yandexId: yandexUser.id,
      phone,
      passwdHash: null,
      passwdSalt: null,
    });
  }

}
