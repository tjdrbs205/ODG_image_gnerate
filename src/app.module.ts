import { Module } from '@nestjs/common';
import { AuthModule } from './module/auth/auth.module';
import { GalleryModule } from './module/gallery/gallery.module';
import { GenerateModule } from './module/generate/generate.module';
import { PixellabModule } from './module/pixellab/pixellab.module';
import { ConfigModule } from '@nestjs/config';
import runtimeConfig from './core/config/runtime.config';
import { bootstrapSchema } from './core/config/env.validation';
import { StorageModule } from './core/storage/storage.module';
import { DatabaseModule } from './core/database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [runtimeConfig],
      validationSchema: bootstrapSchema,
    }),
    DatabaseModule,
    StorageModule,
    AuthModule,
    GalleryModule,
    GenerateModule,
    PixellabModule,
  ],
})
export class AppModule {}
