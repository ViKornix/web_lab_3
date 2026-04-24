import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Optional } from  'sequelize'
import {User} from '@entities/user.entity';

export enum MovieStatus {
  Planned = 'planned',
  Watched = 'watched',
}

export type MovieAttributes = {
  id: number;
  userId: number;
  user: User;
  title: string;
  description: string | null;
  posterUrl: string | null;
  status: MovieStatus;
  watchedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  author: string | null;
};

export type MovieCreationAttributes = Optional<
    MovieAttributes,
    | 'id'
    | 'user'
    | 'description'
    | 'posterUrl'
    | 'status'
    | 'watchedAt'
    | 'createdAt'
    | 'updatedAt'
    | 'deletedAt'
    | 'author'
>;

@Table({
  tableName: 'movies',
  timestamps: true,
  underscored: true,
  paranoid: true,
})
export class Movie extends Model<MovieAttributes, MovieCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, field: 'user_id' })
  declare userId: number;

  @BelongsTo(() => User)
  declare user: User;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare title: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare description: string | null;

  @AllowNull(true)
  @Column({ type: DataType.STRING, field: 'poster_url' })
  declare posterUrl: string | null;

  @AllowNull(false)
  @Default(MovieStatus.Planned)
  @Column(DataType.ENUM(...Object.values(MovieStatus)))
  declare status: MovieStatus;

  @AllowNull(true)
  @Column({ type: DataType.DATE, field: 'watched_at' })
  declare watchedAt: Date | null;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date | null;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare author: string | null;
}
