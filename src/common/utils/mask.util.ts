export class MaskUtil {
  /** Mantém só dígitos (CPF, telefone, CEP). */
  static onlyDigits(value?: string | null): string {
    return (value ?? '').replace(/\D+/g, '');
  }

  /** 'R$ 1.234,56' -> 1234.56 */
  static parseMoney(value?: string | number | null): number {
    if (value == null || value === '') return 0;
    if (typeof value === 'number') return value;
    return Number(value.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
  }
}
