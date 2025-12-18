import { Module } from '@nestjs/common';
import { PixellabService } from './pixellab.service';

@Module({
  providers: [PixellabService],
  exports: [PixellabService],
})
export class PixellabModule {}
