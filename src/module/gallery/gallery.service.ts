import { Injectable } from '@nestjs/common';
import { ImagesRepository } from '../repositories/images/image.repository';
import { GalleryImageDto } from './dto/gallery.dto';
import { MinioService } from 'src/core/storage/minio.service';

@Injectable()
export class GalleryService {
  constructor(
    private readonly imagesRepository: ImagesRepository,
    private readonly minioService: MinioService,
  ) {}

  async listByUser(user: any): Promise<GalleryImageDto[]> {
    const userId = user?.id;
    if (!userId) {
      throw new Error('Invalid user data');
    }
    const images = await this.imagesRepository.findByUserId(userId);

    return Promise.all(
      images.map(async (img) => {
        const imageUrl = img.objectKey
          ? await this.minioService.getImageUrl(img.objectKey)
          : undefined;

        return {
          id: img.id,
          prompt: img.prompt,
          status: img.status,
          createdAt: img.createdAt,
          error: img.error,
          imageUrl,
        };
      }),
    );
  }
}
