import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { AuthGuard } from '@nestjs/passport';
import { GalleryImageDto } from './dto/gallery.dto';

@Controller('gallery')
@UseGuards(AuthGuard('jwt'))
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Get()
  async listMine(@Req() req: any): Promise<GalleryImageDto[]> {
    return this.galleryService.listByUser(req.user);
  }
}
