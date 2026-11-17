import type { DeepPartial, FindOptionsOrder, FindOptionsWhere, Repository } from 'typeorm';
import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity.js';
import { PaginateResultDto } from '../dtos/paginate-result.dto.js';
import type { IBaseRepository } from '../interfaces/ibase.repository.js';
import type { BaseModel } from '../model/base.model.js';

/**
 * BaseRepository do 360. Cada repository do módulo estende esta classe,
 * recebe o Repository<T> via @InjectRepository e só escreve as consultas específicas.
 */
export abstract class BaseRepository<T extends BaseModel> implements IBaseRepository<T> {
  constructor(protected readonly _model: Repository<T>) {}

  list(): Promise<T[]> {
    return this._model.find({ order: { createdAt: 'DESC' } as FindOptionsOrder<T> });
  }

  async listPaginate(take = 20, skip = 0): Promise<PaginateResultDto<T>> {
    const [result, count] = await this._model.findAndCount({
      take,
      skip,
      order: { createdAt: 'DESC' } as FindOptionsOrder<T>,
    });
    return new PaginateResultDto(result, count);
  }

  getById(id: string): Promise<T | null> {
    return this._model.findOne({ where: { id } as FindOptionsWhere<T> });
  }

  save(item: DeepPartial<T>): Promise<T> {
    return this._model.save(this._model.create(item));
  }

  async update(id: string, item: QueryDeepPartialEntity<T>): Promise<void> {
    await this._model.update(id, item);
  }

  /** Preenche deleted_at; find() passa a ignorar o registro. Padrão para remoção. */
  async softDelete(id: string): Promise<boolean> {
    const r = await this._model.softDelete(id);
    return (r.affected ?? 0) > 0;
  }

  /** Remoção física. Usar só quando o dado realmente não deve ficar no banco. */
  async delete(id: string): Promise<boolean> {
    const r = await this._model.delete(id);
    return (r.affected ?? 0) > 0;
  }
}
