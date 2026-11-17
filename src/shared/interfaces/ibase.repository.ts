import type { DeepPartial } from 'typeorm';
import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity.js';
import type { PaginateResultDto } from '../dtos/paginate-result.dto.js';
import type { BaseModel } from '../model/base.model.js';

/** Contrato comum a todo repository (padrão do 360). */
export interface IBaseRepository<T extends BaseModel> {
  list(): Promise<T[]>;
  listPaginate(take?: number, skip?: number): Promise<PaginateResultDto<T>>;
  getById(id: string): Promise<T | null>;
  save(item: DeepPartial<T>): Promise<T>;
  update(id: string, item: QueryDeepPartialEntity<T>): Promise<void>;
  softDelete(id: string): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}
