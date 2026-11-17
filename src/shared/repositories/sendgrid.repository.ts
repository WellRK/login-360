import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/** Envio pela API v3 do SendGrid via fetch (o @ntegral/nestjs-sendgrid foi abandonado). */
@Injectable()
export class SendgridRepository {
  private readonly _logger = new Logger(SendgridRepository.name);

  constructor(private readonly _configService: ConfigService) {}

  async sendEmail(to: string, subject: string, text: string, html: string): Promise<void> {
    const apiKey = this._configService.get<string>('sendgrid.apiKey');
    const from = this._configService.get<string>('sendgrid.emailSender');
    if (!apiKey || !from) throw new Error('SENDGRID_API_KEY / SENDGRID_EMAIL_SENDER não configurados');

    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: from },
        subject,
        content: [
          { type: 'text/plain', value: text },
          { type: 'text/html', value: html },
        ],
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      this._logger.error(`SendGrid ${res.status}: ${await res.text()}`);
      throw new Error('falha ao enviar email');
    }
  }

  /** Envia para o próprio remetente (ex.: formulário de contato), como no 360. */
  async sendEmailMessage(subject: string, text: string, html: string): Promise<void> {
    await this.sendEmail(this._configService.getOrThrow<string>('sendgrid.emailSender'), subject, text, html);
  }
}
