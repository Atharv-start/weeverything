import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IsString, IsEnum } from 'class-validator';
import { AdminService, SuspendAction } from './admin.service';

class ModerationDto {
  @IsEnum(SuspendAction)
  action!: SuspendAction;

  @IsString()
  reason!: string;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  async getDashboard() {
    const data = await this.adminService.getDashboard();
    return { success: true, data };
  }

  @Get('users')
  async getUsers(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
  ) {
    const data = await this.adminService.getUsers(search, status, page);
    return {
      success: true,
      data: data.users,
      meta: { total: data.total, page: data.page, limit: data.limit, totalPages: data.totalPages },
    };
  }

  @Put('users/:id/moderation')
  async moderateUser(
    @Param('id') userId: string,
    @Body() dto: ModerationDto,
    @CurrentUser() admin: { id: string },
  ) {
    const data = await this.adminService.moderateUser(userId, admin.id, dto);
    return { success: true, data };
  }

  @Get('reports')
  async getReports(@Query('status') status?: string) {
    const data = await this.adminService.getReports(status);
    return { success: true, data };
  }

  @Put('reports/:id/review')
  async reviewReport(
    @Param('id') reportId: string,
    @Body() dto: { status: string },
    @CurrentUser() admin: { id: string },
  ) {
    const data = await this.adminService.reviewReport(reportId, admin.id, dto.status);
    return { success: true, data };
  }

  @Get('audit-logs')
  async getAuditLogs(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
  ) {
    const data = await this.adminService.getAuditLogs(page);
    return { success: true, data: data.logs, meta: { total: data.total, page: data.page, limit: data.limit } };
  }
}
