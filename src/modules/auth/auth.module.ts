import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {SequelizeModule} from "@nestjs/sequelize";
import {User} from "@entities/user.entity";
import {Token} from "@entities/token.entity";
import {JwtModule} from "@nestjs/jwt";
import {AuthGuard} from '@modules/auth/guards/auth.guard';
import {YandexClient} from '@modules/auth/clients/yandex.client';

@Module({
  imports: [
      JwtModule.register({
        global: true,
          secret: process.env.JWT_SECRET
      }),
    SequelizeModule.forFeature([User, Token])],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, YandexClient],
  exports: [AuthService, AuthGuard, YandexClient],
})
export class AuthModule {}
