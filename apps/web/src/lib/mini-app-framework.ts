/**
 * Extensible Mini Program Framework Engine (WeChat-Inspired Architecture)
 * Supports dynamic registration, independent lifecycle hooks, permissions, metadata, and analytics.
 */

export type PermissionType = 'location' | 'camera' | 'wallet' | 'contacts' | 'notifications' | 'storage';

export interface MiniAppManifest {
  slug: string;
  name: string;
  category: string;
  developer: string;
  version: string;
  icon: string;
  description: string;
  requiredPermissions: PermissionType[];
  searchKeywords: string[];
  deepLinkScheme: string;
  settings?: Record<string, any>;
}

export interface MiniAppLifecycle {
  onLaunch?: () => void;
  onShow?: () => void;
  onHide?: () => void;
  onError?: (err: Error) => void;
}

class MiniAppRegistry {
  private apps: Map<string, MiniAppManifest> = new Map();
  private activeAppSlug: string | null = null;
  private lifecycles: Map<string, MiniAppLifecycle> = new Map();

  registerApp(manifest: MiniAppManifest, lifecycle?: MiniAppLifecycle): void {
    this.apps.set(manifest.slug, manifest);
    if (lifecycle) {
      this.lifecycles.set(manifest.slug, lifecycle);
    }
  }

  getApp(slug: string): MiniAppManifest | undefined {
    return this.apps.get(slug);
  }

  getAllApps(): MiniAppManifest[] {
    return Array.from(this.apps.values());
  }

  launchApp(slug: string): boolean {
    const app = this.apps.get(slug);
    if (!app) return false;

    // Trigger onHide on previous active app
    if (this.activeAppSlug && this.activeAppSlug !== slug) {
      this.lifecycles.get(this.activeAppSlug)?.onHide?.();
    }

    this.activeAppSlug = slug;
    const lc = this.lifecycles.get(slug);
    lc?.onLaunch?.();
    lc?.onShow?.();
    return true;
  }

  hasPermission(slug: string, perm: PermissionType): boolean {
    const app = this.apps.get(slug);
    if (!app) return false;
    return app.requiredPermissions.includes(perm);
  }

  searchApps(query: string): MiniAppManifest[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.getAllApps();

    return this.getAllApps().filter(
      (app) =>
        app.name.toLowerCase().includes(q) ||
        app.description.toLowerCase().includes(q) ||
        app.category.toLowerCase().includes(q) ||
        app.searchKeywords.some((k) => k.toLowerCase().includes(q))
    );
  }
}

export const miniAppEngine = new MiniAppRegistry();
