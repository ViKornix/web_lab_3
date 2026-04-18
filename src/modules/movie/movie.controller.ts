import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { MovieService } from './movie.service';
import {PaginationQueryDto} from "@modules/common/dto/pagination-query.dto";
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { ReplaceMovieDto } from './dto/replace-movie.dto';

@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {
  }
  @Get()
  async getPaginationMovies(@Query() query: PaginationQueryDto ){
    return await  this.movieService.getPaginationMovies(query)
  }

  @Get(':id')
  async getMovie(@Param('id') id: number){
    return await  this.movieService.getMovie(id)
  }

  @Post()
  async createMovie(@Body() dto: CreateMovieDto){
    return await this.movieService.createMovie(dto)
  }

  @Put(':id')
  async replaceMovie(@Param('id') id: number, @Body() dto: ReplaceMovieDto){
    return await this.movieService.replaceMovie(id, dto)
  }

  @Patch(':id')
  async updateMovie(@Param('id') id: number, @Body() dto: UpdateMovieDto){
    return await this.movieService.updateMovie(id, dto)
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteMovie(@Param('id') id: number){
    await this.movieService.deleteMovie(id)
  }
}
