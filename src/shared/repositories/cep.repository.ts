import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CepDto } from '../dtos/cep.dto.js';
import { MaskUtil } from '../utils/mask.util.js';

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean | string;
}

/** CEP_API com o marcador --cep-- (padrão: ViaCEP). */
@Injectable()
export class CepRepository {
  constructor(private readonly _configService: ConfigService) {}

  async getAddressByCep(cep: string): Promise<CepDto> {
    const digits = MaskUtil.onlyDigits(cep);
    const url = this._configService.get<string>('cepApi', 'https://viacep.com.br/ws/--cep--/json/').replace('--cep--', digits);
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new NotFoundException('cep não encontrado');
    const data = (await res.json()) as ViaCepResponse;
    if (data.erro) throw new NotFoundException('cep não encontrado');
    return this._convertResponse(data);
  }

  private _convertResponse(data: ViaCepResponse): CepDto {
    return {
      cep: data.cep,
      logradouro: data.logradouro,
      complemento: data.complemento,
      bairro: data.bairro,
      cidade: data.localidade,
      uf: data.uf,
    };
  }
}
