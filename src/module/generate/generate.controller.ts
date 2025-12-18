import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { GenerateService } from './generate.service';
import {
  GenerateImageRequestDto,
  GenerateImageResponseDto,
} from './dto/generate-image.dto';

@Controller('generate')
@UseGuards(AuthGuard('jwt'))
export class GenerateController {
  constructor(private readonly generateService: GenerateService) {}

  // UI flow:
  // (Korean text) -> (English prompt) -> PixelLab generate -> (base64 image)
  @Post('image')
  async generateImage(
    @Body() dto: GenerateImageRequestDto,
    @Req() req: any,
  ): Promise<GenerateImageResponseDto> {
    return this.generateService.generateImage(dto, req.user);
  }
}
