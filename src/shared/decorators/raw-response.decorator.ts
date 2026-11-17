import { SetMetadata } from '@nestjs/common';

export const RAW_RESPONSE_KEY = 'rawResponse';
/**
 * Devolve o retorno do controller sem o envelope { success, data, errors }.
 * Usar em: export CSV/stream, proxy que repassa a resposta de outro serviço como está,
 * e rotas que precisam manter um contrato de resposta legado.
 */
export const RawResponse = () => SetMetadata(RAW_RESPONSE_KEY, true);
