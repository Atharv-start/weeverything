import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@weeverything/database';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: {
    recipientId: string;
    senderId?: string;
    type: string;
    title: string;
    body?: string;
    extraData?: Record<string, unknown>;
  }) {
    return this.prisma.notification.create({
      data: {
        recipientId: data.recipientId,
        senderId: data.senderId,
        type: data.type,
        title: data.title,
        body: data.body,
        data: data.extraData ? JSON.stringify(data.extraData) : undefined,
      },
    });
  }

  async list(userId: string, cursor?: string, limit = 30) {
    const notifications = await this.prisma.notification.findMany({
      where: { recipientId: userId },
      include: {
        sender: { select: { id: true, username: true, displayName: true, profile: { select: { avatarUrl: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = notifications.length > limit;
    const items = hasMore ? notifications.slice(0, limit) : notifications;
    return { items, hasMore, nextCursor: hasMore ? items[items.length - 1]?.id : null };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({ where: { recipientId: userId, isRead: false } });
  }

  async markRead(notificationId: string, userId: string) {
    await this.prisma.notification.updateMany({
      where: { id: notificationId, recipientId: userId },
      data: { isRead: true, readAt: new Date() },
    });
    return { success: true };
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { recipientId: userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { success: true };
  }
}
