import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@weeverything/database';

@Injectable()
export class PollsService {
  constructor(private readonly prisma: PrismaClient) {}

  async create(creatorId: string, data: {
    question: string;
    options: string[];
    isAnonymous?: boolean;
    isMultiChoice?: boolean;
    expiresAt?: Date;
  }) {
    if (data.options.length < 2) throw new BadRequestException('Poll must have at least 2 options');
    return this.prisma.poll.create({
      data: {
        createdById: creatorId,
        question: data.question,
        isAnonymous: data.isAnonymous,
        isMultiChoice: data.isMultiChoice,
        expiresAt: data.expiresAt,
        options: { create: data.options.map((text, i) => ({ text, order: i })) },
      },
      include: { options: { orderBy: { order: 'asc' } } },
    });
  }

  async list(cursor?: string, limit = 20) {
    const polls = await this.prisma.poll.findMany({
      where: { isActive: true },
      include: { options: { orderBy: { order: 'asc' } }, _count: { select: { votes: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    const hasMore = polls.length > limit;
    const items = hasMore ? polls.slice(0, limit) : polls;
    return { items, hasMore, nextCursor: hasMore ? items[items.length - 1]?.id : null };
  }

  async vote(pollId: string, userId: string, optionIds: string[]) {
    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId },
      include: { options: true },
    });
    if (!poll || !poll.isActive) throw new NotFoundException('Poll not found or closed');
    if (poll.expiresAt && poll.expiresAt < new Date()) throw new BadRequestException('Poll has expired');
    if (!poll.isMultiChoice && optionIds.length > 1) throw new BadRequestException('This poll allows only one vote');

    // Check existing votes
    const existingVotes = await this.prisma.pollVote.findMany({
      where: { pollId, userId },
    });
    if (existingVotes.length > 0) throw new BadRequestException('Already voted');

    // Validate option IDs belong to this poll
    const validOptionIds = new Set(poll.options.map((o) => o.id));
    for (const id of optionIds) {
      if (!validOptionIds.has(id)) throw new BadRequestException('Invalid option');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.pollVote.createMany({
        data: optionIds.map((optionId) => ({ pollId, userId, optionId })),
      });
      for (const optionId of optionIds) {
        await tx.pollOption.update({ where: { id: optionId }, data: { voteCount: { increment: 1 } } });
      }
      return tx.poll.findUnique({
        where: { id: pollId },
        include: { options: { orderBy: { order: 'asc' } }, _count: { select: { votes: true } } },
      });
    });
  }

  async getPoll(pollId: string, userId: string) {
    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: { orderBy: { order: 'asc' } },
        _count: { select: { votes: true } },
      },
    });
    if (!poll) throw new NotFoundException('Poll not found');

    const userVotes = await this.prisma.pollVote.findMany({ where: { pollId, userId }, select: { optionId: true } });
    return { ...poll, userVoteOptionIds: userVotes.map((v) => v.optionId) };
  }
}
