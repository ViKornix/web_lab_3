import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {SequelizeModule} from "@nestjs/sequelize";
import {dbEntities} from "@entities/index";
import {MovieModule} from "@modules/movie/movie.module";
import { AuthModule } from './modules/auth/auth.module';


@Module({
  imports: [
      SequelizeModule.forRoot({
          dialect: "postgres",
          host: process.env.DB_HOST,
          port: Number(process.env.DB_PORT),
          username: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          models: [...dbEntities],

      },),
      MovieModule,
      AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
