/**
 * ai.module.ts
 * WeEverything AI Platform Module — registers all AI sub-modules and services.
 * Every AI capability in the application flows through this module.
 */

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';

// Controller
import { AiController } from './ai.controller';

// Engine layer
import { AiEngineService } from './engine/ai-engine.service';
import { GeminiProvider } from './engine/providers/gemini.provider';
import { OpenAIProvider } from './engine/providers/openai.provider';
import { AnthropicProvider } from './engine/providers/anthropic.provider';

// Cross-cutting concerns
import { AiSafetyService } from './safety/ai-safety.service';
import { AiObservabilityService } from './observability/ai-observability.service';
import { AiCacheService } from './cache/ai-cache.service';
import { PromptRegistryService } from './prompts/prompt-registry.service';

// RAG pipeline
import { ChunkerService } from './rag/chunker.service';
import { EmbedderService } from './rag/embedder.service';
import { VectorStoreService } from './rag/vector-store.service';
import { RagService } from './rag/rag.service';

// Feature services
import { CopilotService } from './copilot/copilot.service';
import { ContentGenService } from './content-gen/content-gen.service';
import { DocumentAiService } from './document-ai/document-ai.service';
import { SummarizationService } from './summarization/summarization.service';
import { SemanticSearchService } from './semantic-search/semantic-search.service';
import { NlQueryService } from './nl-query/nl-query.service';
import { AnalyticsService } from './analytics/analytics.service';
import { AnomalyService } from './anomaly/anomaly.service';
import { AutomationService } from './automation/automation.service';
import { PersonalizationService } from './personalization/personalization.service';
import { VoiceService } from './voice/voice.service';

const ALL_PROVIDERS = [
  // Engine
  GeminiProvider,
  OpenAIProvider,
  AnthropicProvider,
  AiEngineService,

  // Cross-cutting
  AiSafetyService,
  AiObservabilityService,
  AiCacheService,
  PromptRegistryService,

  // RAG
  ChunkerService,
  EmbedderService,
  VectorStoreService,
  RagService,

  // Features
  CopilotService,
  ContentGenService,
  DocumentAiService,
  SummarizationService,
  SemanticSearchService,
  NlQueryService,
  AnalyticsService,
  AnomalyService,
  AutomationService,
  PersonalizationService,
  VoiceService,
];

@Module({
  imports: [DatabaseModule],
  controllers: [AiController],
  providers: ALL_PROVIDERS,
  exports: [
    // Export commonly used services so other modules can inject them
    AiEngineService,
    AiSafetyService,
    AiObservabilityService,
    AiCacheService,
    RagService,
    CopilotService,
    ContentGenService,
    SummarizationService,
    AnalyticsService,
    AnomalyService,
    AutomationService,
    PersonalizationService,
    SemanticSearchService,
  ],
})
export class AiModule {}
