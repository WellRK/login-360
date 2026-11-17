import { CPF_REGEX, PHONE_BR_REGEX, isValidCpf } from './validators.js';
import { MaskUtil } from './mask.util.js';

describe('validators', () => {
  it('CPF: aceita válido com e sem máscara', () => {
    expect(isValidCpf('529.982.247-25')).toBe(true);
    expect(isValidCpf('52998224725')).toBe(true);
    expect(CPF_REGEX.test('529.982.247-25')).toBe(true);
  });

  it('CPF: recusa dígito errado e repetidos', () => {
    expect(isValidCpf('529.982.247-26')).toBe(false);
    expect(isValidCpf('111.111.111-11')).toBe(false);
    expect(isValidCpf('123')).toBe(false);
  });

  it('telefone BR', () => {
    expect(PHONE_BR_REGEX.test('(11) 98888-8888')).toBe(true);
    expect(PHONE_BR_REGEX.test('+5511988888888')).toBe(true);
    expect(PHONE_BR_REGEX.test('123')).toBe(false);
  });

  it('MaskUtil', () => {
    expect(MaskUtil.onlyDigits('(11) 98888-8888')).toBe('11988888888');
    expect(MaskUtil.parseMoney('R$ 1.234.567,89')).toBe(1234567.89);
  });
});
