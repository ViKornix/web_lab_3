import { Module } from '@nestjs/common';
import { MovieService } from './movie.service';
import { MovieController } from './movie.controller';
import {SequelizeModule} from "@nestjs/sequelize";
import {Movie} from "@entities/movie.entity";
import {AuthModule} from '@modules/auth/auth.module';

@Module({
  controllers: [MovieController],
  imports:[SequelizeModule.forFeature([Movie]), AuthModule],
  providers: [MovieService],
})
export class MovieModule {}
