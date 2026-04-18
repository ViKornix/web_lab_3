import {Movie, MovieStatus} from "@entities/movie.entity";
import {ConflictException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {pagination} from "@modules/common/pagination";
import {PaginationQueryDto} from "@modules/common/dto/pagination-query.dto";
import {CreateMovieDto} from './dto/create-movie.dto';
import {UpdateMovieDto} from './dto/update-movie.dto';
import {ReplaceMovieDto} from './dto/replace-movie.dto';

@Injectable()
export class MovieService {
    constructor(
        @InjectModel(Movie)
        private movieModel: typeof Movie
    ) {}

    async getPaginationMovies(query: PaginationQueryDto){
        return await pagination({model:this.movieModel, query: query, order:[['createdAt', "DESC"]]})
    }

    async getMovie(id: number){
        const movie = await this.findMovieById(id)

        if ( !movie ) {
            throw new NotFoundException('Фильм не найден')
        }

    }

    async createMovie(dto: CreateMovieDto){
        const movie = await this.movieModel.findOne({where: {title: dto.title, addedBy: dto.addedBy}})

        if (movie){
            throw new ConflictException('Фильм уже добавлен')
        }

        return await this.movieModel.create({
            ...dto,
        })
    }

    async replaceMovie(id: number, dto: ReplaceMovieDto){
        const movie = await this.findMovieById(id)

        if ( !movie ) {
            throw new NotFoundException('Фильм не найден')
        }

        let watchedAt: Date | null = null

        if (dto.status === MovieStatus.Watched){
            watchedAt = new Date()
        }

        return await movie.update({
            ...dto, watchedAt: watchedAt
        } )
    }

    async updateMovie(id: number, dto: UpdateMovieDto){
        const movie = await this.findMovieById(id)

        if ( !movie ) {
            throw new NotFoundException('Фильм не найден')
        }

        const updateData: Partial<Movie> = {...dto}


        if ('status' in dto){
            updateData.watchedAt =
                dto.status === MovieStatus.Watched ? new Date() : null;
        }

        return await movie.update(updateData)
    }

    async deleteMovie(id: number){
        const movie = await this.findMovieById(id)

        if ( !movie ) {
            throw new NotFoundException('Фильм не найден')
        }

        await movie.destroy()
    }

    private async findMovieById(id: number){
        const movie = await this.movieModel.findOne({where:{id: id}})

        if (!movie){
            throw new NotFoundException('Фильм не найден')
        }

        return movie
    }
}
