import { Module } from '@nestjs/common';
import { GenerateService } from './generate.service';
import { GenerateController } from './generate.controller';
import { PixellabModule } from '../pixellab/pixellab.module';
import { PromptTranslatorService } from './prompt-translator.service';
import { ImageModule } from '../repositories/images/image.module';
import { GalleryModule } from '../gallery/gallery.module';
import { SseModule } from '../sse/sse.module';

@Module({
  imports: [PixellabModule, ImageModule, GalleryModule, SseModule],
  controllers: [GenerateController],
  providers: [GenerateService, PromptTranslatorService],
  exports: [],
})
export class GenerateModule {}
