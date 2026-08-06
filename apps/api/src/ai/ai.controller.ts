/**
 * ai.controller.ts
 * Unified AI Platform controller — exposes all AI capabilities via REST + SSE.
 *
 * All endpoints are JWT-protected. Streaming endpoints use Server-Sent Events (SSE).
 *
 * Route prefix: /api/v1/ai
 */

import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Param,
  Res,
  Req,
  HttpCode,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { IsString, IsOptional, IsBoolean, IsEnum, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

// Services
import { AiEngineService } from './engine/ai-engine.service';
import { CopilotService, CopilotMessage } from './copilot/copilot.service';
import { ContentGenService, ContentGenRequest } from './content-gen/content-gen.service';
import { DocumentAiService } from './document-ai/document-ai.service';
import { SummarizationService } from './summarization/summarization.service';
import { AnalyticsService } from './analytics/analytics.service';
import { AnomalyService } from './anomaly/anomaly.service';
import { AutomationService } from './automation/automation.service';
import { PersonalizationService } from './personalization/personalization.service';
import { SemanticSearchService } from './semantic-search/semantic-search.service';
import { NlQueryService } from './nl-query/nl-query.service';
import { RagService } from './rag/rag.service';
import { VoiceService } from './voice/voice.service';
import { AiObservabilityService } from './observability/ai-observability.service';
import { PromptRegistryService } from './prompts/prompt-registry.service';

// ---- DTOs ----

class CopilotDto {
  @IsString() message: string;
  @IsOptional() @IsString() currentPage?: string;
  @IsOptional() history?: CopilotMessage[];
  @IsOptional() @IsBoolean() useRag?: boolean;
}

class ChatSuggestionsDto {
  @IsString() conversationId: string;
}

class ContentGenDto implements Partial<ContentGenRequest> {
  @IsString() type: ContentGenRequest['type'];
  @IsOptional() @IsString() context?: string;
  @IsOptional() @IsString() instructions?: string;
  @IsOptional() @IsString() tone?: ContentGenRequest['tone'];
  @IsOptional() @IsString() caption?: string;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() transcript?: string;
  @IsOptional() @IsString() topic?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() audience?: string;
  @IsOptional() @IsString() keyPoints?: string;
  @IsOptional() @IsString() postContext?: string;
  @IsOptional() @IsString() comment?: string;
  @IsOptional() @IsString() perspective?: string;
}

class DocumentProcessDto {
  @IsString() content: string;
  @IsOptional() @IsBoolean() isOcrText?: boolean;
  @IsOptional() @IsBoolean() ingestIntoRag?: boolean;
  @IsOptional() @IsString() sourceId?: string;
}

class SummarizeDto {
  @IsString() content: string;
  @IsOptional() @IsString() type?: string;
}

class SearchDto {
  @IsString() query: string;
  @IsOptional() @IsString() scope?: string;
}

class NlQueryDto {
  @IsString() question: string;
}

class RagIngestDto {
  @IsString() content: string;
  @IsString() sourceType: string;
  @IsOptional() @IsString() sourceId?: string;
}

class RagQueryDto {
  @IsString() question: string;
  @IsOptional() @IsString() sourceType?: string;
}

class VoiceCommandDto {
  @IsString() transcript: string;
}

class SpamCheckDto {
  @IsString() content: string;
}

class CategorizationDto {
  @IsString() title: string;
}

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(
    private readonly engine: AiEngineService,
    private readonly copilot: CopilotService,
    private readonly contentGen: ContentGenService,
    private readonly documentAi: DocumentAiService,
    private readonly summarization: SummarizationService,
    private readonly analytics: AnalyticsService,
    private readonly anomaly: AnomalyService,
    private readonly automation: AutomationService,
    private readonly personalization: PersonalizationService,
    private readonly semanticSearch: SemanticSearchService,
    private readonly nlQuery: NlQueryService,
    private readonly rag: RagService,
    private readonly voice: VoiceService,
    private readonly observability: AiObservabilityService,
    private readonly promptRegistry: PromptRegistryService,
  ) {}

  // ──────────────────────────────────────────────────────────────────────────
  // ENGINE / PLATFORM STATUS
  // ──────────────────────────────────────────────────────────────────────────

  @Get('status')
  getStatus() {
    return {
      success: true,
      data: {
        activeProvider: this.engine.getActiveProviderInfo(),
        providers: this.engine.getAllProviderStatus(),
        promptTemplates: this.promptRegistry.listKeys().length,
      },
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // COPILOT
  // ──────────────────────────────────────────────────────────────────────────

  @Post('copilot')
  @HttpCode(HttpStatus.OK)
  async copilotRespond(
    @Body() dto: CopilotDto,
    @CurrentUser() user: { id: string },
  ) {
    const result = await this.copilot.respond(user.id, dto);
    return { success: true, data: result };
  }

  /** SSE streaming endpoint for copilot */
  @Get('copilot/stream')
  async copilotStream(
    @Query('message') message: string,
    @Query('page') currentPage: string,
    @CurrentUser() user: { id: string },
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    try {
      for await (const chunk of this.copilot.streamResponse(user.id, { message, currentPage })) {
        res.write(`data: ${JSON.stringify({ delta: chunk, done: false })}\n\n`);
      }
      res.write(`data: ${JSON.stringify({ delta: '', done: true })}\n\n`);
    } catch (err) {
      res.write(`data: ${JSON.stringify({ error: 'Stream error', done: true })}\n\n`);
    } finally {
      res.end();
    }
  }

  @Post('chat-suggestions')
  @HttpCode(HttpStatus.OK)
  async getChatSuggestions(
    @Body() dto: ChatSuggestionsDto,
    @CurrentUser() user: { id: string },
  ) {
    const result = await this.copilot.getChatSuggestions(dto.conversationId, user.id);
    return { success: true, data: result };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // CONTENT GENERATION
  // ──────────────────────────────────────────────────────────────────────────

  @Post('content/generate')
  @HttpCode(HttpStatus.OK)
  async generateContent(
    @Body() dto: ContentGenDto,
    @CurrentUser() user: { id: string },
  ) {
    const result = await this.contentGen.generate(dto as ContentGenRequest, user.id);
    return { success: true, data: result };
  }

  @Post('content/task-plan')
  @HttpCode(HttpStatus.OK)
  async generateTaskPlan(
    @Body() dto: { description: string },
    @CurrentUser() user: { id: string },
  ) {
    const result = await this.contentGen.generateTaskPlan({ type: 'task-plan', description: dto.description }, user.id);
    return { success: true, data: result };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // DOCUMENT AI
  // ──────────────────────────────────────────────────────────────────────────

  @Post('document/process')
  @HttpCode(HttpStatus.OK)
  async processDocument(
    @Body() dto: DocumentProcessDto,
    @CurrentUser() user: { id: string },
  ) {
    const result = await this.documentAi.processDocument(dto.content, {
      userId: user.id,
      sourceId: dto.sourceId,
      isOcrText: dto.isOcrText,
      ingestIntoRag: dto.ingestIntoRag,
    });
    return { success: true, data: result };
  }

  @Post('document/classify')
  @HttpCode(HttpStatus.OK)
  async classifyDocument(
    @Body() dto: { excerpt: string },
    @CurrentUser() user: { id: string },
  ) {
    const result = await this.documentAi.classify(dto.excerpt, user.id);
    return { success: true, data: result };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SUMMARIZATION
  // ──────────────────────────────────────────────────────────────────────────

  @Post('summarize')
  @HttpCode(HttpStatus.OK)
  async summarizeText(
    @Body() dto: SummarizeDto,
    @CurrentUser() user: { id: string },
  ) {
    const result = await this.summarization.summarizeText(dto.content, dto.type, user.id);
    return { success: true, data: result };
  }

  @Get('summarize/chat/:conversationId')
  async summarizeChat(
    @Param('conversationId') conversationId: string,
    @CurrentUser() user: { id: string },
  ) {
    const result = await this.summarization.summarizeConversation(conversationId, user.id);
    return { success: true, data: result };
  }

  @Get('summarize/notifications')
  async summarizeNotifications(@CurrentUser() user: { id: string }) {
    const result = await this.summarization.summarizeNotifications(user.id);
    return { success: true, data: result };
  }

  @Get('summarize/workspace')
  async summarizeWorkspace(@CurrentUser() user: { id: string }) {
    const result = await this.summarization.summarizeWorkspaceActivity(user.id);
    return { success: true, data: result };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // ANALYTICS
  // ──────────────────────────────────────────────────────────────────────────

  @Get('analytics/expense-insights')
  async getExpenseInsights(@CurrentUser() user: { id: string }) {
    const result = await this.analytics.getExpenseInsights(user.id);
    return { success: true, data: result };
  }

  @Get('analytics/budget-prediction')
  async getBudgetPrediction(@CurrentUser() user: { id: string }) {
    const result = await this.analytics.predictBudget(user.id);
    return { success: true, data: result };
  }

  @Get('analytics/productivity')
  async getProductivityInsights(@CurrentUser() user: { id: string }) {
    const result = await this.analytics.getProductivityInsights(user.id);
    return { success: true, data: result };
  }

  @Get('analytics/usage')
  async getUsageSummary(
    @CurrentUser() user: { id: string },
    @Query('days') days?: string,
  ) {
    const result = await this.observability.getUserUsageSummary(user.id, days ? parseInt(days) : 30);
    return { success: true, data: result };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // ANOMALY DETECTION
  // ──────────────────────────────────────────────────────────────────────────

  @Get('anomalies')
  async getUserAnomalies(@CurrentUser() user: { id: string }) {
    const result = await this.anomaly.getUserAnomalies(user.id);
    return { success: true, data: result };
  }

  @Post('anomalies/check-spam')
  @HttpCode(HttpStatus.OK)
  async checkSpam(
    @Body() dto: SpamCheckDto,
    @CurrentUser() user: { id: string },
  ) {
    const result = await this.anomaly.detectSpam(dto.content, user.id);
    return { success: true, data: result };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // AUTOMATION
  // ──────────────────────────────────────────────────────────────────────────

  @Get('automation/suggestions')
  async getSmartSuggestions(@CurrentUser() user: { id: string }) {
    const result = await this.automation.getSmartSuggestions(user.id);
    return { success: true, data: result };
  }

  @Post('automation/categorize-expense')
  @HttpCode(HttpStatus.OK)
  async categorizeExpense(@Body() dto: CategorizationDto) {
    const result = await this.automation.categorizeExpense(dto.title);
    return { success: true, data: { category: result } };
  }

  @Post('automation/suggest-priority')
  @HttpCode(HttpStatus.OK)
  async suggestTaskPriority(@Body() dto: { title: string; description?: string }) {
    const result = await this.automation.suggestTaskPriority(dto.title, dto.description);
    return { success: true, data: { priority: result } };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PERSONALIZATION
  // ──────────────────────────────────────────────────────────────────────────

  @Get('personalization')
  async getPersonalization(@CurrentUser() user: { id: string }) {
    const result = await this.personalization.getPersonalization(user.id);
    return { success: true, data: result };
  }

  @Post('personalization/feature-visit')
  @HttpCode(HttpStatus.OK)
  async recordFeatureVisit(
    @Body() dto: { feature: string },
    @CurrentUser() user: { id: string },
  ) {
    await this.personalization.recordFeatureVisit(user.id, dto.feature);
    return { success: true };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SEMANTIC SEARCH
  // ──────────────────────────────────────────────────────────────────────────

  @Get('search')
  async semanticSearchEndpoint(
    @Query('q') query: string,
    @Query('scope') scope: string,
    @CurrentUser() user: { id: string },
  ) {
    await this.personalization.recordSearch(user.id, query);
    const result = await this.semanticSearch.search(query, user.id, (scope as any) ?? 'all');
    return { success: true, data: result };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // NATURAL LANGUAGE QUERY
  // ──────────────────────────────────────────────────────────────────────────

  @Post('query')
  @HttpCode(HttpStatus.OK)
  async nlQueryEndpoint(
    @Body() dto: NlQueryDto,
    @CurrentUser() user: { id: string },
  ) {
    const result = await this.nlQuery.query(dto.question, user.id);
    return { success: true, data: result };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // RAG
  // ──────────────────────────────────────────────────────────────────────────

  @Post('rag/ingest')
  @HttpCode(HttpStatus.OK)
  async ragIngest(
    @Body() dto: RagIngestDto,
    @CurrentUser() user: { id: string },
  ) {
    const result = await this.rag.ingest(dto.content, {
      userId: user.id,
      sourceType: dto.sourceType,
      sourceId: dto.sourceId,
    });
    return { success: true, data: result };
  }

  @Post('rag/query')
  @HttpCode(HttpStatus.OK)
  async ragQuery(
    @Body() dto: RagQueryDto,
    @CurrentUser() user: { id: string },
  ) {
    const result = await this.rag.query(dto.question, {
      userId: user.id,
      sourceType: dto.sourceType,
    });
    return { success: true, data: result };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // VOICE AI
  // ──────────────────────────────────────────────────────────────────────────

  @Post('voice/command')
  @HttpCode(HttpStatus.OK)
  async voiceCommand(@Body() dto: VoiceCommandDto) {
    const result = await this.voice.parseVoiceCommand(dto.transcript);
    return { success: true, data: result };
  }

  @Post('voice/transcribe')
  @HttpCode(HttpStatus.OK)
  async cleanTranscript(@Body() dto: VoiceCommandDto) {
    const result = await this.voice.cleanTranscript(dto.transcript);
    return { success: true, data: result };
  }

  @Post('voice/tts')
  @HttpCode(HttpStatus.OK)
  prepareTts(@Body() dto: { text: string }) {
    const result = this.voice.prepareTtsText(dto.text);
    return { success: true, data: result };
  }
}
