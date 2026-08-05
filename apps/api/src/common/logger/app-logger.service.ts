import { Injectable, LoggerService, Scope } from '@nestjs/common';

export interface LogContext {
  requestId?: string;
  userId?: string;
  service?: string;
  [key: string]: unknown;
}

/**
 * AppLoggerService
 *
 * Wraps the built-in NestJS console logger and emits structured JSON
 * in production for ingestion by Datadog, Loki, CloudWatch, etc.
 *
 * In development, it uses readable formatting.
 *
 * Usage:
 *   constructor(private readonly logger: AppLoggerService) {}
 *   this.logger.log('User registered', { userId, requestId });
 */
@Injectable({ scope: Scope.DEFAULT })
export class AppLoggerService implements LoggerService {
  private readonly isProduction = process.env.NODE_ENV === 'production';

  log(message: string, context?: string | LogContext): void {
    this.write('INFO', message, context);
  }

  error(message: string, context?: string | LogContext, trace?: string): void {
    this.write('ERROR', message, context, trace);
  }

  warn(message: string, context?: string | LogContext): void {
    this.write('WARN', message, context);
  }

  debug(message: string, context?: string | LogContext): void {
    if (!this.isProduction) {
      this.write('DEBUG', message, context);
    }
  }

  verbose(message: string, context?: string | LogContext): void {
    if (!this.isProduction) {
      this.write('VERBOSE', message, context);
    }
  }

  private write(
    level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'VERBOSE',
    message: string,
    context?: string | LogContext,
    trace?: string,
  ): void {
    const timestamp = new Date().toISOString();

    if (this.isProduction) {
      // Structured JSON for log aggregators
      const logEntry: Record<string, unknown> = {
        timestamp,
        level,
        service: 'weeverything-api',
        message,
      };

      if (typeof context === 'string') {
        logEntry.context = context;
      } else if (context && typeof context === 'object') {
        Object.assign(logEntry, context);
      }

      if (trace) logEntry.trace = trace;

      process.stdout.write(JSON.stringify(logEntry) + '\n');
    } else {
      // Human-readable for local dev
      const contextStr =
        typeof context === 'string'
          ? `[${context}]`
          : context
          ? `[${JSON.stringify(context)}]`
          : '';
      const levelPad = level.padEnd(7);
      const traceStr = trace ? `\n  Stack: ${trace}` : '';

      const colors: Record<string, string> = {
        INFO: '\x1b[32m',    // green
        WARN: '\x1b[33m',    // yellow
        ERROR: '\x1b[31m',   // red
        DEBUG: '\x1b[36m',   // cyan
        VERBOSE: '\x1b[35m', // magenta
      };
      const reset = '\x1b[0m';
      const color = colors[level] ?? '';

      process.stdout.write(
        `${color}[${timestamp}] ${levelPad}${reset} ${contextStr} ${message}${traceStr}\n`,
      );
    }
  }
}
