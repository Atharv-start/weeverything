/**
 * prompt-registry.service.ts
 * Centralized versioned prompt management.
 * All AI features MUST use this registry — never hardcode prompts in services.
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@weeverything/database';
import { CHAT_PROMPTS } from './templates/chat.prompts';
import { CONTENT_PROMPTS } from './templates/content.prompts';
import { DOCUMENT_PROMPTS } from './templates/document.prompts';
import { SEARCH_PROMPTS } from './templates/search.prompts';
import { ANALYTICS_PROMPTS } from './templates/analytics.prompts';

type TemplateVars = Record<string, string | number | undefined>;

const ALL_TEMPLATES = {
  ...CHAT_PROMPTS,
  ...CONTENT_PROMPTS,
  ...DOCUMENT_PROMPTS,
  ...SEARCH_PROMPTS,
  ...ANALYTICS_PROMPTS,
};

@Injectable()
export class PromptRegistryService implements OnModuleInit {
  private readonly logger = new Logger(PromptRegistryService.name);
  /** In-memory cache of templates keyed by their key */
  private readonly cache = new Map<string, string>();

  constructor(private readonly prisma: PrismaClient) {}

  async onModuleInit() {
    await this.seedBuiltInTemplates();
    await this.loadFromDatabase();
    this.logger.log(`Prompt Registry initialized — ${this.cache.size} templates loaded`);
  }

  /**
   * Get a rendered prompt by key with variable substitution.
   * Falls back to built-in template if DB override doesn't exist.
   */
  render(key: string, vars: TemplateVars = {}): string {
    const template = this.cache.get(key);
    if (!template) {
      this.logger.warn(`Prompt template not found: ${key}`);
      return `[Missing prompt template: ${key}]`;
    }
    return this.interpolate(template, vars);
  }

  /** Check if a template exists */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /** List all available prompt keys */
  listKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  /** Upsert a template override in the database (for admin-driven prompt tuning) */
  async upsertTemplate(
    key: string,
    template: string,
    name: string,
    feature: string,
  ): Promise<void> {
    await this.prisma.aiPromptTemplate.upsert({
      where: { key },
      create: { key, name, template, feature, version: 1, isActive: true },
      update: { template, name, version: { increment: 1 } },
    });
    this.cache.set(key, template);
    this.logger.log(`Prompt template upserted: ${key}`);
  }

  /** Reload DB overrides (call this after updating templates at runtime) */
  async reloadFromDatabase(): Promise<void> {
    await this.loadFromDatabase();
  }

  /** Simple {{variable}} interpolation */
  private interpolate(template: string, vars: TemplateVars): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
      const val = vars[key];
      return val !== undefined && val !== null ? String(val) : `{{${key}}}`;
    });
  }

  /** Seed built-in templates into memory cache */
  private async seedBuiltInTemplates() {
    for (const [, def] of Object.entries(ALL_TEMPLATES)) {
      const template = def as { key: string; template: string; name: string; feature: string };
      this.cache.set(template.key, template.template);
    }
  }

  /** Load active DB overrides (DB templates take precedence over built-ins) */
  private async loadFromDatabase() {
    try {
      const dbTemplates = await this.prisma.aiPromptTemplate.findMany({
        where: { isActive: true },
        select: { key: true, template: true },
      });
      for (const t of dbTemplates) {
        this.cache.set(t.key, t.template);
      }
    } catch (err) {
      this.logger.warn('Could not load prompt templates from database:', err);
    }
  }
}
