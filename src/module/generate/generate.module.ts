import { Module } from '@nestjs/common';
import { GenerateService } from './generate.service';
import { GenerateController } from './generate.controller';
import { PixellabModule } from '../pixellab/pixellab.module';
import { PromptTranslatorService } from './prompt-translator.service';
import { ImageModule } from '../repositories/images/image.module';

@Module({
  imports: [PixellabModule, ImageModule],
  controllers: [GenerateController],
  providers: [GenerateService, PromptTranslatorService],
})
export class GenerateModule {}
