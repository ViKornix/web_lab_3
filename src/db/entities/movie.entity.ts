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
  AutoIncrement
} from 'sequelize-typescript';
import { Optional } from  'sequelize'

export enum MovieStatus {
  Planned = 'planned',
  Watched = 'watched',
}

export type MovieAttributes = {
  id: number;
  addedBy: string;
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
  @Column({ type: DataType.STRING, field: 'added_by' })
  declare addedBy: string;

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
  @Column({ type: DataType.DATE, field: 'created_at' })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ type: DataType.DATE, field: 'updated_at' })
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date | null;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare author: string | null;
}