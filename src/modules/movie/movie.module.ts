import { Module } from '@nestjs/common';
import { MovieService } from './movie.service';
import { MovieController } from './movie.controller';
import {SequelizeModule} from "@nestjs/sequelize";
import {Movie} from "@entities/movie.entity";

@Module({
  controllers: [MovieController],
  imports:[SequelizeModule.forFeature([Movie])],
  providers: [MovieService],
})
export class MovieModule {}
