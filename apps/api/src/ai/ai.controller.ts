import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IsString } from 'class-validator';

class ChatSuggestionsDto { @IsString() conversationId: string; }
class TaskPlanDto { @IsString() description: string; }
class UniversalDto { @IsString() query: string; }
class MomentsDto { @IsString() caption: string; }

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat-suggestions')
  async getChatSuggestions(@Body() dto: ChatSuggestionsDto, @CurrentUser() user: { id: string }) {
    const result = await this.aiService.getChatSuggestions(dto.conversationId, user.id);
    return { success: true, data: result };
  }

  @Post('task-plan')
  async generateTaskPlan(@Body() dto: TaskPlanDto) {
    const result = await this.aiService.generateTaskPlan(dto.description);
    return { success: true, data: result };
  }

  @Get('expense-insights')
  async getExpenseInsights(@CurrentUser() user: { id: string }) {
    const result = await this.aiService.getExpenseInsights(user.id);
    return { success: true, data: result };
  }

  @Post('universal')
  async assistUniversal(@Body() dto: UniversalDto) {
    const result = await this.aiService.assistUniversal(dto.query);
    return { success: true, data: result };
  }

  @Post('moments')
  async assistMoments(@Body() dto: MomentsDto) {
    const result = await this.aiService.assistMoments(dto.caption);
    return { success: true, data: result };
  }
}
