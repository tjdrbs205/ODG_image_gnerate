import { HttpException, Injectable } from '@nestjs/common';
import { GenerateImagePixfluxParams } from '@pixellab-code/pixellab';
import { v4 as uuidv4 } from 'uuid';

import {
  GenerateImageRequestDto,
  GenerateImageResponseDto,
  ImageCategory,
} from './dto/generate-image.dto';
import { PixellabService } from '../pixellab/pixellab.service';
import { PromptTranslatorService } from './prompt-translator.service';
import { ImagesRepository } from '../repositories/images/image.repository';
import { MinioService } from 'src/core/storage/minio.service';
import { InputJsonValue } from 'generated/prisma/internal/prismaNamespace';

@Injectable()
export class GenerateService {
  constructor(
    private readonly pixellabService: PixellabService,
    private readonly promptTranslator: PromptTranslatorService,
    private readonly imagesRepository: ImagesRepository,
    private readonly minioService: MinioService,
  ) {}

  private categoryDefaults(category: ImageCategory | undefined) {
    switch (category) {
      case 'background':
        return {
          prefix:
            'Pixel art background scene, clean composition, vibrant but not noisy.',
          noBackground: false,
        };
      case 'building':
        return {
          prefix:
            'Pixel art building, readable silhouette, clean edges, simple materials.',
          noBackground: true,
        };
      case 'illustration':
        return {
          prefix:
            'Pixel art illustration, clear subject, pleasing composition.',
          noBackground: true,
        };
      case 'character':
      default:
        return {
          prefix:
            'Cute pixel art character, clean outline, readable face and pose.',
          noBackground: true,
        };
    }
  }

  private mapDirection(
    direction?: GenerateImageRequestDto['direction'],
  ): GenerateImagePixfluxParams['direction'] {
    switch (direction) {
      case 'front':
        return 'south';
      case 'back':
        return 'north';
      case 'left':
        return 'west';
      case 'right':
        return 'east';
      default:
        return undefined;
    }
  }

  private userFriendlyJobError(err: unknown): string {
    if (err instanceof HttpException) {
      const status = err.getStatus();
      if (status === 401) {
        return '서버 인증 문제로 생성에 실패했어요. 잠시 후 다시 시도해주세요.';
      }
      if (status === 422) {
        return '요청 내용이 올바르지 않아 생성에 실패했어요. 입력값을 확인해주세요.';
      }
      if (status === 429) {
        return '요청이 많아 잠시 후 다시 시도해주세요.';
      }
      if (status >= 500) {
        return '이미지 생성 서버에 문제가 있어요. 잠시 후 다시 시도해주세요.';
      }
      return '이미지 생성에 실패했어요. 잠시 후 다시 시도해주세요.';
    }

    return '이미지 생성에 실패했어요. 잠시 후 다시 시도해주세요.';
  }

  async generateImage(
    dto: GenerateImageRequestDto,
    user: { id?: string },
  ): Promise<GenerateImageResponseDto> {
    const userId = user?.id;
    if (!userId) {
      throw new Error('Invalid user data');
    }

    const category = dto.category;
    const { prefix, noBackground } = this.categoryDefaults(category);

    const translated = await this.promptTranslator.toEnglishPrompt(dto.textKo);

    const pixellabDirection = this.mapDirection(dto.direction);
    const directionHint = dto.direction ? `Facing: ${dto.direction}.` : '';

    const promptEn = [prefix, translated, directionHint]
      .filter(Boolean)
      .join(' ')
      .trim();

    const params: GenerateImagePixfluxParams = {
      description: promptEn,
      imageSize: dto.imageSize,
      direction: pixellabDirection,
      noBackground,
      outline: 'single color black outline',
      shading: 'basic shading',
      detail: 'medium detail',
    };

    const id = uuidv4();
    const createdAt = new Date();

    await this.imagesRepository.create({
      id,
      user: { connect: { id: userId } },
      prompt: promptEn,
      status: 'PENDING',
      params: params as any,
      width: dto.imageSize.width,
      height: dto.imageSize.height,
      seed: Math.floor(Math.random() * 1000000),
      modelCount: '1',
      createdAt,
    });

    void (async () => {
      try {
        const result = await this.pixellabService.generateImagePixflux(params);

        const json = result.image.toJSON() as {
          type: 'base64';
          base64: string;
          format: string;
        };

        const objectKey = `images/${userId}/${id}.${json.format}`;
        await this.minioService.uploadBase64Image({
          objectKey,
          base64: json.base64,
          format: json.format,
        });

        await this.imagesRepository.updateById(id, {
          status: 'COMPLETED',
          objectKey,
          format: json.format,
          error: null,
        });
      } catch (err) {
        console.error('Image generation failed', err);
        const message = this.userFriendlyJobError(err);
        await this.imagesRepository.updateById(id, {
          status: 'FAILED',
          error: message,
        });
      }
    })();

    return {
      id,
      promptEn,
      status: 'PENDING',
    };
  }
}
