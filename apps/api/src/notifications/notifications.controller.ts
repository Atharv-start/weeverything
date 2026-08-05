import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async list(@CurrentUser() user: { id: string }, @Query('cursor') cursor?: string) {
    const result = await this.notificationsService.list(user.id, cursor);
    return { success: true, data: result.items, meta: { nextCursor: result.nextCursor, hasMore: result.hasMore } };
  }

  @Get('unread-count')
  async unreadCount(@CurrentUser() user: { id: string }) {
    const count = await this.notificationsService.getUnreadCount(user.id);
    return { success: true, data: { count } };
  }

  @Post(':id/read')
  async markRead(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    const result = await this.notificationsService.markRead(id, user.id);
    return { success: true, data: result };
  }

  @Post('mark-all-read')
  async markAllRead(@CurrentUser() user: { id: string }) {
    const result = await this.notificationsService.markAllRead(user.id);
    return { success: true, data: result };
  }
}
