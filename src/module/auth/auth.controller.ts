import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async signUp(
    @Body() authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ message: string }> {
    await this.authService.signUp(authCredentialsDto);
    return { message: '회원가입이 성공적으로 완료되었습니다.' };
  }

  @Post('/login')
  async signIn(
    @Body() authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.signIn(authCredentialsDto);
  }
}
