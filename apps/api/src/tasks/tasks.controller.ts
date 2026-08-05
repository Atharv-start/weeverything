import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IsString, IsOptional, IsDateString } from 'class-validator';

class CreateTaskDto {
  @IsString() title!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() priority?: string;
  @IsOptional() @IsDateString() dueDate?: string;
}
class UpdateTaskDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() priority?: string;
  @IsOptional() @IsDateString() dueDate?: string;
}

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async list(
    @CurrentUser() user: { id: string },
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('search') search?: string,
  ) {
    const result = await this.tasksService.list(user.id, { status, priority, search });
    return { success: true, data: result };
  }

  @Post()
  async create(@Body() dto: CreateTaskDto, @CurrentUser() user: { id: string }) {
    const result = await this.tasksService.create(user.id, { ...dto, dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined });
    return { success: true, data: result };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @CurrentUser() user: { id: string }) {
    const result = await this.tasksService.update(id, user.id, { ...dto, dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined });
    return { success: true, data: result };
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    await this.tasksService.delete(id, user.id);
    return { success: true, data: { deleted: true } };
  }
}
