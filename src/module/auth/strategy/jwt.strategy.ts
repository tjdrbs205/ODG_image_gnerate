import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../../repositories/users/user.repository';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userRepository: UserRepository,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>('runtime.JWT_TOKEN'),
    });
  }

  async validate(payload: { username: string }) {
    const { username } = payload;
    const user = await this.userRepository.findByUsername(username);

    if (!user) {
      throw new UnauthorizedException();
    }

    const { password, ...result } = user;
    return result;
  }
}
