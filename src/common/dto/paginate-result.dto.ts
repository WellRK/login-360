export class PaginateResultDto<T> {
  constructor(
    public result: T[],
    public count: number,
  ) {}
}
