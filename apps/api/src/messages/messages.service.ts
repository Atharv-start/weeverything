import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@weeverything/database';
import { ConversationsService } from '../conversations/conversations.service';

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly conversationsService: ConversationsService,
  ) {}

  async sendMessage(conversationId: string, senderId: string, content: string, replyToId?: string) {
    await this.conversationsService.verifyMembership(conversationId, senderId);

    const message = await this.prisma.$transaction(async (tx) => {
      const msg = await tx.message.create({
        data: { conversationId, senderId, content, replyToId, type: 'TEXT' },
        include: {
          sender: { select: { id: true, username: true, displayName: true, profile: { select: { avatarUrl: true } } } },
          replyTo: { select: { id: true, content: true, senderId: true } },
        },
      });

      await tx.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      });

      return msg;
    });

    return message;
  }

  async getMessages(conversationId: string, userId: string, cursor?: string, limit = 30) {
    await this.conversationsService.verifyMembership(conversationId, userId);

    const messages = await this.prisma.message.findMany({
      where: { conversationId, deletedAt: null },
      include: {
        sender: { select: { id: true, username: true, displayName: true, profile: { select: { avatarUrl: true } } } },
        reactions: { include: { } },
        readReceipts: { select: { userId: true, readAt: true } },
        replyTo: { select: { id: true, content: true, senderId: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = messages.length > limit;
    const items = hasMore ? messages.slice(0, limit) : messages;
    return { items: items.reverse(), hasMore, nextCursor: hasMore ? items[0]?.id : null };
  }

  async editMessage(messageId: string, userId: string, content: string) {
    const message = await this.prisma.message.findFirst({
      where: { id: messageId, senderId: userId, deletedAt: null },
    });
    if (!message) throw new NotFoundException('Message not found or access denied');

    return this.prisma.message.update({
      where: { id: messageId },
      data: { content, isEdited: true, editedAt: new Date() },
    });
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.message.findFirst({
      where: { id: messageId, senderId: userId, deletedAt: null },
    });
    if (!message) throw new NotFoundException('Message not found or access denied');

    return this.prisma.message.update({
      where: { id: messageId },
      data: { deletedAt: new Date(), content: null },
    });
  }

  async addReaction(messageId: string, userId: string, emoji: string) {
    return this.prisma.messageReaction.upsert({
      where: { messageId_userId_emoji: { messageId, userId, emoji } },
      create: { messageId, userId, emoji },
      update: {},
    });
  }

  async removeReaction(messageId: string, userId: string, emoji: string) {
    await this.prisma.messageReaction.deleteMany({
      where: { messageId, userId, emoji },
    });
    return { success: true };
  }

  async markRead(conversationId: string, userId: string, messageId: string) {
    await this.conversationsService.verifyMembership(conversationId, userId);

    await Promise.all([
      this.prisma.messageReadReceipt.upsert({
        where: { messageId_userId: { messageId, userId } },
        create: { messageId, userId },
        update: { readAt: new Date() },
      }),
      this.prisma.conversationMember.update({
        where: { conversationId_userId: { conversationId, userId } },
        data: { lastReadAt: new Date() },
      }),
    ]);
    return { success: true };
  }
}
