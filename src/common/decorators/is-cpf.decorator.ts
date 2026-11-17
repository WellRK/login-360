import { ValidationOptions, registerDecorator } from 'class-validator';
import { isValidCpf } from '../utils/validators.js';

export function IsCpf(options?: ValidationOptions) {
  return (object: object, propertyName: string) =>
    registerDecorator({
      name: 'isCpf',
      target: object.constructor,
      propertyName,
      options: { message: 'cpf inválido', ...options },
      validator: { validate: (v: unknown) => typeof v === 'string' && isValidCpf(v) },
    });
}
