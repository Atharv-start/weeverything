import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

// PrismaClient is globally provided by DatabaseModule — no need to import it here
@Module({
  controllers: [HealthController],
})
export class HealthModule {}
