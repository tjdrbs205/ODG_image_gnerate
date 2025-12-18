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
        let imageUrl: string | undefined = undefined;
        if (img.objectKey) {
          imageUrl = await this.minioService.getImageUrl(img.objectKey);
        }
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
