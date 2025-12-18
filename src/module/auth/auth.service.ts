import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthCredentialsDto } from './dto/auth.dto';
import { UserService } from '../repositories/users/user.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UserCreateInput } from 'generated/prisma/models';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    const { username, password } = authCredentialsDto;

    const existingUser = await this.userService.findByUsername(username);

    if (existingUser) {
      throw new ConflictException('이미 존재하는 사용자명입니다.');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user: UserCreateInput = {
      id: uuidv4(),
      username,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    await this.userService.create(user);
  }

  async signIn(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    const { username, password } = authCredentialsDto;

    const user = await this.userService.findByUsername(username);

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = { username: user.username, sub: user.id };
      const accessToken = await this.jwtService.signAsync(payload);

      return { accessToken };
    } else {
      throw new UnauthorizedException('잘못된 사용자명 또는 비밀번호입니다.');
    }
  }
}
