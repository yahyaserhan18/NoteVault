import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtRefreshPayload } from './strategies/jwt-refresh.strategy';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<TokenResponseDto> {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    return this.authService.login(user.id, user.email, user.role);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtRefreshGuard)
  async logout(@Req() req: Request): Promise<void> {
    const user = req.user as JwtRefreshPayload;
    await this.authService.logout(user.sub, user.refreshToken);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  async refresh(@Req() req: Request): Promise<TokenResponseDto> {
    const user = req.user as JwtRefreshPayload;
    return this.authService.refreshTokens(
      user.sub,
      user.email,
      user.role,
      user.refreshToken,
    );
  }
}
