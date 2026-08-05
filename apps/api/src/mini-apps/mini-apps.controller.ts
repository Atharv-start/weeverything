import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaClient } from '@weeverything/database';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('mini-apps')
export class MiniAppsController {
  constructor(private readonly prisma: PrismaClient) {}

  @Public()
  @Get()
  async list() {
    const apps = await this.prisma.miniApp.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { order: 'asc' },
    });
    return { success: true, data: apps };
  }
}
