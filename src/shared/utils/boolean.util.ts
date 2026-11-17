export class BooleanUtil {
  static getBoolean(value: unknown): boolean {
    return [true, 1, 'true', '1', 'on', 'yes'].includes(value as never);
  }
}
