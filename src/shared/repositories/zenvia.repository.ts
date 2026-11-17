import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MaskUtil } from '../utils/mask.util.js';

/** API v2 da Zenvia via fetch (sem o @zenvia/sdk). */
@Injectable()
export class ZenviaRepository {
  private readonly _logger = new Logger(ZenviaRepository.name);

  constructor(private readonly _configService: ConfigService) {}

  async sendSms(phone: string, message: string): Promise<void> {
    const from = this._configService.get<string>('zenvia.smsFrom', 'cto');
    await this._send('sms', { from, to: MaskUtil.onlyDigits(phone), contents: [{ type: 'text', text: message }] });
  }

  async sendEmail(email: string, subject: string, html: string): Promise<void> {
    const from = this._configService.getOrThrow<string>('zenvia.email');
    await this._send('email', { from, to: email, contents: [{ type: 'email', subject, html }] });
  }

  private async _send(channel: 'sms' | 'email', body: unknown): Promise<void> {
    const token = this._configService.get<string>('zenvia.token');
    if (!token) throw new Error('ZENVIA_TOKEN não configurado');
    const res = await fetch(`https://api.zenvia.com/v2/channels/${channel}/messages`, {
      method: 'POST',
      headers: { 'X-API-TOKEN': token, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      this._logger.error(`Zenvia ${channel} ${res.status}: ${await res.text()}`);
      throw new Error(`falha ao enviar ${channel}`);
    }
  }
}
