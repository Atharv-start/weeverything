import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IsString, IsInt, IsArray, IsOptional, Min } from 'class-validator';

class CreateGroupDto {
  @IsString() name: string;
  @IsOptional() @IsString() description?: string;
  @IsArray() memberIds: string[];
}
class AddExpenseDto {
  @IsString() title: string;
  @IsInt() @Min(1) amount: number;
  @IsString() paidById: string;
  @IsString() splitType!: string;
  @IsArray() splits!: Array<{ userId: string; amount?: number; percentage?: number }>;
}

@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  async getUserGroups(@CurrentUser() user: { id: string }) {
    const result = await this.expensesService.getUserGroups(user.id);
    return { success: true, data: result };
  }

  @Post('groups')
  async createGroup(@Body() dto: CreateGroupDto, @CurrentUser() user: { id: string }) {
    const result = await this.expensesService.createGroup(user.id, dto.name, dto.memberIds, dto.description);
    return { success: true, data: result };
  }

  @Get('groups/:id')
  async getGroup(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    const result = await this.expensesService.getGroup(id, user.id);
    return { success: true, data: result };
  }

  @Post('groups/:id/expenses')
  async addExpense(@Param('id') groupId: string, @Body() dto: AddExpenseDto, @CurrentUser() user: { id: string }) {
    const result = await this.expensesService.addExpense({ groupId, userId: user.id, ...dto });
    return { success: true, data: result };
  }
}
