# SETUP REQUIRED

WeEverything requires these system tools before running.

## Missing: Docker

Docker is not installed on this system.

**Why needed:** PostgreSQL, Redis, and MinIO run as Docker containers.

**Recommended version:** Docker Desktop 26+ or Docker Engine 25+

**Verification:** `docker --version && docker compose version`

**Without Docker:** You can still run the API and web app manually if you install PostgreSQL and Redis natively.
- PostgreSQL 16+: https://www.postgresql.org/download/
- Redis 7+: https://redis.io/docs/install/

---

## Required Before Running

1. Install Docker Desktop (recommended): https://www.docker.com/products/docker-desktop/
2. OR manually install PostgreSQL 16+ and Redis 7+

---

## After Installing Docker

```bash
# Start infrastructure
docker compose up -d postgres redis

# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed database
pnpm db:seed

# Start development
pnpm dev
```
