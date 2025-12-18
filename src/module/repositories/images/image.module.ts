import { Module } from '@nestjs/common';
import { ImagesService } from './image.service';
import { DatabaseModule } from 'src/core/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [ImagesService],
  exports: [ImagesService],
})
export class ImageModule {}
