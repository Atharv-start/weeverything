/**
 * personalization.service.ts
 * Personalizes the WeEverything experience based on real usage patterns.
 * Learns what features, layouts, and content the user prefers.
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@weeverything/database';
import { AiCacheService } from '../cache/ai-cache.service';

export interface PersonalizationData {
  frequentFeatures: string[];
  preferredLanguage: string;
  recentSearches: string[];
  contentPreferences: Record<string, unknown>;
  dashboardLayout: Record<string, unknown>;
  suggestedActions: Array<{ label: string; href: string; reason: string }>;
}

@Injectable()
export class PersonalizationService {
  private readonly logger = new Logger(PersonalizationService.name);

  constructor(
    private readonly prisma: PrismaClient,
    private readonly cache: AiCacheService,
  ) {}

  /** Get personalization data for the user */
  async getPersonalization(userId: string): Promise<PersonalizationData> {
    const cacheKey = this.cache.buildKey('personalization', userId);
    const cached = await this.cache.get(cacheKey);
    if (cached) return JSON.parse(cached) as PersonalizationData;

    const profile = await this.prisma.aiPersonalizationProfile.findUnique({
      where: { userId },
    });

    const frequentFeatures = profile?.frequentFeatures
      ? (JSON.parse(profile.frequentFeatures) as string[])
      : ['chats', 'home', 'moments'];

    const recentSearches = profile?.searchHistory
      ? (JSON.parse(profile.searchHistory) as string[])
      : [];

    const contentPreferences = profile?.contentPreferences
      ? (JSON.parse(profile.contentPreferences) as Record<string, unknown>)
      : {};

    const dashboardLayout = profile?.dashboardLayout
      ? (JSON.parse(profile.dashboardLayout) as Record<string, unknown>)
      : this.defaultDashboardLayout();

    const suggestedActions = await this.buildSuggestedActions(userId, frequentFeatures);

    const result: PersonalizationData = {
      frequentFeatures,
      preferredLanguage: profile?.preferredLanguage ?? 'en',
      recentSearches: recentSearches.slice(0, 10),
      contentPreferences,
      dashboardLayout,
      suggestedActions,
    };

    await this.cache.set(cacheKey, JSON.stringify(result), 300);
    return result;
  }

  /** Record a user feature visit (updates personalization profile) */
  async recordFeatureVisit(userId: string, feature: string): Promise<void> {
    try {
      const profile = await this.prisma.aiPersonalizationProfile.findUnique({ where: { userId } });
      const features: string[] = profile?.frequentFeatures
        ? (JSON.parse(profile.frequentFeatures) as string[])
        : [];

      // Move to front, limit to 20
      const updated = [feature, ...features.filter((f) => f !== feature)].slice(0, 20);

      await this.prisma.aiPersonalizationProfile.upsert({
        where: { userId },
        create: {
          userId,
          frequentFeatures: JSON.stringify(updated),
          lastActivityAt: new Date(),
        },
        update: {
          frequentFeatures: JSON.stringify(updated),
          lastActivityAt: new Date(),
        },
      });

      // Invalidate cache
      await this.cache.invalidate(userId);
    } catch (err) {
      this.logger.warn('Failed to record feature visit:', err);
    }
  }

  /** Record a search query in history */
  async recordSearch(userId: string, query: string): Promise<void> {
    try {
      const profile = await this.prisma.aiPersonalizationProfile.findUnique({ where: { userId } });
      const history: string[] = profile?.searchHistory
        ? (JSON.parse(profile.searchHistory) as string[])
        : [];

      const updated = [query, ...history.filter((q) => q !== query)].slice(0, 20);

      await this.prisma.aiPersonalizationProfile.upsert({
        where: { userId },
        create: { userId, searchHistory: JSON.stringify(updated) },
        update: { searchHistory: JSON.stringify(updated) },
      });
    } catch {
      // Non-critical
    }
  }

  private async buildSuggestedActions(
    userId: string,
    frequentFeatures: string[],
  ): Promise<Array<{ label: string; href: string; reason: string }>> {
    const actions: Array<{ label: string; href: string; reason: string }> = [];
    const topFeature = frequentFeatures[0];

    const featureActions: Record<string, { label: string; href: string; reason: string }> = {
      chats: { label: 'Open Chats', href: '/chats', reason: 'You chat frequently' },
      moments: { label: 'Share a Moment', href: '/moments', reason: 'You share moments regularly' },
      wallet: { label: 'View Wallet', href: '/wallet', reason: 'You use Wallet often' },
      workspace: { label: 'Check Tasks', href: '/workspace', reason: 'You manage tasks regularly' },
      search: { label: 'Search', href: '/search', reason: 'You search frequently' },
    };

    if (topFeature && featureActions[topFeature]) {
      actions.push(featureActions[topFeature]);
    }

    // Check for pending tasks
    const pendingTasks = await this.prisma.task.count({
      where: { userId, status: 'TODO' },
    });
    if (pendingTasks > 0) {
      actions.push({
        label: `${pendingTasks} Pending Tasks`,
        href: '/workspace',
        reason: 'You have pending tasks',
      });
    }

    return actions.slice(0, 4);
  }

  private defaultDashboardLayout() {
    return {
      widgets: ['quick-actions', 'recent-chats', 'tasks', 'wallet-summary'],
      columns: 2,
    };
  }
}
