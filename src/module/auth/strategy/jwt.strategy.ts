import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../../repositories/users/user.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>('runtime.JWT_TOKEN'),
    });
  }

  async validate(payload: { username: string }) {
    const { username } = payload;
    const user = await this.userService.findByUsername(username);

    if (!user) {
      throw new UnauthorizedException();
    }

    const { password, ...result } = user;
    return result;
  }
}
