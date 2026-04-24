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
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { MovieService } from './movie.service';
import {PaginationQueryDto} from "@modules/common/dto/pagination-query.dto";
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { ReplaceMovieDto } from './dto/replace-movie.dto';
import { AuthGuard } from '@modules/auth/guards/auth.guard';
import { AuthJwtPayload } from '@modules/auth/auth.service';

type AuthenticatedRequest = Request & {
  user: AuthJwtPayload;
};

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

  @UseGuards(AuthGuard)
  @Post()
  async createMovie(@Req() req: AuthenticatedRequest, @Body() dto: CreateMovieDto){
    return await this.movieService.createMovie(req.user.sub, dto)
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  async replaceMovie(@Req() req: AuthenticatedRequest, @Param('id') id: number, @Body() dto: ReplaceMovieDto){
    return await this.movieService.replaceMovie(req.user.sub, id, dto)
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  async updateMovie(@Req() req: AuthenticatedRequest, @Param('id') id: number, @Body() dto: UpdateMovieDto){
    return await this.movieService.updateMovie(req.user.sub, id, dto)
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteMovie(@Req() req: AuthenticatedRequest, @Param('id') id: number){
    await this.movieService.deleteMovie(req.user.sub, id)
  }
}
