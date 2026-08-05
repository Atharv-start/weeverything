import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IsString, IsOptional } from 'class-validator';

class SendMessageDto {
  @IsString() content: string;
  @IsOptional() @IsString() replyToId?: string;
}
class EditMessageDto { @IsString() content: string; }
class ReactionDto { @IsString() emoji: string; }

@UseGuards(JwtAuthGuard)
@Controller('conversations/:conversationId/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  async list(
    @Param('conversationId') conversationId: string,
    @CurrentUser() user: { id: string },
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.messagesService.getMessages(conversationId, user.id, cursor, limit ? parseInt(limit) : 30);
    return { success: true, data: result.items, meta: { nextCursor: result.nextCursor, hasMore: result.hasMore } };
  }

  @Post()
  async send(
    @Param('conversationId') conversationId: string,
    @Body() dto: SendMessageDto,
    @CurrentUser() user: { id: string },
  ) {
    const result = await this.messagesService.sendMessage(conversationId, user.id, dto.content, dto.replyToId);
    return { success: true, data: result };
  }

  @Put(':messageId')
  async edit(
    @Param('messageId') messageId: string,
    @Body() dto: EditMessageDto,
    @CurrentUser() user: { id: string },
  ) {
    const result = await this.messagesService.editMessage(messageId, user.id, dto.content);
    return { success: true, data: result };
  }

  @Delete(':messageId')
  async delete(@Param('messageId') messageId: string, @CurrentUser() user: { id: string }) {
    const result = await this.messagesService.deleteMessage(messageId, user.id);
    return { success: true, data: result };
  }

  @Post(':messageId/reactions')
  async addReaction(
    @Param('messageId') messageId: string,
    @Body() dto: ReactionDto,
    @CurrentUser() user: { id: string },
  ) {
    const result = await this.messagesService.addReaction(messageId, user.id, dto.emoji);
    return { success: true, data: result };
  }

  @Delete(':messageId/reactions/:emoji')
  async removeReaction(
    @Param('messageId') messageId: string,
    @Param('emoji') emoji: string,
    @CurrentUser() user: { id: string },
  ) {
    const result = await this.messagesService.removeReaction(messageId, user.id, emoji);
    return { success: true, data: result };
  }

  @Post(':messageId/read')
  @HttpCode(HttpStatus.OK)
  async markRead(
    @Param('conversationId') conversationId: string,
    @Param('messageId') messageId: string,
    @CurrentUser() user: { id: string },
  ) {
    const result = await this.messagesService.markRead(conversationId, user.id, messageId);
    return { success: true, data: result };
  }
}
