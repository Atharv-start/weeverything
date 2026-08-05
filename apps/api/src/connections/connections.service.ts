import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@weeverything/database';

@Injectable()
export class ConnectionsService {
  constructor(private readonly prisma: PrismaClient) {}

  async sendRequest(requesterId: string, receiverUsername: string) {
    const receiver = await this.prisma.user.findUnique({
      where: { username: receiverUsername.toLowerCase() },
    });

    if (!receiver) throw new NotFoundException('User not found');
    if (receiver.id === requesterId) throw new BadRequestException('Cannot connect with yourself');
    if (receiver.status !== 'ACTIVE') throw new NotFoundException('User not found');

    // Check blocked
    const blocked = await this.prisma.blockedUser.findFirst({
      where: {
        OR: [
          { blockerId: requesterId, blockedId: receiver.id },
          { blockerId: receiver.id, blockedId: requesterId },
        ],
      },
    });
    if (blocked) throw new NotFoundException('User not found');

    // Check existing connection
    const connected = await this.prisma.connection.findFirst({
      where: {
        OR: [
          { userId: requesterId, connectedId: receiver.id },
          { userId: receiver.id, connectedId: requesterId },
        ],
      },
    });
    if (connected) throw new ConflictException('Already connected');

    // Check existing request
    const existing = await this.prisma.connectionRequest.findFirst({
      where: {
        OR: [
          { requesterId, receiverId: receiver.id, status: 'PENDING' },
          { requesterId: receiver.id, receiverId: requesterId, status: 'PENDING' },
        ],
      },
    });
    if (existing) throw new ConflictException('Connection request already exists');

    return this.prisma.connectionRequest.create({
      data: { requesterId, receiverId: receiver.id },
    });
  }

  async acceptRequest(userId: string, requestId: string) {
    const request = await this.prisma.connectionRequest.findFirst({
      where: { id: requestId, receiverId: userId, status: 'PENDING' },
    });

    if (!request) throw new NotFoundException('Connection request not found');

    return this.prisma.$transaction(async (tx) => {
      await tx.connectionRequest.update({
        where: { id: requestId },
        data: { status: 'ACCEPTED' },
      });

      // Create bidirectional connection (upsert to handle duplicates in SQLite)
      await tx.connection.upsert({
        where: { userId_connectedId: { userId: request.requesterId, connectedId: userId } },
        create: { userId: request.requesterId, connectedId: userId },
        update: {},
      });
      await tx.connection.upsert({
        where: { userId_connectedId: { userId: userId, connectedId: request.requesterId } },
        create: { userId: userId, connectedId: request.requesterId },
        update: {},
      });

      return { success: true };
    });
  }

  async rejectRequest(userId: string, requestId: string) {
    const request = await this.prisma.connectionRequest.findFirst({
      where: { id: requestId, receiverId: userId, status: 'PENDING' },
    });
    if (!request) throw new NotFoundException('Request not found');

    return this.prisma.connectionRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' },
    });
  }

  async cancelRequest(userId: string, requestId: string) {
    const request = await this.prisma.connectionRequest.findFirst({
      where: { id: requestId, requesterId: userId, status: 'PENDING' },
    });
    if (!request) throw new NotFoundException('Request not found');

    return this.prisma.connectionRequest.update({
      where: { id: requestId },
      data: { status: 'CANCELLED' },
    });
  }

  async removeConnection(userId: string, targetId: string) {
    await this.prisma.connection.deleteMany({
      where: {
        OR: [
          { userId, connectedId: targetId },
          { userId: targetId, connectedId: userId },
        ],
      },
    });
    return { success: true };
  }

  async blockUser(blockerId: string, blockedUsername: string) {
    const blocked = await this.prisma.user.findUnique({
      where: { username: blockedUsername.toLowerCase() },
    });
    if (!blocked || blocked.id === blockerId) throw new NotFoundException('User not found');

    // Remove any existing connection
    await this.prisma.connection.deleteMany({
      where: {
        OR: [
          { userId: blockerId, connectedId: blocked.id },
          { userId: blocked.id, connectedId: blockerId },
        ],
      },
    });

    // Cancel any pending requests
    await this.prisma.connectionRequest.updateMany({
      where: {
        OR: [
          { requesterId: blockerId, receiverId: blocked.id, status: 'PENDING' },
          { requesterId: blocked.id, receiverId: blockerId, status: 'PENDING' },
        ],
      },
      data: { status: 'CANCELLED' },
    });

    return this.prisma.blockedUser.upsert({
      where: { blockerId_blockedId: { blockerId, blockedId: blocked.id } },
      create: { blockerId, blockedId: blocked.id },
      update: {},
    });
  }

  async unblockUser(blockerId: string, blockedId: string) {
    await this.prisma.blockedUser.deleteMany({
      where: { blockerId, blockedId },
    });
    return { success: true };
  }

  async getConnections(userId: string, cursor?: string, limit = 20) {
    const connections = await this.prisma.connection.findMany({
      where: { userId },
      include: {
        connected: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profile: { select: { avatarUrl: true, statusMessage: true } },
          },
        },
      },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
    });

    const hasMore = connections.length > limit;
    const items = hasMore ? connections.slice(0, limit) : connections;
    return { items: items.map((c) => c.connected), hasMore, nextCursor: hasMore ? items[items.length - 1]?.id : null };
  }

  async getPendingRequests(userId: string) {
    return this.prisma.connectionRequest.findMany({
      where: { receiverId: userId, status: 'PENDING' },
      include: {
        requester: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profile: { select: { avatarUrl: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
