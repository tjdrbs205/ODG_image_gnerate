import { Module } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { GalleryController } from './gallery.controller';
import { AuthModule } from '../auth/auth.module';
import { ImageModule } from '../repositories/images/image.module';

@Module({
  imports: [AuthModule, ImageModule],
  controllers: [GalleryController],
  providers: [GalleryService],
})
export class GalleryModule {}
