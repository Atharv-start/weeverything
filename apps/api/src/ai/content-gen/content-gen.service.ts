/**
 * content-gen.service.ts
 * Smart content generation — emails, notes, messages, announcements,
 * task descriptions, captions, meeting summaries, and more.
 */

import { Injectable } from '@nestjs/common';
import { AiEngineService } from '../engine/ai-engine.service';
import { PromptRegistryService } from '../prompts/prompt-registry.service';
import { AiSafetyService } from '../safety/ai-safety.service';
import { AiObservabilityService } from '../observability/ai-observability.service';

export interface ContentGenRequest {
  type: 'email' | 'caption' | 'task' | 'task-plan' | 'announcement' | 'comment' | 'meeting-summary' | 'note';
  context?: string;
  instructions?: string;
  tone?: 'professional' | 'casual' | 'friendly' | 'formal';
  audience?: string;
  keyPoints?: string;
  // type-specific fields
  caption?: string;
  title?: string;
  transcript?: string;
  topic?: string;
  description?: string;
  postContext?: string;
  comment?: string;
  perspective?: string;
}

@Injectable()
export class ContentGenService {
  constructor(
    private readonly engine: AiEngineService,
    private readonly promptRegistry: PromptRegistryService,
    private readonly safety: AiSafetyService,
    private readonly observability: AiObservabilityService,
  ) {}

  async generate(request: ContentGenRequest, userId?: string): Promise<string> {
    const safety = this.safety.checkPrompt(request.context ?? request.instructions ?? '');
    if (!safety.safe) return 'Cannot generate content for that request.';

    const started = Date.now();
    let result: string;

    switch (request.type) {
      case 'email':
        result = await this.generateEmail(request, userId);
        break;
      case 'caption':
        result = await this.generateCaption(request, userId);
        break;
      case 'task':
        result = await this.generateTaskDescription(request, userId);
        break;
      case 'task-plan': {
        const plan = await this.generateTaskPlan(request, userId);
        return JSON.stringify(plan);
      }
      case 'announcement':
        result = await this.generateAnnouncement(request, userId);
        break;
      case 'comment':
        result = await this.generateComment(request, userId);
        break;
      case 'meeting-summary':
        result = await this.generateMeetingSummary(request, userId);
        break;
      case 'note':
        result = await this.generateNote(request, userId);
        break;
      default:
        result = 'Unsupported content type.';
    }

    return result;
  }

  private async generateEmail(req: ContentGenRequest, userId?: string): Promise<string> {
    const prompt = this.promptRegistry.render('content.email-draft.v1', {
      tone: req.tone ?? 'professional',
      context: req.context ?? '',
      instructions: req.instructions ?? '',
    });
    const response = await this.engine.generate(
      [{ role: 'user', content: prompt }],
      { feature: 'content-gen', userId, maxTokens: 512 },
    );
    this.observability.logSuccess(response, 'content-gen', userId);
    return response.content;
  }

  private async generateCaption(req: ContentGenRequest, userId?: string): Promise<string> {
    const prompt = this.promptRegistry.render('content.moment-caption.v1', {
      caption: req.caption ?? req.context ?? '',
    });
    const response = await this.engine.generate(
      [{ role: 'user', content: prompt }],
      { feature: 'content-gen', userId, maxTokens: 200, temperature: 0.9 },
    );
    this.observability.logSuccess(response, 'content-gen', userId);
    return response.content;
  }

  private async generateTaskDescription(req: ContentGenRequest, userId?: string): Promise<string> {
    const prompt = this.promptRegistry.render('content.task-description.v1', {
      title: req.title ?? '',
      context: req.context ?? '',
    });
    const response = await this.engine.generate(
      [{ role: 'user', content: prompt }],
      { feature: 'content-gen', userId, maxTokens: 256 },
    );
    this.observability.logSuccess(response, 'content-gen', userId);
    return response.content;
  }

  async generateTaskPlan(req: ContentGenRequest, userId?: string): Promise<Array<{ title: string; description: string; priority: string }>> {
    const prompt = this.promptRegistry.render('content.task-plan.v1', {
      description: req.description ?? req.context ?? '',
    });
    const fallback = [
      { title: 'Initial research', description: 'Review baseline specifications', priority: 'HIGH' },
      { title: 'Design layout draft', description: 'Create a preliminary structure', priority: 'MEDIUM' },
      { title: 'Implementation Phase 1', description: 'Write core functions', priority: 'HIGH' },
    ];
    try {
      const response = await this.engine.generate(
        [{ role: 'user', content: prompt }],
        { feature: 'content-gen', userId, maxTokens: 512 },
      );
      this.observability.logSuccess(response, 'content-gen', userId);
      const cleaned = response.content.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned) as Array<{ title: string; description: string; priority: string }>;
    } catch {
      return fallback;
    }
  }

  private async generateAnnouncement(req: ContentGenRequest, userId?: string): Promise<string> {
    const prompt = this.promptRegistry.render('content.announcement.v1', {
      topic: req.topic ?? req.context ?? '',
      audience: req.audience ?? 'team',
      keyPoints: req.keyPoints ?? '',
      tone: req.tone ?? 'professional',
    });
    const response = await this.engine.generate(
      [{ role: 'user', content: prompt }],
      { feature: 'content-gen', userId, maxTokens: 400 },
    );
    this.observability.logSuccess(response, 'content-gen', userId);
    return response.content;
  }

  private async generateComment(req: ContentGenRequest, userId?: string): Promise<string> {
    const prompt = this.promptRegistry.render('content.comment-reply.v1', {
      postContext: req.postContext ?? '',
      comment: req.comment ?? '',
      perspective: req.perspective ?? req.context ?? '',
    });
    const response = await this.engine.generate(
      [{ role: 'user', content: prompt }],
      { feature: 'content-gen', userId, maxTokens: 200, temperature: 0.8 },
    );
    this.observability.logSuccess(response, 'content-gen', userId);
    return response.content;
  }

  private async generateMeetingSummary(req: ContentGenRequest, userId?: string): Promise<string> {
    const prompt = this.promptRegistry.render('content.meeting-summary.v1', {
      transcript: req.transcript ?? req.context ?? '',
    });
    const response = await this.engine.generate(
      [{ role: 'user', content: prompt }],
      { feature: 'summarization', userId, maxTokens: 600 },
    );
    this.observability.logSuccess(response, 'summarization', userId);
    return response.content;
  }

  private async generateNote(req: ContentGenRequest, userId?: string): Promise<string> {
    const prompt = `Write a clear, well-structured note about: ${req.context ?? req.instructions ?? ''}\n\nTone: ${req.tone ?? 'casual'}`;
    const response = await this.engine.generate(
      [{ role: 'user', content: prompt }],
      { feature: 'content-gen', userId, maxTokens: 400 },
    );
    this.observability.logSuccess(response, 'content-gen', userId);
    return response.content;
  }
}
