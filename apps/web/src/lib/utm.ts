/**
 * utm.ts — UTM parameter capture and session attribution.
 * Captures UTM params on landing, stores in sessionStorage.
 * Only passes to analytics after consent is granted.
 * Never logs sensitive data.
 */

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

const UTM_SESSION_KEY = 'we_utm_params';
const UTM_PARAM_NAMES: (keyof UtmParams)[] = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
];

/**
 * Capture UTM params from the current URL and persist to sessionStorage.
 * Call once on app mount (idempotent — only captures if params are present).
 */
export function captureUtmParams(): UtmParams | null {
  if (typeof window === 'undefined') return null;

  const search = new URLSearchParams(window.location.search);
  const captured: UtmParams = {};
  let found = false;

  for (const key of UTM_PARAM_NAMES) {
    const val = search.get(key);
    if (val && val.trim()) {
      captured[key] = val.trim();
      found = true;
    }
  }

  if (found) {
    try {
      sessionStorage.setItem(UTM_SESSION_KEY, JSON.stringify(captured));
    } catch {
      // sessionStorage may be blocked in some private modes — silently ignore
    }
    return captured;
  }

  return null;
}

/**
 * Retrieve captured UTM params from sessionStorage.
 * Returns null if no UTM params were captured in this session.
 */
export function getUtmParams(): UtmParams | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(UTM_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UtmParams;
  } catch {
    return null;
  }
}

/**
 * Clear UTM attribution from session storage.
 * Call after attribution has been recorded to avoid double-counting.
 */
export function clearUtmParams(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(UTM_SESSION_KEY);
  } catch {}
}

/**
 * Returns true if any UTM parameters are present in the current session.
 */
export function hasUtmParams(): boolean {
  return getUtmParams() !== null;
}
