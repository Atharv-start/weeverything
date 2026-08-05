import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { MomentsService } from './moments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IsString, IsOptional } from 'class-validator';

class CreatePostDto {
  @IsString() content: string;
  @IsOptional() @IsString() visibility?: string;
}
class AddCommentDto {
  @IsString() content: string;
  @IsOptional() @IsString() replyToId?: string;
}

@UseGuards(JwtAuthGuard)
@Controller('moments')
export class MomentsController {
  constructor(private readonly momentsService: MomentsService) {}

  @Get()
  async getFeed(
    @CurrentUser() user: { id: string },
    @Query('type') type: 'connections' | 'discover' = 'connections',
    @Query('cursor') cursor?: string,
  ) {
    const result = await this.momentsService.getFeed(user.id, type, cursor);
    return { success: true, data: result.items, meta: { nextCursor: result.nextCursor, hasMore: result.hasMore } };
  }

  @Post()
  async create(@Body() dto: CreatePostDto, @CurrentUser() user: { id: string }) {
    const result = await this.momentsService.createPost(user.id, dto.content, dto.visibility);
    return { success: true, data: result };
  }

  @Get(':id')
  async getPost(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    const result = await this.momentsService.getPost(id, user.id);
    return { success: true, data: result };
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    const result = await this.momentsService.deletePost(id, user.id);
    return { success: true, data: result };
  }

  @Post(':id/like')
  async like(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    const result = await this.momentsService.likePost(id, user.id);
    return { success: true, data: result };
  }

  @Delete(':id/like')
  async unlike(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    const result = await this.momentsService.unlikePost(id, user.id);
    return { success: true, data: result };
  }

  @Post(':id/comments')
  async comment(@Param('id') id: string, @Body() dto: AddCommentDto, @CurrentUser() user: { id: string }) {
    const result = await this.momentsService.addComment(id, user.id, dto.content, dto.replyToId);
    return { success: true, data: result };
  }

  @Post(':id/bookmark')
  async bookmark(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    const result = await this.momentsService.bookmarkPost(id, user.id);
    return { success: true, data: result };
  }
}
