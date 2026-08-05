# WeEverything Architecture

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| State | TanStack Query (server), Zustand (client) |
| Forms | React Hook Form + Zod |
| Backend | NestJS 10, TypeScript |
| Real-time | Socket.IO 4 |
| Database | PostgreSQL 16 (Prisma 6) |
| Cache/Presence | Redis 7 (ioredis) |
| Object Storage | MinIO (S3-compatible) |
| Auth | JWT (access 15m + refresh 30d rotating) |
| Password | Argon2id |
| Monorepo | pnpm workspaces + Turborepo |

## Repository Layout

```
weeverything/
├── apps/
│   ├── api/         NestJS backend
│   └── web/         Next.js frontend
├── packages/
│   ├── database/    Prisma schema + migrations
│   ├── types/       Shared TypeScript types
│   └── config/      (planned)
├── docs/
├── docker-compose.yml
└── docker-compose.production.yml (planned)
```

## API Design

- Prefix: `/api/v1`
- All responses: `{ success, data, meta? }` or `{ success: false, error: { code, message } }`
- Auth: Bearer JWT in Authorization header
- Pagination: cursor-based (nextCursor + hasMore)

## Security Model

- Argon2id (memoryCost=65536, timeCost=3, parallelism=4)
- JWT access tokens: 15 minutes
- Refresh tokens: 30 days, rotating, stored as SHA-256 hash
- Socket.IO: JWT validated server-side on connect; rooms joined server-side only
- RBAC: hierarchical (USER < MODERATOR < ADMIN < SUPER_ADMIN)
- Rate limiting: ThrottlerModule (100 req/min general, 10/min auth)
- Wallet: balance computed from ledger, never trusted from client
- Idempotency keys on all financial operations

## Real-time Architecture

- Socket.IO WebSocket namespace: `/ws`
- Conversation rooms: `conv:{conversationId}` — joined server-side after auth
- Events: message:send, message:new, typing:start/stop, typing:update, message:read, presence:update
- Notification delivery: direct to user sockets via userId → socketId map

## Wallet Architecture

- Double-entry ledger (LedgerTransaction + LedgerEntry)
- Balance = SUM of all LedgerEntry amounts for a wallet (credits positive, debits negative)
- All transfers: PostgreSQL transaction + idempotency key
- Integer minor units only (paise for INR)
- No floating point money anywhere
