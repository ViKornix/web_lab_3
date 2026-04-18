import {
  IsDefined,
  IsEnum,
  IsString,
  IsUrl, ValidateIf,
} from 'class-validator';
import { MovieStatus } from '@entities/movie.entity';

export class ReplaceMovieDto {
  @IsString()
  addedBy: string;

  @IsString()
  title: string;

  @ValidateIf((object, value) => value !== null)
  @IsString()
  description: string | null;

  @ValidateIf((object,value) => value !== null)
  @IsUrl()
  posterUrl: string | null;

  @ValidateIf((object,value) => value !== null)
  @IsString()
  author: string | null;

  @IsEnum(MovieStatus)
  status: MovieStatus;
}
