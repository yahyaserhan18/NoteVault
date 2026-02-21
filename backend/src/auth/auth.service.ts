import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Role } from '../commen/enums/role.enum';
import { EnvSchema } from '../config';
import { PrismaService } from '../prisma/prisma.service';
import { UsersRepository } from '../users/users.repository';
import { TokenResponseDto } from './dto/token-response.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvSchema, true>,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<{ id: string; email: string; role: Role }> {
    const user = await this.usersRepository.findByEmailWithPassword(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return { id: user.id, email: user.email, role: user.role };
  }

  async login(
    userId: string,
    email: string,
    role: Role,
  ): Promise<TokenResponseDto> {
    const tokens = await this.generateTokens(userId, email, role);
    await this.storeRefreshToken(userId, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string, rawRefreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(rawRefreshToken);
    await this.prisma.refreshToken.deleteMany({
      where: { userId, tokenHash },
    });
  }

  async refreshTokens(
    userId: string,
    email: string,
    role: Role,
    rawRefreshToken: string,
  ): Promise<TokenResponseDto> {
    const tokenHash = this.hashToken(rawRefreshToken);

    const storedToken = await this.prisma.refreshToken.findFirst({
      where: { userId, tokenHash },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token not recognised');
    }

    if (storedToken.expiresAt < new Date()) {
      await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw new UnauthorizedException('Refresh token has expired');
    }

    // Token rotation: delete old, issue new pair
    await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });

    const tokens = await this.generateTokens(userId, email, role);
    await this.storeRefreshToken(userId, tokens.refreshToken);
    return tokens;
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: Role,
  ): Promise<TokenResponseDto> {
    const payload: JwtPayload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_ACCESS_SECRET', { infer: true }),
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRY', { infer: true }),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET', { infer: true }),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRY', {
          infer: true,
        }),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(
    userId: string,
    rawRefreshToken: string,
  ): Promise<void> {
    const tokenHash = this.hashToken(rawRefreshToken);
    const expiresAt = this.parseRefreshTokenExpiry();

    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private parseRefreshTokenExpiry(): Date {
    const expiry = this.configService.get('JWT_REFRESH_EXPIRY', {
      infer: true,
    });

    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(`Invalid JWT_REFRESH_EXPIRY format: "${expiry}". Use formats like 7d, 24h, 60m.`);
    }

    const value = parseInt(match[1], 10);
    const unitMs: Record<string, number> = {
      s: 1_000,
      m: 60_000,
      h: 3_600_000,
      d: 86_400_000,
    };

    return new Date(Date.now() + value * unitMs[match[2]]);
  }
}
