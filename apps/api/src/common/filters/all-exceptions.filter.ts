import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

// Prisma error codes we handle explicitly
const PRISMA_ERROR_CODES: Record<string, { status: number; message: string }> = {
  P2002: { status: HttpStatus.CONFLICT, message: 'A record with this value already exists' },
  P2003: { status: HttpStatus.BAD_REQUEST, message: 'Related record not found' },
  P2025: { status: HttpStatus.NOT_FOUND, message: 'Record not found' },
  P2016: { status: HttpStatus.NOT_FOUND, message: 'Query result not found' },
  P2014: { status: HttpStatus.BAD_REQUEST, message: 'Invalid relation update' },
};

interface PrismaClientKnownRequestError extends Error {
  code?: string;
  meta?: Record<string, unknown>;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId = (request as any).requestId ?? 'unknown';
    const isProduction = process.env.NODE_ENV === 'production';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An internal server error occurred';
    let code = 'INTERNAL_ERROR';
    let validationErrors: unknown[] | undefined;

    // 1. NestJS HttpException (includes ValidationPipe errors)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        message = (resp.message as string) ?? exception.message;
        // ValidationPipe returns array of messages
        if (Array.isArray(resp.message)) {
          validationErrors = resp.message;
          message = 'Validation failed';
        }
        code = (resp.error as string) ?? this.statusToCode(status);
      }
    }
    // 2. Prisma known request errors
    else if (this.isPrismaError(exception)) {
      const prismaErr = exception as PrismaClientKnownRequestError;
      const mapped = prismaErr.code ? PRISMA_ERROR_CODES[prismaErr.code] : null;

      if (mapped) {
        status = mapped.status;
        message = mapped.message;
        code = `PRISMA_${prismaErr.code}`;
      } else {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Database operation failed';
        code = 'DATABASE_ERROR';
      }

      this.logger.error(
        `Prisma error [${prismaErr.code}]: ${prismaErr.message}`,
        { requestId, path: request.url, method: request.method },
      );
    }
    // 3. Unknown / unhandled errors
    else {
      const err = exception as Error;
      this.logger.error(
        `Unhandled exception: ${err?.message ?? 'Unknown error'}`,
        {
          requestId,
          path: request.url,
          method: request.method,
          stack: isProduction ? undefined : err?.stack,
        },
      );
    }

    // Log non-500s at warn, 500s at error
    if (status >= 500) {
      this.logger.error(`[${status}] ${request.method} ${request.url} — ${message}`, { requestId });
    } else if (status >= 400) {
      this.logger.warn(`[${status}] ${request.method} ${request.url} — ${message}`, { requestId });
    }

    const body: Record<string, unknown> = {
      success: false,
      error: {
        code,
        message,
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId,
      },
    };

    if (validationErrors) {
      (body.error as Record<string, unknown>).details = validationErrors;
    }

    response.status(status).json(body);
  }

  private isPrismaError(exception: unknown): boolean {
    return (
      exception instanceof Error &&
      (exception.constructor.name === 'PrismaClientKnownRequestError' ||
        exception.constructor.name === 'PrismaClientUnknownRequestError' ||
        exception.constructor.name === 'PrismaClientValidationError')
    );
  }

  private statusToCode(status: number): string {
    const map: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_ERROR',
    };
    return map[status] ?? 'ERROR';
  }
}
