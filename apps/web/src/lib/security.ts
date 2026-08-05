/**
 * Enterprise Security Hardening Helper
 * Input Sanitization, XSS protection, Password Strength, & RBAC Role Evaluation
 */

export function sanitizeHtmlInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function evaluatePasswordStrength(password: string): { score: number; label: string; valid: boolean } {
  if (!password) return { score: 0, label: 'Weak', valid: false };

  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  let label = 'Weak';
  if (score >= 4) label = 'Strong';
  else if (score >= 3) label = 'Moderate';

  return { score, label, valid: score >= 3 };
}

export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';

export function hasPermissionRole(userRole: UserRole | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false;
  const roleHierarchy: Record<UserRole, number> = {
    USER: 1,
    MODERATOR: 2,
    ADMIN: 3,
    SUPER_ADMIN: 4,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export function generateCsrfToken(): string {
  if (typeof window === 'undefined') return 'server_csrf_token';
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}
