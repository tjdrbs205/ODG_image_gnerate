import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export const DIRECTIONS = ['front', 'back', 'left', 'right'] as const;
export type Direction = (typeof DIRECTIONS)[number];

export const IMAGE_CATEGORIES = [
  'character',
  'building',
  'background',
  'illustration',
] as const;
export type ImageCategory = (typeof IMAGE_CATEGORIES)[number];

export class ImageSizeDto {
  @IsInt()
  @Min(1)
  @Max(400)
  width!: number;

  @IsInt()
  @Min(1)
  @Max(400)
  height!: number;
}

export class GenerateImageRequestDto {
  @IsString()
  @MinLength(1)
  textKo!: string;

  @ValidateNested()
  @Type(() => ImageSizeDto)
  imageSize!: ImageSizeDto;

  @IsOptional()
  @IsString()
  @IsIn(DIRECTIONS as unknown as string[])
  direction?: Direction;

  @IsOptional()
  @IsString()
  @IsIn(IMAGE_CATEGORIES as unknown as string[])
  category?: ImageCategory;
}

export class Base64ImageDataDto {
  type!: 'base64';
  base64!: string;
  format!: string;
}

export class GenerateImageResponseDto {
  id!: string;
  promptEn!: string;
  status!: 'PENDING' | 'COMPLETED' | 'FAILED';
}
