import { Injectable } from '@nestjs/common';
import { ImageMetadata } from 'generated/prisma/client';
import {
  ImageMetadataCreateInput,
  ImageMetadataUpdateInput,
} from 'generated/prisma/models';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class ImagesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<ImageMetadata[]> {
    const items = await this.prisma.imageMetadata.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return items;
  }

  async create(data: ImageMetadataCreateInput): Promise<void> {
    await this.prisma.imageMetadata.create({
      data,
    });
  }

  async updateById(id: string, data: ImageMetadataUpdateInput): Promise<void> {
    await this.prisma.imageMetadata.update({
      where: { id },
      data,
    });
  }
}
