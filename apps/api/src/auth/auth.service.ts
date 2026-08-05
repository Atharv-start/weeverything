import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@weeverything/database';
import * as argon2 from 'argon2';
import { nanoid } from 'nanoid';
import { createHash } from 'crypto';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { JwtPayload } from '@weeverything/types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async register(dto: RegisterDto, ipAddress?: string) {
    if (!dto.acceptTerms) {
      throw new BadRequestException('You must accept the terms of service');
    }

    const [emailExists, usernameExists] = await Promise.all([
      this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } }),
      this.prisma.user.findUnique({ where: { username: dto.username.toLowerCase() } }),
    ]);

    if (emailExists) throw new ConflictException('Email already registered');
    if (usernameExists) throw new ConflictException('Username already taken');

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          username: dto.username.toLowerCase(),
          displayName: dto.displayName,
          passwordHash,
        },
      });

      // Create default profile
      await tx.userProfile.create({ data: { userId: newUser.id } });

      // Create default privacy settings
      await tx.privacySetting.create({ data: { userId: newUser.id } });

      // Create wallet
      await tx.wallet.create({ data: { userId: newUser.id } });

      return newUser;
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role, ipAddress);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async login(dto: LoginDto, ipAddress?: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.identifier.toLowerCase() },
          { username: dto.identifier.toLowerCase() },
        ],
      },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.passwordHash) throw new UnauthorizedException('Please sign in using Clerk');
    if (user.status === 'SUSPENDED') throw new UnauthorizedException('Account suspended');
    if (user.status === 'DELETED') throw new UnauthorizedException('Account not found');

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokens(user.id, user.email, user.role, ipAddress);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async refreshToken(rawToken: string, ipAddress?: string) {
    const tokenHash = this.hashToken(rawToken);

    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      // Possible token theft — revoke all tokens for security
      if (stored) {
        await this.prisma.refreshToken.updateMany({
          where: { userId: stored.userId },
          data: { revokedAt: new Date() },
        });
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const { user } = stored;
    if (user.status !== 'ACTIVE') throw new UnauthorizedException('Account unavailable');

    // Revoke used token
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.generateTokens(user.id, user.email, user.role, ipAddress, stored.sessionId ?? undefined);
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      const tokenHash = this.hashToken(refreshToken);
      await this.prisma.refreshToken.updateMany({
        where: { userId, tokenHash },
        data: { revokedAt: new Date() },
      });
    }
    return { success: true };
  }

  async logoutAll(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { success: true };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    // Always return success — do not leak user existence
    if (!user) return { success: true, message: 'If the email exists, a reset link has been sent' };

    const token = nanoid(64);
    const tokenHash = this.hashToken(token);

    await this.prisma.passwordResetToken.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
      },
      update: {
        tokenHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        usedAt: null,
      },
    });

    // In production: send email with token
    // For development: log the token (NEVER in production)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] Password reset token for ${user.email}: ${token}`);
    }

    return { success: true, message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = this.hashToken(dto.token);

    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
      // Revoke all refresh tokens on password change
      this.prisma.refreshToken.updateMany({
        where: { userId: resetToken.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return { success: true, message: 'Password has been reset successfully' };
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: string,
    ipAddress?: string,
    existingSessionId?: string,
  ) {
    const sessionId = existingSessionId ?? nanoid();

    const payload: JwtPayload = {
      sub: userId,
      email,
      role: role as JwtPayload['role'],
      sessionId,
    };

    const [accessToken, rawRefreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.get('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN') ?? '15m',
      }),
      Promise.resolve(nanoid(128)),
    ]);

    const refreshToken = rawRefreshToken;
    const tokenHash = this.hashToken(refreshToken);

    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + 30);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        sessionId,
        expiresAt: refreshExpiry,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // seconds
    };
  }

  private sanitizeUser(user: { id: string; email: string; username: string; displayName: string; role: string; status: string; emailVerified: boolean; createdAt: Date }) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };
  }
}
