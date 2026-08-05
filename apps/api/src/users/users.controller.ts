import { Controller, Get, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IsOptional, IsString, MaxLength } from 'class-validator';

class UpdateProfileDto {
  @IsOptional() @IsString() @MaxLength(50) displayName?: string;
  @IsOptional() @IsString() @MaxLength(500) bio?: string;
  @IsOptional() @IsString() @MaxLength(100) statusMessage?: string;
  @IsOptional() @IsString() @MaxLength(100) location?: string;
  @IsOptional() @IsString() @MaxLength(200) website?: string;
}

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('search')
  async search(
    @Query('q') q: string,
    @CurrentUser() user: { id: string },
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    const result = await this.usersService.searchUsers(
      q ?? '',
      user.id,
      limit ? parseInt(limit) : 20,
      cursor,
    );
    return {
      success: true,
      data: result.items,
      meta: { nextCursor: result.nextCursor, hasMore: result.hasMore },
    };
  }

  @Get(':username')
  async getProfile(
    @Param('username') username: string,
    @CurrentUser() user: { id: string },
  ) {
    const result = await this.usersService.findByUsername(username, user.id);
    return { success: true, data: result };
  }

  @Put('me/profile')
  async updateProfile(
    @Body() dto: UpdateProfileDto,
    @CurrentUser() user: { id: string },
  ) {
    const result = await this.usersService.updateProfile(user.id, dto);
    return { success: true, data: result };
  }

  @Get('me/sessions')
  async getSessions(@CurrentUser() user: { id: string }) {
    const sessions = await this.usersService.getSessions(user.id);
    return { success: true, data: sessions };
  }
}
