/**
 * ai-safety.service.ts
 * Cross-cutting safety layer for the WeEverything AI Platform.
 *
 * Responsibilities:
 *  - Prompt injection detection and blocking
 *  - PII scrubbing from prompts before they leave the platform
 *  - Grounding check — prefer application data over hallucination
 *  - Unsafe tool call prevention
 *  - Response content moderation
 */

import { Injectable, Logger } from '@nestjs/common';

export interface SafetyCheckResult {
  safe: boolean;
  reason?: string;
  sanitizedInput?: string;
}

@Injectable()
export class AiSafetyService {
  private readonly logger = new Logger(AiSafetyService.name);

  /** Patterns that indicate prompt injection attempts */
  private readonly injectionPatterns = [
    /ignore\s+(all\s+)?previous\s+instructions?/i,
    /forget\s+(all\s+)?previous\s+(context|instructions?)/i,
    /you\s+are\s+now\s+(a\s+)?(?!WeEverything)/i,
    /act\s+as\s+(if\s+you\s+are\s+)?(?!WeEverything)/i,
    /system\s*:\s*you\s+are/i,
    /\[system\]/i,
    /<system>/i,
    /\|\|.*\|\|/i, // common jailbreak separator
    /DAN\s+(mode|prompt)/i,
    /jailbreak/i,
    /developer\s+mode/i,
  ];

  /** PII patterns to scrub from prompts before sending to external providers */
  private readonly piiPatterns: Array<{ pattern: RegExp; replacement: string }> = [
    { pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, replacement: '[EMAIL]' },
    { pattern: /\b\d{10,13}\b/g, replacement: '[PHONE]' },
    { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, replacement: '[CARD_NUMBER]' },
    { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '[SSN]' },
    { pattern: /password\s*[:=]\s*\S+/gi, replacement: 'password: [REDACTED]' },
    { pattern: /bearer\s+[a-z0-9._-]{20,}/gi, replacement: 'Bearer [REDACTED_TOKEN]' },
    { pattern: /sk-[a-z0-9]{32,}/gi, replacement: '[API_KEY_REDACTED]' },
  ];

  /**
   * Check if a user prompt is safe to process.
   * Returns a SafetyCheckResult — the caller should block if safe === false.
   */
  checkPrompt(input: string): SafetyCheckResult {
    for (const pattern of this.injectionPatterns) {
      if (pattern.test(input)) {
        this.logger.warn(`Prompt injection attempt detected: pattern=${pattern.source.substring(0, 40)}`);
        return {
          safe: false,
          reason: 'PROMPT_INJECTION',
        };
      }
    }

    return { safe: true, sanitizedInput: this.scrubbedInput(input) };
  }

  /**
   * Scrub PII from a prompt before sending it to an external provider.
   * ALWAYS call this on user-supplied input before external AI calls.
   */
  scrubPii(input: string): string {
    return this.scrubbedInput(input);
  }

  /**
   * Check an AI response for unsafe content before returning to the user.
   */
  checkResponse(response: string): SafetyCheckResult {
    // Block responses that appear to have leaked system prompts
    if (response.includes('[SYSTEM]') || response.includes('<system>')) {
      return { safe: false, reason: 'SYSTEM_PROMPT_LEAK' };
    }

    // Block responses containing API keys or tokens
    if (/sk-[a-z0-9]{20,}/i.test(response) || /bearer\s+[a-z0-9._-]{30,}/i.test(response)) {
      return { safe: false, reason: 'CREDENTIAL_LEAK' };
    }

    return { safe: true };
  }

  /**
   * Validate that a structured output from AI is within acceptable bounds
   * before executing any action (e.g. NL queries, automation).
   */
  validateStructuredOutput(
    output: unknown,
    allowedKeys: string[],
  ): { valid: boolean; reason?: string } {
    if (typeof output !== 'object' || output === null) {
      return { valid: false, reason: 'Output must be an object' };
    }

    const keys = Object.keys(output as Record<string, unknown>);
    const forbidden = keys.filter((k) => !allowedKeys.includes(k));
    if (forbidden.length > 0) {
      return {
        valid: false,
        reason: `Unexpected keys in structured output: ${forbidden.join(', ')}`,
      };
    }

    return { valid: true };
  }

  private scrubbedInput(input: string): string {
    let result = input;
    for (const { pattern, replacement } of this.piiPatterns) {
      result = result.replace(pattern, replacement);
    }
    return result;
  }
}
