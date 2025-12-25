import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { NotificationService } from './notification.service';
import { SseController } from './sse.controller';
import { SseRegistry } from './sse.registry';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('runtime.JWT_TOKEN'),
      }),
    }),
  ],
  controllers: [SseController],
  providers: [NotificationService, SseRegistry],
  exports: [NotificationService],
})
export class SseModule {}
