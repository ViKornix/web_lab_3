import { PaginationQueryDto } from './dto/pagination-query.dto';
import {FindOptions, ModelAttributes} from "sequelize";
import {Model, ModelCtor} from "sequelize-typescript";

type OrderDirection = 'ASC' | 'DESC';
type ModelField<T extends Model> = Extract<keyof ModelAttributes<T>, string>;

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
};

export function normalizePagination(query: PaginationQueryDto) {
  const normalizedPage = query.page ?? 1;
  const normalizedLimit = query.limit ?? 10;

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    offset: (normalizedPage - 1) * normalizedLimit,
  };
}

export function buildPaginatedResponse<T>(
  data: T[],
  totalItems: number,
  query: PaginationQueryDto,
): PaginatedResponse<T> {
  const { page, limit } = normalizePagination(query);

  return {
    data,
    meta: {
      page,
      limit,
      totalItems,
      totalPages: totalItems === 0 ? 1 : Math.ceil(totalItems / limit),
    },
  };
}
type PaginateOptions<T extends Model> = {
  model: ModelCtor<T>,
  query: PaginationQueryDto;
  order: [ModelField<T>, OrderDirection][],
  options?: Omit<FindOptions<T>, 'limit' | 'offset' | 'order'>;
};

export async function pagination<T extends Model>(
    options: PaginateOptions<T>
) {
  const {page, limit, offset } = normalizePagination(options.query)

  const { rows, count } = await options.model.findAndCountAll(
      {
        ...options.options,
        limit: limit,
        offset: offset,
        order: options.order
      }
  )

  return buildPaginatedResponse(rows, count, options.query)
}



