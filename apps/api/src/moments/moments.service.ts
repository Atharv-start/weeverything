import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@weeverything/database';

@Injectable()
export class MomentsService {
  constructor(private readonly prisma: PrismaClient) {}

  async createPost(authorId: string, content: string, visibility = 'PUBLIC') {
    return this.prisma.post.create({
      data: { authorId, content, visibility },
      include: { author: { select: { id: true, username: true, displayName: true, profile: { select: { avatarUrl: true } } } } },
    });
  }

  async getFeed(userId: string, feedType: 'connections' | 'discover', cursor?: string, limit = 20) {
    let where: any = { deletedAt: null };

    if (feedType === 'connections') {
      const connections = await this.prisma.connection.findMany({
        where: { userId },
        select: { connectedId: true },
      });
      const connectionIds = connections.map((c) => c.connectedId);
      where.authorId = { in: [userId, ...connectionIds] };
    } else {
      where.visibility = 'PUBLIC';
    }

    // Exclude blocked
    const blocked = await this.prisma.blockedUser.findMany({
      where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
    });
    const blockedIds = blocked.flatMap((b) => [b.blockerId, b.blockedId]).filter((id) => id !== userId);
    where.authorId = { ...(where.authorId ?? {}), notIn: blockedIds };

    const posts = await this.prisma.post.findMany({
      where,
      include: {
        author: { select: { id: true, username: true, displayName: true, profile: { select: { avatarUrl: true } } } },
        media: true,
        _count: { select: { likes: true, comments: true } },
        likes: { where: { userId }, select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = posts.length > limit;
    const items = (hasMore ? posts.slice(0, limit) : posts).map((p) => ({
      ...p,
      likesCount: p._count.likes,
      commentsCount: p._count.comments,
      isLiked: p.likes.length > 0,
    }));

    return { items, hasMore, nextCursor: hasMore ? items[items.length - 1]?.id : null };
  }

  async likePost(postId: string, userId: string) {
    const post = await this.prisma.post.findFirst({ where: { id: postId, deletedAt: null } });
    if (!post) throw new NotFoundException('Post not found');

    await this.prisma.$transaction(async (tx) => {
      await tx.postLike.upsert({
        where: { postId_userId: { postId, userId } },
        create: { postId, userId },
        update: {},
      });
      await tx.post.update({ where: { id: postId }, data: { likesCount: { increment: 1 } } });
    });
    return { liked: true };
  }

  async unlikePost(postId: string, userId: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.postLike.deleteMany({ where: { postId, userId } });
      await tx.post.update({ where: { id: postId }, data: { likesCount: { decrement: 1 } } });
    });
    return { liked: false };
  }

  async addComment(postId: string, authorId: string, content: string, replyToId?: string) {
    const post = await this.prisma.post.findFirst({ where: { id: postId, deletedAt: null } });
    if (!post) throw new NotFoundException('Post not found');

    const comment = await this.prisma.$transaction(async (tx) => {
      const c = await tx.comment.create({
        data: { postId, authorId, content, replyToId },
        include: { author: { select: { id: true, username: true, displayName: true, profile: { select: { avatarUrl: true } } } } },
      });
      await tx.post.update({ where: { id: postId }, data: { commentsCount: { increment: 1 } } });
      return c;
    });
    return comment;
  }

  async deletePost(postId: string, userId: string) {
    const post = await this.prisma.post.findFirst({ where: { id: postId, authorId: userId, deletedAt: null } });
    if (!post) throw new NotFoundException('Post not found');
    return this.prisma.post.update({ where: { id: postId }, data: { deletedAt: new Date() } });
  }

  async bookmarkPost(postId: string, userId: string) {
    await this.prisma.bookmark.upsert({
      where: { userId_postId: { userId, postId } },
      create: { userId, postId },
      update: {},
    });
    return { bookmarked: true };
  }

  async getPost(postId: string, userId: string) {
    const post = await this.prisma.post.findFirst({
      where: { id: postId, deletedAt: null },
      include: {
        author: { select: { id: true, username: true, displayName: true, profile: { select: { avatarUrl: true } } } },
        media: true,
        _count: { select: { likes: true, comments: true } },
        likes: { where: { userId }, select: { id: true } },
        comments: {
          where: { deletedAt: null, replyToId: null },
          include: { author: { select: { id: true, username: true, displayName: true, profile: { select: { avatarUrl: true } } } } },
          orderBy: { createdAt: 'asc' },
          take: 50,
        },
      },
    });
    if (!post) throw new NotFoundException('Post not found');
    return { ...post, isLiked: post.likes.length > 0, likesCount: post._count.likes, commentsCount: post._count.comments };
  }
}
