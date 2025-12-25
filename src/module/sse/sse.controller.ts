import {
  Body,
  Controller,
  Param,
  Post,
  Query,
  Sse,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { NotificationService } from './notification.service';

@Controller('sse')
export class SseController {
  constructor(
    private readonly notificationSse: NotificationService,
    private readonly jwtService: JwtService,
  ) {}

  @Sse()
  sseEndpoint(@Query('token') token?: string): Observable<MessageEvent> {
    if (!token) throw new UnauthorizedException('Missing token');

    let payload: { sub?: string };
    try {
      payload = this.jwtService.verify(token) as { sub?: string };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    const userId = payload?.sub;
    if (!userId) throw new UnauthorizedException('Invalid token payload');

    return this.notificationSse.createClientStream(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('emit/:id')
  emitTo(@Param('id') id: string, @Body() body: any) {
    this.notificationSse.sendTo(id, body);
    return { ok: true };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('broadcast')
  broadcast(@Body() body: any) {
    this.notificationSse.broadcast(body);
    return { ok: true };
  }
}
