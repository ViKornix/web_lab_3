import { Movie, MovieStatus } from './movie.entity';
import {Token, TokenTypes} from './token.entity';
import {User} from './user.entity';


export const dbEntities = [
  Movie,
  User,
  Token,
];

export {
  Movie,
  MovieStatus,
  User,
  Token,
  TokenTypes,
};
