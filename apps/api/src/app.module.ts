import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConnectionsModule } from './connections/connections.module';
import { ConversationsModule } from './conversations/conversations.module';
import { MessagesModule } from './messages/messages.module';
import { MomentsModule } from './moments/moments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { WalletModule } from './wallet/wallet.module';
import { QrModule } from './qr/qr.module';
import { MiniAppsModule } from './mini-apps/mini-apps.module';
import { TasksModule } from './tasks/tasks.module';
import { ExpensesModule } from './expenses/expenses.module';
import { PollsModule } from './polls/polls.module';
import { AdminModule } from './admin/admin.module';
import { HealthModule } from './health/health.module';
import { AiModule } from './ai/ai.module';
import { validateEnv } from './config/env.validation';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      envFilePath: ['../../.env', '.env'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.RATE_LIMIT_TTL ?? '60') * 1000,
        limit: parseInt(process.env.RATE_LIMIT_MAX ?? '100'),
      },
    ]),
    EventEmitterModule.forRoot(),
    DatabaseModule,
    AuthModule,
    UsersModule,
    ConnectionsModule,
    ConversationsModule,
    MessagesModule,
    MomentsModule,
    NotificationsModule,
    WalletModule,
    QrModule,
    MiniAppsModule,
    TasksModule,
    ExpensesModule,
    PollsModule,
    AdminModule,
    HealthModule,
    AiModule,
  ],
})
export class AppModule implements NestModule {
  /**
   * Apply CorrelationIdMiddleware globally so every request
   * gets an X-Request-ID injected before hitting any route handler.
   */
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
