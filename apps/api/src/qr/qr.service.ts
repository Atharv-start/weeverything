import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@weeverything/database';
import { QrPayload } from '@weeverything/types';

@Injectable()
export class QrService {
  constructor(private readonly prisma: PrismaClient) {}

  async generateProfileQr(userId: string) {
    // Fix: find by userId + type (not by publicId which is a random CUID)
    // to ensure one canonical profile QR per user.
    let qr = await this.prisma.qrReference.findFirst({
      where: { userId, type: 'USER_PROFILE' },
    });

    if (!qr) {
      qr = await this.prisma.qrReference.create({
        data: {
          userId,
          type: 'USER_PROFILE',
          payload: JSON.stringify({ version: 'v1', type: 'USER_PROFILE', userId }),
          isActive: true,
        },
      });
    }

    const payload: QrPayload = {
      version: 'v1',
      type: 'USER_PROFILE',
      id: qr.publicId,
      ts: Date.now(),
    };

    return {
      qrUrl: `weeverything://v1/profile/${qr.publicId}`,
      payload,
      publicId: qr.publicId,
    };
  }

  async parseQr(rawPayload: string) {
    try {
      const payload = JSON.parse(rawPayload) as QrPayload;

      if (!payload.version || !payload.type || !payload.id) {
        throw new BadRequestException('Invalid QR payload');
      }

      if (payload.version !== 'v1') {
        throw new BadRequestException('Unsupported QR version');
      }

      const qr = await this.prisma.qrReference.findUnique({
        where: { publicId: payload.id },
        include: { user: { select: { id: true, username: true, displayName: true } } },
      });

      if (!qr || !qr.isActive) throw new BadRequestException('QR code is invalid or expired');

      return { type: qr.type, data: qr.user };
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException('Malformed QR payload');
    }
  }
}
