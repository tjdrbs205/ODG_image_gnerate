import { Module } from '@nestjs/common';
import { ImagesRepository } from './image.repository';
import { DatabaseModule } from 'src/core/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [ImagesRepository],
  exports: [ImagesRepository],
})
export class ImageModule {}
