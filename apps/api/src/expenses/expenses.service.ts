import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@weeverything/database';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaClient) {}

  async createGroup(creatorId: string, name: string, memberIds: string[], description?: string) {
    const uniqueIds = [...new Set([creatorId, ...memberIds])];
    return this.prisma.expenseGroup.create({
      data: {
        name,
        description,
        createdById: creatorId,
        members: { create: uniqueIds.map((id) => ({ userId: id })) },
      },
      include: { members: { include: { user: { select: { id: true, username: true, displayName: true } } } } },
    });
  }

  async addExpense(opts: {
    groupId: string;
    userId: string;
    title: string;
    amount: number;
    paidById: string;
    splitType: string;
    splits: Array<{ userId: string; amount?: number; percentage?: number }>;
  }) {
    if (!Number.isInteger(opts.amount) || opts.amount <= 0) {
      throw new BadRequestException('Amount must be a positive integer (minor units)');
    }

    // Verify membership
    const member = await this.prisma.expenseGroupMember.findUnique({
      where: { expenseGroupId_userId: { expenseGroupId: opts.groupId, userId: opts.userId } },
    });
    if (!member || !member.isActive) throw new ForbiddenException('Not a group member');

    // Validate splits
    if (opts.splitType === 'EXACT') {
      const total = opts.splits.reduce((s, sp) => s + (sp.amount ?? 0), 0);
      if (total !== opts.amount) {
        throw new BadRequestException(`Split amounts (${total}) do not equal total (${opts.amount})`);
      }
    } else if (opts.splitType === 'PERCENTAGE') {
      const totalPct = opts.splits.reduce((s, sp) => s + (sp.percentage ?? 0), 0);
      if (Math.abs(totalPct - 100) > 0.01) {
        throw new BadRequestException('Percentages must sum to 100');
      }
      // Convert percentages to exact amounts
      opts.splits = opts.splits.map((sp) => ({
        ...sp,
        amount: Math.round(opts.amount * (sp.percentage! / 100)),
      }));
    } else {
      // EQUAL
      const perPerson = Math.floor(opts.amount / opts.splits.length);
      const remainder = opts.amount - perPerson * opts.splits.length;
      opts.splits = opts.splits.map((sp, i) => ({
        ...sp,
        amount: perPerson + (i === 0 ? remainder : 0),
      }));
    }

    return this.prisma.expense.create({
      data: {
        expenseGroupId: opts.groupId,
        title: opts.title,
        amount: opts.amount,
        paidById: opts.paidById,
        splitType: opts.splitType,
        splits: { create: opts.splits.map((sp) => ({ userId: sp.userId, amount: sp.amount! })) },
      },
      include: { splits: true },
    });
  }

  async getGroup(groupId: string, userId: string) {
    const member = await this.prisma.expenseGroupMember.findUnique({
      where: { expenseGroupId_userId: { expenseGroupId: groupId, userId } },
    });
    if (!member || !member.isActive) throw new ForbiddenException('Not a group member');

    return this.prisma.expenseGroup.findUnique({
      where: { id: groupId },
      include: {
        members: { include: { user: { select: { id: true, username: true, displayName: true } } } },
        expenses: { include: { paidBy: { select: { id: true, username: true } }, splits: true }, orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async getUserGroups(userId: string) {
    const memberships = await this.prisma.expenseGroupMember.findMany({
      where: { userId, isActive: true },
      include: { expenseGroup: { include: { _count: { select: { expenses: true, members: true } } } } },
    });
    return memberships.map((m) => m.expenseGroup);
  }
}
