import {Movie, MovieStatus} from "@entities/movie.entity";
import {ConflictException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {pagination} from "@modules/common/pagination";
import {PaginationQueryDto} from "@modules/common/dto/pagination-query.dto";
import {CreateMovieDto} from './dto/create-movie.dto';
import {UpdateMovieDto} from './dto/update-movie.dto';
import {ReplaceMovieDto} from './dto/replace-movie.dto';
import {User} from '@entities/user.entity';

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

    async createMovie(userId: User['id'], dto: CreateMovieDto){
        const movie = await this.movieModel.findOne({where: {title: dto.title, userId}})

        if (movie){
            throw new ConflictException('Фильм уже добавлен')
        }

        return await this.movieModel.create({
            ...dto,
            userId,
        })
    }

    async replaceMovie(userId: User['id'], id: number, dto: ReplaceMovieDto){
        const movie = await this.findMovieByIdForUser(id, userId)

        let watchedAt: Date | null = null

        if (dto.status === MovieStatus.Watched){
            watchedAt = new Date()
        }

        return await movie.update({
            ...dto, watchedAt: watchedAt
        } )
    }

    async updateMovie(userId: User['id'], id: number, dto: UpdateMovieDto){
        const movie = await this.findMovieByIdForUser(id, userId)

        const updateData: Partial<Movie> = {...dto}


        if ('status' in dto){
            updateData.watchedAt =
                dto.status === MovieStatus.Watched ? new Date() : null;
        }

        return await movie.update(updateData)
    }

    async deleteMovie(userId: User['id'], id: number){
        const movie = await this.findMovieByIdForUser(id, userId)

        await movie.destroy()
    }

    private async findMovieById(id: number){
        const movie = await this.movieModel.findOne({where:{id: id}})

        if (!movie){
            throw new NotFoundException('Фильм не найден')
        }

        return movie
    }

    private async findMovieByIdForUser(id: number, userId: User['id']){
        const movie = await this.movieModel.findOne({where:{id, userId}})

        if (!movie){
            throw new NotFoundException('Фильм не найден')
        }

        return movie
    }
}
