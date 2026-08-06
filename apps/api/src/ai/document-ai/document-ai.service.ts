/**
 * document-ai.service.ts
 * Intelligent document processing — OCR cleanup, information extraction,
 * summarization, and classification for PDFs, receipts, invoices, ID cards, etc.
 */

import { Injectable, Logger } from '@nestjs/common';
import { AiEngineService } from '../engine/ai-engine.service';
import { PromptRegistryService } from '../prompts/prompt-registry.service';
import { AiSafetyService } from '../safety/ai-safety.service';
import { AiObservabilityService } from '../observability/ai-observability.service';
import { RagService } from '../rag/rag.service';

export interface DocumentAnalysisResult {
  documentType: string;
  title: string | null;
  date: string | null;
  amount: number | null;
  currency: string | null;
  parties: string[];
  keyFields: Record<string, string>;
  summary: string;
  category: string;
  keyPoints: string[];
  actionItems: string[];
  confidence: number;
}

@Injectable()
export class DocumentAiService {
  private readonly logger = new Logger(DocumentAiService.name);

  constructor(
    private readonly engine: AiEngineService,
    private readonly promptRegistry: PromptRegistryService,
    private readonly safety: AiSafetyService,
    private readonly observability: AiObservabilityService,
    private readonly rag: RagService,
  ) {}

  /**
   * Full document processing pipeline:
   * 1. OCR cleanup (if raw OCR text provided)
   * 2. Information extraction
   * 3. Summarization
   * 4. Optional RAG ingestion
   */
  async processDocument(
    content: string,
    options: {
      userId?: string;
      sourceId?: string;
      isOcrText?: boolean;
      ingestIntoRag?: boolean;
    } = {},
  ): Promise<DocumentAnalysisResult> {
    // Safety check
    if (!this.safety.checkPrompt(content).safe) {
      throw new Error('Document content failed safety check');
    }

    // Limit content size to prevent token overflow
    const truncatedContent = content.substring(0, 8000);

    // Step 1: Clean up OCR text if needed
    const cleanContent = options.isOcrText
      ? await this.cleanOcrText(truncatedContent, options.userId)
      : truncatedContent;

    // Step 2: Extract structured information
    const extractionPrompt = this.promptRegistry.render('document.extract-info.v1', {
      content: cleanContent,
    });

    let extractedInfo: Partial<DocumentAnalysisResult> = {};
    try {
      const extractionResponse = await this.engine.generate(
        [{ role: 'user', content: extractionPrompt }],
        { feature: 'doc-ai', userId: options.userId, maxTokens: 512 },
      );
      this.observability.logSuccess(extractionResponse, 'doc-ai', options.userId);
      const cleaned = extractionResponse.content.replace(/```json/g, '').replace(/```/g, '').trim();
      extractedInfo = JSON.parse(cleaned) as Partial<DocumentAnalysisResult>;
    } catch (err) {
      this.logger.warn('Document info extraction failed:', err);
    }

    // Step 3: Generate summary
    const summaryPrompt = this.promptRegistry.render('document.summarize.v1', {
      content: cleanContent,
    });
    let summaryData: { summary?: string; keyPoints?: string[]; actionItems?: string[]; category?: string } = {};
    try {
      const summaryResponse = await this.engine.generate(
        [{ role: 'user', content: summaryPrompt }],
        { feature: 'summarization', userId: options.userId, maxTokens: 512 },
      );
      const cleaned = summaryResponse.content.replace(/```json/g, '').replace(/```/g, '').trim();
      summaryData = JSON.parse(cleaned) as typeof summaryData;
    } catch {
      summaryData = { summary: 'Document processed successfully.', keyPoints: [], actionItems: [] };
    }

    // Step 4: Ingest into RAG if requested
    if (options.ingestIntoRag && options.userId) {
      await this.rag.ingest(cleanContent, {
        userId: options.userId,
        sourceType: 'document',
        sourceId: options.sourceId,
        metadata: { type: extractedInfo.documentType ?? 'unknown' },
      }).catch((err) => this.logger.warn('RAG ingestion failed:', err));
    }

    return {
      documentType: extractedInfo.documentType ?? 'other',
      title: extractedInfo.title ?? null,
      date: extractedInfo.date ?? null,
      amount: extractedInfo.amount ?? null,
      currency: extractedInfo.currency ?? null,
      parties: extractedInfo.parties ?? [],
      keyFields: extractedInfo.keyFields ?? {},
      summary: summaryData.summary ?? extractedInfo.summary ?? '',
      category: summaryData.category ?? 'other',
      keyPoints: summaryData.keyPoints ?? [],
      actionItems: summaryData.actionItems ?? [],
      confidence: extractedInfo.documentType ? 85 : 50,
    };
  }

  /**
   * Classify a document from a short excerpt (faster than full processing).
   */
  async classify(excerpt: string, userId?: string): Promise<{ type: string; confidence: number; tags: string[] }> {
    const prompt = this.promptRegistry.render('document.classify.v1', {
      excerpt: excerpt.substring(0, 500),
    });
    try {
      const response = await this.engine.generate(
        [{ role: 'user', content: prompt }],
        { feature: 'doc-ai', userId, maxTokens: 100 },
      );
      const cleaned = response.content.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned) as { type: string; confidence: number; tags: string[] };
    } catch {
      return { type: 'other', confidence: 50, tags: [] };
    }
  }

  private async cleanOcrText(rawText: string, userId?: string): Promise<string> {
    const prompt = this.promptRegistry.render('document.ocr-cleanup.v1', { ocrText: rawText });
    try {
      const response = await this.engine.generate(
        [{ role: 'user', content: prompt }],
        { feature: 'doc-ai', userId, maxTokens: 1024 },
      );
      return response.content;
    } catch {
      return rawText;
    }
  }
}
