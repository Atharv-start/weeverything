import { Controller, Post, Delete, Get, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ConnectionsService } from './connections.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IsString } from 'class-validator';

class SendRequestDto {
  @IsString() username: string;
}

class BlockUserDto {
  @IsString() username: string;
}

@UseGuards(JwtAuthGuard)
@Controller('connections')
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @Post('request')
  async sendRequest(@Body() dto: SendRequestDto, @CurrentUser() user: { id: string }) {
    const result = await this.connectionsService.sendRequest(user.id, dto.username);
    return { success: true, data: result };
  }

  @Post('request/:id/accept')
  @HttpCode(HttpStatus.OK)
  async acceptRequest(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    const result = await this.connectionsService.acceptRequest(user.id, id);
    return { success: true, data: result };
  }

  @Post('request/:id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectRequest(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    const result = await this.connectionsService.rejectRequest(user.id, id);
    return { success: true, data: result };
  }

  @Delete('request/:id')
  async cancelRequest(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    const result = await this.connectionsService.cancelRequest(user.id, id);
    return { success: true, data: result };
  }

  @Delete(':targetId')
  async removeConnection(@Param('targetId') targetId: string, @CurrentUser() user: { id: string }) {
    const result = await this.connectionsService.removeConnection(user.id, targetId);
    return { success: true, data: result };
  }

  @Post('block')
  async blockUser(@Body() dto: BlockUserDto, @CurrentUser() user: { id: string }) {
    const result = await this.connectionsService.blockUser(user.id, dto.username);
    return { success: true, data: result };
  }

  @Delete('block/:blockedId')
  async unblockUser(@Param('blockedId') blockedId: string, @CurrentUser() user: { id: string }) {
    const result = await this.connectionsService.unblockUser(user.id, blockedId);
    return { success: true, data: result };
  }

  @Get()
  async getConnections(
    @CurrentUser() user: { id: string },
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.connectionsService.getConnections(
      user.id,
      cursor,
      limit ? parseInt(limit) : 20,
    );
    return { success: true, data: result.items, meta: { nextCursor: result.nextCursor, hasMore: result.hasMore } };
  }

  @Get('requests/pending')
  async getPendingRequests(@CurrentUser() user: { id: string }) {
    const result = await this.connectionsService.getPendingRequests(user.id);
    return { success: true, data: result };
  }
}
