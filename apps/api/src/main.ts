import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const compression = require('compression');


async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    // Disable built-in logger so our structured logger is the only output
    bufferLogs: true,
  });

  // ─── Security headers ─────────────────────────────────────────────────────
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  // ─── Response compression ─────────────────────────────────────────────────
  app.use(compression());

  // ─── Cookie parser ────────────────────────────────────────────────────────
  app.use(cookieParser(process.env.COOKIE_SECRET));

  // ─── Global prefix ────────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ─── CORS ─────────────────────────────────────────────────────────────────
  const origins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000').split(',');
  app.enableCors({
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id', 'x-correlation-id'],
    exposedHeaders: ['X-Request-ID'],
  });

  // ─── Global validation pipe ───────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ─── Global exception filter ──────────────────────────────────────────────
  // Must be registered AFTER validation pipe so ValidationPipe errors are caught
  app.useGlobalFilters(new AllExceptionsFilter());

  // ─── Graceful shutdown ────────────────────────────────────────────────────
  // Enables NestJS lifecycle hooks (OnModuleDestroy) to run on SIGTERM
  app.enableShutdownHooks();

  // ─── OpenAPI / Swagger ────────────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('WeEverything API')
      .setDescription(
        'Enterprise-grade REST API for the WeEverything super-app platform.\n\n' +
          '**Authentication:** Use the Authorize button to provide a Bearer token obtained from `POST /auth/login`.',
      )
      .setVersion('1.0.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', name: 'Authorization', in: 'header' },
        'JWT',
      )
      .addTag('auth', 'Authentication & session management')
      .addTag('users', 'User profiles & search')
      .addTag('connections', 'Friend/connection requests & blocking')
      .addTag('conversations', 'Direct & group conversations')
      .addTag('messages', 'Chat messages & reactions')
      .addTag('moments', 'Social feed — posts, likes, comments')
      .addTag('wallet', 'Digital wallet & ledger transfers')
      .addTag('qr', 'QR code generation & parsing')
      .addTag('notifications', 'In-app notifications')
      .addTag('mini-apps', 'Mini app registry')
      .addTag('tasks', 'Personal task management')
      .addTag('expenses', 'Group expense splitting')
      .addTag('polls', 'Polls & voting')
      .addTag('ai', 'AI-powered features')
      .addTag('admin', 'Admin panel — moderation & audit')
      .addTag('health', 'Service health checks')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
      },
    });

    logger.log('Swagger UI available at /api/docs');
  }

  const port = parseInt(process.env.API_PORT ?? '4000', 10);
  await app.listen(port);

  logger.log(`WeEverything API running on port ${port} [${process.env.NODE_ENV ?? 'development'}]`);
}

bootstrap();
