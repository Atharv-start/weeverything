import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@weeverything/database';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaClient) {}

  async findByUsername(username: string, requestingUserId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      include: {
        profile: true,
        privacySetting: true,
        _count: {
          select: {
            connections: true,
            connectedTo: true,
            posts: { where: { deletedAt: null } },
          },
        },
      },
    });

    if (!user || user.status === 'DELETED') throw new NotFoundException('User not found');

    // Check blocked
    if (requestingUserId) {
      const blocked = await this.prisma.blockedUser.findFirst({
        where: {
          OR: [
            { blockerId: user.id, blockedId: requestingUserId },
            { blockerId: requestingUserId, blockedId: user.id },
          ],
        },
      });
      if (blocked) throw new NotFoundException('User not found');
    }

    return this.formatPublicProfile(user, requestingUserId);
  }

  async searchUsers(query: string, requestingUserId: string, limit = 20, cursor?: string) {
    const users = await this.prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { username: { contains: query } },
              { displayName: { contains: query } },
            ],
          },
          { status: 'ACTIVE' },
          { id: { not: requestingUserId } },
          {
            blockedBy: { none: { blockerId: requestingUserId } },
          },
          {
            blockedUsers: { none: { blockedId: requestingUserId } },
          },
        ],
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        profile: { select: { avatarUrl: true, bio: true, statusMessage: true } },
      },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = users.length > limit;
    const items = hasMore ? users.slice(0, limit) : users;
    const nextCursor = hasMore ? items[items.length - 1]?.id : null;

    return { items, nextCursor, hasMore };
  }

  async updateProfile(
    userId: string,
    data: {
      displayName?: string;
      bio?: string;
      statusMessage?: string;
      location?: string;
      website?: string;
    },
  ) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: data.displayName ? { displayName: data.displayName } : {},
      include: { profile: true },
    });

    const profile = await this.prisma.userProfile.update({
      where: { userId },
      data: {
        bio: data.bio,
        statusMessage: data.statusMessage,
        location: data.location,
        website: data.website,
      },
    });

    return { ...user, profile };
  }

  async updatePrivacySettings(
    userId: string,
    data: {
      profileVisibility?: string;
      momentVisibility?: string;
      onlineStatusVisible?: boolean;
      lastSeenVisible?: boolean;
      allowConnectionFromAll?: boolean;
    },
  ) {
    return this.prisma.privacySetting.update({
      where: { userId },
      data,
    });
  }

  async getSessions(userId: string) {
    return this.prisma.session.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { lastActiveAt: 'desc' },
    });
  }

  async revokeSession(userId: string, sessionId: string) {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) throw new NotFoundException('Session not found');

    return this.prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });
  }

  private formatPublicProfile(user: any, _requestingUserId?: string) {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
