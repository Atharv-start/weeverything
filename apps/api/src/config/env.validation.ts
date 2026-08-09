import { z } from 'zod';

const DEV_SECRET_PATTERN = /^(dev|test|change_me|secret|default|example|sample|placeholder)/i;

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  API_PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // JWT — required, minimum strength
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  // Cookie — required, no default (prevents accidental dev-secret in production)
  COOKIE_SECRET: z.string().min(32, 'COOKIE_SECRET must be at least 32 characters'),

  // CORS & App
  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  // Rate limiting
  RATE_LIMIT_TTL: z.coerce.number().default(60),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_AUTH_MAX: z.coerce.number().default(10),

  // Third-party (optional)
  CLERK_SECRET_KEY: z.string().optional(),

  // Payment Providers (UPI / Cards / Netbanking)
  PAYMENT_PROVIDER: z.enum(['razorpay', 'cashfree', 'sandbox']).default('sandbox'),
  PAYMENT_MODE: z.enum(['sandbox', 'live']).default('sandbox'),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  CASHFREE_APP_ID: z.string().optional(),
  CASHFREE_SECRET_KEY: z.string().optional(),
  CASHFREE_WEBHOOK_SECRET: z.string().optional(),

  // AI Platform — providers (all optional, at least one needed for AI features)
  GEMINI_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  OLLAMA_BASE_URL: z.string().url().optional(),

  // AI Platform — configuration
  AI_DEFAULT_PROVIDER: z.enum(['gemini', 'openai', 'anthropic', 'openrouter', 'ollama']).default('gemini'),
  AI_CACHE_TTL_SECONDS: z.coerce.number().default(300),
  AI_MAX_TOKENS: z.coerce.number().default(2048),
  AI_RATE_LIMIT_PER_MIN: z.coerce.number().default(60),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const messages = Object.entries(errors)
      .map(([key, val]) => `  • ${key}: ${val?.join(', ')}`)
      .join('\n');
    throw new Error(`\n[WeEverything] Environment validation failed:\n${messages}\n`);
  }

  const env = result.data;

  // Fail hard if dev-pattern secrets are used in production
  if (env.NODE_ENV === 'production') {
    const sensitiveVars: Array<keyof typeof env> = [
      'JWT_ACCESS_SECRET',
      'JWT_REFRESH_SECRET',
      'COOKIE_SECRET',
    ];
    const insecure = sensitiveVars.filter((key) => {
      const val = env[key] as string | undefined;
      return val && DEV_SECRET_PATTERN.test(val);
    });

    if (insecure.length > 0) {
      throw new Error(
        `\n[WeEverything] Production startup blocked:\n` +
          `The following secrets appear to be development placeholders:\n` +
          insecure.map((k) => `  • ${k}`).join('\n') +
          `\nReplace them with cryptographically strong secrets before deploying.\n`,
      );
    }
  }

  return env;
}
