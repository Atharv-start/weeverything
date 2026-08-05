import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@weeverything/database';

@Injectable()
export class ConversationsService {
  constructor(private readonly prisma: PrismaClient) {}

  async verifyMembership(conversationId: string, userId: string) {
    const member = await this.prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!member || member.leftAt) throw new ForbiddenException('Not a member of this conversation');
    return member;
  }

  async getOrCreateDirect(userAId: string, userBId: string) {
    // Check existing
    const existing = await this.prisma.conversation.findFirst({
      where: {
        type: 'DIRECT',
        members: { every: { userId: { in: [userAId, userBId] }, leftAt: null } },
        AND: [
          { members: { some: { userId: userAId } } },
          { members: { some: { userId: userBId } } },
        ],
      },
      include: { members: { include: { user: { select: { id: true, username: true, displayName: true, profile: { select: { avatarUrl: true } } } } } } },
    });

    if (existing) return existing;

    return this.prisma.conversation.create({
      data: {
        type: 'DIRECT',
        createdById: userAId,
        members: {
          create: [{ userId: userAId }, { userId: userBId }],
        },
      },
      include: { members: { include: { user: { select: { id: true, username: true, displayName: true, profile: { select: { avatarUrl: true } } } } } } },
    });
  }

  async createGroup(creatorId: string, name: string, memberIds: string[]) {
    const allMemberIds = [...new Set([creatorId, ...memberIds])];

    return this.prisma.conversation.create({
      data: {
        type: 'GROUP',
        name,
        createdById: creatorId,
        members: {
          create: allMemberIds.map((id) => ({
            userId: id,
            role: id === creatorId ? 'OWNER' : 'MEMBER',
          })),
        },
      },
      include: { members: true },
    });
  }

  async listConversations(userId: string) {
    const memberships = await this.prisma.conversationMember.findMany({
      where: { userId, leftAt: null },
      include: {
        conversation: {
          include: {
            members: {
              where: { leftAt: null },
              include: {
                user: {
                  select: { id: true, username: true, displayName: true, profile: { select: { avatarUrl: true } } },
                },
              },
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              where: { deletedAt: null },
            },
          },
        },
      },
      orderBy: { conversation: { lastMessageAt: 'desc' } },
    });

    return memberships.map((m) => m.conversation);
  }

  async getConversation(conversationId: string, userId: string) {
    await this.verifyMembership(conversationId, userId);

    return this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        members: {
          where: { leftAt: null },
          include: {
            user: {
              select: { id: true, username: true, displayName: true, profile: { select: { avatarUrl: true } } },
            },
          },
        },
      },
    });
  }
}
