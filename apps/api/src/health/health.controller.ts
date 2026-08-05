import { Controller, Get } from '@nestjs/common';
import { PrismaClient } from '@weeverything/database';
import { Public } from '../auth/decorators/public.decorator';

interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  version: string;
  service: string;
  uptime: number;
  checks: {
    database: 'ok' | 'error';
    [key: string]: 'ok' | 'error';
  };
}

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaClient) {}

  @Public()
  @Get()
  async check(): Promise<{ success: boolean; data: HealthStatus }> {
    const checks: HealthStatus['checks'] = {
      database: 'error',
    };

    // Real DB liveness probe — not a static stub
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = 'ok';
    } catch {
      checks.database = 'error';
    }

    const allOk = Object.values(checks).every((v) => v === 'ok');

    return {
      success: allOk,
      data: {
        status: allOk ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version ?? '1.0.0',
        service: 'WeEverything API',
        uptime: Math.floor(process.uptime()),
        checks,
      },
    };
  }
}
