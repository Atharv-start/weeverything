import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PollsService } from './polls.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IsString, IsArray, IsOptional, IsBoolean, IsDateString } from 'class-validator';

class CreatePollDto {
  @IsString() question: string;
  @IsArray() options: string[];
  @IsOptional() @IsBoolean() isAnonymous?: boolean;
  @IsOptional() @IsBoolean() isMultiChoice?: boolean;
  @IsOptional() @IsDateString() expiresAt?: string;
}
class VoteDto { @IsArray() optionIds: string[]; }

@UseGuards(JwtAuthGuard)
@Controller('polls')
export class PollsController {
  constructor(private readonly pollsService: PollsService) {}

  @Get()
  async list(@Query('cursor') cursor?: string) {
    const result = await this.pollsService.list(cursor);
    return { success: true, data: result.items, meta: { nextCursor: result.nextCursor, hasMore: result.hasMore } };
  }

  @Post()
  async create(@Body() dto: CreatePollDto, @CurrentUser() user: { id: string }) {
    const result = await this.pollsService.create(user.id, { ...dto, expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined });
    return { success: true, data: result };
  }

  @Get(':id')
  async get(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    const result = await this.pollsService.getPoll(id, user.id);
    return { success: true, data: result };
  }

  @Post(':id/vote')
  async vote(@Param('id') id: string, @Body() dto: VoteDto, @CurrentUser() user: { id: string }) {
    const result = await this.pollsService.vote(id, user.id, dto.optionIds);
    return { success: true, data: result };
  }
}
