import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AuthenticationError,
  GenerateImagePixfluxParams,
  HttpError,
  PixelLabClient,
  RateLimitError,
  ValidationError,
} from '@pixellab-code/pixellab';

@Injectable()
export class PixellabService {
  private readonly logger = new Logger(PixellabService.name);
  private readonly client: PixelLabClient;
  constructor(config: ConfigService) {
    const apiKey = config.get('runtime.PIXELLAB_API_KEY');
    if (!apiKey) {
      throw new Error('Missing runtime.PIXELLAB_API_KEY');
    }
    this.client = new PixelLabClient(apiKey);
  }

  private safeStringify(value: unknown): string {
    if (typeof value === 'string') return value;
    if (value instanceof Error) return value.message;
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  private normalizeMessage(message: unknown): string {
    const asString = this.safeStringify(message);
    if (asString.includes('[object Object]')) {
      return 'PixelLab returned a non-text error response. Check request parameters or enable server logging for more details.';
    }
    return asString;
  }

  private handlePixellabError(error: unknown): never {
    this.logger.error('Pixellab request failed', this.safeStringify(error));

    if (error instanceof HttpException) {
      throw error;
    }
    if (error instanceof AuthenticationError) {
      throw new UnauthorizedException(error.message);
    }
    if (error instanceof RateLimitError) {
      throw new HttpException(error.message, HttpStatus.TOO_MANY_REQUESTS);
    }
    if (error instanceof ValidationError) {
      throw new HttpException(
        {
          message: 'PixelLab validation error',
          detail: this.normalizeMessage(error.message),
          code: error.code,
          issues: error.validationErrors?.issues,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    if (error instanceof HttpError) {
      const status =
        typeof error.status === 'number'
          ? error.status
          : HttpStatus.BAD_GATEWAY;
      throw new HttpException(
        {
          message: 'PixelLab http error',
          detail: this.normalizeMessage(error.message),
          code: error.code,
          status,
        },
        status,
      );
    }

    if (error instanceof Error) {
      throw new HttpException(
        { message: 'PixelLab request failed', detail: error.message },
        HttpStatus.BAD_GATEWAY,
      );
    }

    throw new HttpException(
      { message: 'PixelLab request failed', detail: this.safeStringify(error) },
      HttpStatus.BAD_GATEWAY,
    );
  }

  async generateImagePixflux(params: GenerateImagePixfluxParams) {
    try {
      return await this.client.generateImagePixflux(params);
    } catch (error) {
      this.handlePixellabError(error);
    }
  }
}
