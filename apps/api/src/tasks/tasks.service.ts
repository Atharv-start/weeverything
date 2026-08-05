import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@weeverything/database';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaClient) {}

  async create(userId: string, data: { title: string; description?: string; priority?: string; dueDate?: Date }) {
    return this.prisma.task.create({ data: { userId, ...data } });
  }

  async list(userId: string, filters?: { status?: string; priority?: string; search?: string }) {
    return this.prisma.task.findMany({
      where: {
        userId,
        ...(filters?.status ? { status: filters.status } : {}),
        ...(filters?.priority ? { priority: filters.priority } : {}),
        ...(filters?.search ? { title: { contains: filters.search } } : {}),
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async update(taskId: string, userId: string, data: Partial<{ title: string; description: string; status: string; priority: string; dueDate: Date }>) {
    const task = await this.prisma.task.findFirst({ where: { id: taskId, userId } });
    if (!task) throw new NotFoundException('Task not found');

    const updateData: any = { ...data };
    if (data.status === 'COMPLETED') updateData.completedAt = new Date();
    else if (data.status && data.status !== 'COMPLETED') updateData.completedAt = null;

    return this.prisma.task.update({ where: { id: taskId }, data: updateData });
  }

  async delete(taskId: string, userId: string) {
    const task = await this.prisma.task.findFirst({ where: { id: taskId, userId } });
    if (!task) throw new NotFoundException('Task not found');
    return this.prisma.task.delete({ where: { id: taskId } });
  }
}
