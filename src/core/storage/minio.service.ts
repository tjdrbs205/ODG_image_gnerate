import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private client!: Minio.Client;

  private readonly bucket: string;
  private readonly publicUrl?: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.getOrThrow<string>('runtime.MINIO_BUCKET');
  }
  async onModuleInit() {
    const port = this.configService.get<number>('runtime.MINIO_PORT') || 9000;

    const endPoint = this.configService.getOrThrow<string>(
      'runtime.MINIO_ENDPOINT',
    );
    const accessKey = this.configService.getOrThrow<string>(
      'runtime.MINIO_ACCESS_KEY',
    );
    const secretKey = this.configService.getOrThrow<string>(
      'runtime.MINIO_SECRET_KEY',
    );
    const useSSL = this.configService.getOrThrow<string>(
      'runtime.MINIO_USE_SSL',
    );

    this.client = new Minio.Client({
      port,
      useSSL: false,
      endPoint,
      accessKey,
      secretKey,
    });

    const exists = await this.client.bucketExists(this.bucket);

    if (!exists) {
      await this.client.makeBucket(this.bucket);
    }
  }

  async uploadBase64Image(params: {
    objectKey: string;
    base64: string;
    format: string;
  }): Promise<void> {
    const buffer = Buffer.from(params.base64, 'base64');
    const contentType = `image/${params.format}`;

    await this.client.putObject(
      this.bucket,
      params.objectKey,
      buffer,
      buffer.length,
      {
        'Content-Type': contentType,
      },
    );
  }

  async getImageUrl(objectKey: string): Promise<string> {
    if (this.publicUrl) {
      const base = this.publicUrl.replace(/\/$/, '');
      // Keep slashes in objectKey; encode segments safely.
      const encodedKey = objectKey
        .split('/')
        .map((s) => encodeURIComponent(s))
        .join('/');
      return `${base}/${this.bucket}/${encodedKey}`;
    }

    // Fallback: presigned URL (default 1 hour)
    return this.client.presignedGetObject(this.bucket, objectKey, 60 * 60);
  }
}
