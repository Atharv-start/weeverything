import { Global, Module, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@weeverything/database';

@Global()
@Module({
  providers: [
    {
      provide: PrismaClient,
      useFactory: () => {
        const prisma = new PrismaClient({
          log:
            process.env.NODE_ENV === 'development'
              ? ['warn', 'error']
              : ['error'],
        });
        return prisma;
      },
    },
  ],
  exports: [PrismaClient],
})
export class DatabaseModule implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(private readonly prisma: PrismaClient) {}

  async onModuleInit() {
    try {
      await this.prisma.$connect();
      this.logger.log('Database connection established');
    } catch (err: any) {
      this.logger.warn(`Initial database connection error (retrying on request): ${err.message}`);
    }
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
    this.logger.log('Database connection closed gracefully');
  }
}
