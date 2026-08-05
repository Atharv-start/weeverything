import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IsString, IsArray, IsOptional } from 'class-validator';

class CreateDirectDto { @IsString() username: string; }
class CreateGroupDto {
  @IsString() name: string;
  @IsArray() memberIds: string[];
}

@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  async list(@CurrentUser() user: { id: string }) {
    const result = await this.conversationsService.listConversations(user.id);
    return { success: true, data: result };
  }

  @Post('direct')
  async createDirect(@Body() dto: CreateDirectDto, @CurrentUser() user: { id: string }) {
    const other = await (this.conversationsService as any).prisma.user.findUnique({ where: { username: dto.username } });
    if (!other) return { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } };
    const result = await this.conversationsService.getOrCreateDirect(user.id, other.id);
    return { success: true, data: result };
  }

  @Post('group')
  async createGroup(@Body() dto: CreateGroupDto, @CurrentUser() user: { id: string }) {
    const result = await this.conversationsService.createGroup(user.id, dto.name, dto.memberIds);
    return { success: true, data: result };
  }

  @Get(':id')
  async get(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    const result = await this.conversationsService.getConversation(id, user.id);
    return { success: true, data: result };
  }
}
