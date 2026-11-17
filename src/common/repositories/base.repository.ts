import { DeepPartial, FindOptionsOrder, FindOptionsWhere, Repository } from 'typeorm';
import { PaginateResultDto } from '../dto/paginate-result.dto.js';
import { BaseEntity } from '../entities/base.entity.js';

/** Versão do BaseRepository do 360, agora recebendo o Repository<T> injetado. */
export abstract class BaseRepository<T extends BaseEntity> {
  constructor(protected readonly repo: Repository<T>) {}

  list(): Promise<T[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } as FindOptionsOrder<T> });
  }

  async listPaginate(take = 20, skip = 0): Promise<PaginateResultDto<T>> {
    const [result, count] = await this.repo.findAndCount({
      take,
      skip,
      order: { createdAt: 'DESC' } as FindOptionsOrder<T>,
    });
    return new PaginateResultDto(result, count);
  }

  getById(id: string): Promise<T | null> {
    return this.repo.findOne({ where: { id } as FindOptionsWhere<T> });
  }

  save(entity: DeepPartial<T>): Promise<T> {
    return this.repo.save(this.repo.create(entity));
  }

  async softDelete(id: string): Promise<boolean> {
    const r = await this.repo.softDelete(id);
    return (r.affected ?? 0) > 0;
  }
}
