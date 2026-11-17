import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import type { UploadedFileInterface } from '../interfaces/uploaded-file.interface.js';

/** Porta do S3Repository do 360, agora no AWS SDK v3 (o v2 foi descontinuado). */
@Injectable()
export class S3Repository {
  private readonly _client: S3Client;

  constructor(private readonly _configService: ConfigService) {
    const accessKeyId = this._configService.get<string>('aws.accessKeyId');
    const secretAccessKey = this._configService.get<string>('aws.secretAccessKey');
    this._client = new S3Client({
      region: this._configService.get<string>('aws.region'),
      // sem chaves no .env: usa a cadeia padrão da AWS (IAM role, ~/.aws)
      credentials: accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined,
    });
  }

  /** Recebe "data:<mime>;base64,<conteúdo>". */
  async uploadBase64(bucket: string, key: string, base64File: string): Promise<string> {
    const match = /^data:([^;]+);base64,(.+)$/s.exec(base64File);
    if (!match) throw new Error('base64 inválido (esperado data:<mime>;base64,...)');
    await this._client.send(
      new PutObjectCommand({ Bucket: bucket, Key: key, Body: Buffer.from(match[2], 'base64'), ContentType: match[1] }),
    );
    return key;
  }

  async uploadFile(bucket: string, file: UploadedFileInterface, key: string = randomUUID()): Promise<string> {
    await this._client.send(
      new PutObjectCommand({ Bucket: bucket, Key: key, Body: file.buffer, ContentType: file.mimetype }),
    );
    return key;
  }

  async download(bucket: string, key: string): Promise<{ base64String: string; contentType?: string }> {
    const res = await this._client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const bytes = await res.Body!.transformToByteArray();
    return { base64String: Buffer.from(bytes).toString('base64'), contentType: res.ContentType };
  }

  async delete(bucket: string, key: string): Promise<void> {
    await this._client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  }
}
