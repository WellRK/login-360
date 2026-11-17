/** Regex herdadas do ValidatorsUtil do 360, para usar com @Matches(). */
export const CPF_REGEX = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/;
export const PHONE_BR_REGEX = /^(?:(?:\+|00)?55\s?)?(?:\(?[1-9][0-9]\)?\s?)?(?:9\d|[2-9])\d{3}-?\d{4}$/;
export const CEP_REGEX = /^\d{5}-?\d{3}$/;

/** Valida dígitos verificadores do CPF (o 360 só checava o formato). */
export function isValidCpf(value: string): boolean {
  const cpf = value.replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const calc = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(cpf[i]) * (len + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return calc(9) === Number(cpf[9]) && calc(10) === Number(cpf[10]);
}
