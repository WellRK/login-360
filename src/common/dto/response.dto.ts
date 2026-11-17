/** Envelope padrão herdado do 360: { success, data, errors }. */
export class ResponseDto<T = unknown> {
  constructor(
    public success: boolean,
    public data: T | null,
    public errors: string[] | null,
  ) {}
}
