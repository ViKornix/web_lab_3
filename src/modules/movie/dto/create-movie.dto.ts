import {
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { MovieStatus } from '@entities/movie.entity';

export class CreateMovieDto {
  @IsString()
  addedBy: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsUrl()
  posterUrl?: string | null;

  @IsOptional()
  @IsString()
  author?: string | null;

  @IsOptional()
  @IsEnum(MovieStatus)
  status?: MovieStatus;

}
