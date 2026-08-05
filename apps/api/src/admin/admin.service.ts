import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@weeverything/database';

export enum SuspendAction {
  SUSPEND = 'SUSPEND',
  REACTIVATE = 'REACTIVATE',
}

export interface ModerationDto {
  action: SuspendAction;
  reason: string;
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaClient) {}

  async getDashboard() {
    const [users, posts, reports] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.post.count({ where: { deletedAt: null } }),
      this.prisma.report.count({ where: { status: 'PENDING' } }),
    ]);
    return { totalUsers: users, totalPosts: posts, pendingReports: reports };
  }

  async getUsers(search?: string, status?: string, page = 1) {
    const limit = 20;
    const skip = (page - 1) * limit;

    const where = {
      ...(search
        ? {
            OR: [
              { username: { contains: search } },
              { email: { contains: search } },
              { displayName: { contains: search } },
            ],
          }
        : {}),
      ...(status ? { status } : {}),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          role: true,
          status: true,
          emailVerified: true,
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async moderateUser(userId: string, adminId: string, dto: ModerationDto) {
    const newStatus = dto.action === SuspendAction.SUSPEND ? 'SUSPENDED' : 'ACTIVE';

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { status: newStatus },
      }),
      this.prisma.moderationAction.create({
        data: {
          moderatorId: adminId,
          targetUserId: userId,
          action: dto.action,
          reason: dto.reason,
        },
      }),
      this.prisma.auditLog.create({
        data: {
          userId: adminId,
          action: `user.${dto.action.toLowerCase()}`,
          entity: 'User',
          entityId: userId,
          details: JSON.stringify({ reason: dto.reason, newStatus }),
        },
      }),
    ]);

    return { action: dto.action, newStatus };
  }

  async getReports(status?: string) {
    return this.prisma.report.findMany({
      where: { ...(status ? { status } : {}) },
      include: {
        reporter: { select: { id: true, username: true } },
        reportedUser: { select: { id: true, username: true } },
        reportedPost: { select: { id: true, content: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async reviewReport(reportId: string, adminId: string, status: string) {
    return this.prisma.report.update({
      where: { id: reportId },
      data: { status, reviewedById: adminId, reviewedAt: new Date() },
    });
  }

  async getAuditLogs(page = 1) {
    const limit = 50;
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        include: { user: { select: { id: true, username: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count(),
    ]);
    return { logs, total, page, limit };
  }
}
