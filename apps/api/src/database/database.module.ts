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
    await this.prisma.$connect();
    this.logger.log('Database connection established');
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
    this.logger.log('Database connection closed gracefully');
  }
}
