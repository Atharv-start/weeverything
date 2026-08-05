<div align="center">

<h1>⚡ WeEverything</h1>

<p><strong>Your digital world. One place.</strong></p>

<p>A production-ready, full-stack super-app SaaS platform — social networking, real-time chat, wallet, mini-apps, and more — built as a TypeScript monorepo.</p>

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![pnpm](https://img.shields.io/badge/pnpm-9-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2-EF4444?logo=turborepo&logoColor=white)](https://turbo.build/)

</div>

---

## ✨ What is WeEverything?

WeEverything is an all-in-one super-app that combines:

- 💬 **Real-time Chat** — conversations, group messaging, read receipts via Socket.IO
- 📸 **Moments** — social feed with likes, comments, bookmarks
- 💸 **Wallet** — double-entry ledger, peer-to-peer transfers, payment requests
- 🔗 **Connections** — social graph with follow/block/mute
- 🧩 **Mini-Apps Hub** — modular apps inside the platform:
  - ✅ Task Manager
  - 💰 Expense Splitter
  - 📊 Polls
  - 🧮 Calculator
  - 📝 Notes & Whiteboard
  - 🕒 Clock & Productivity tools
  - 🤖 AI Suite
- 🔔 **Notifications** — real-time notification center
- 🔍 **People Search** — discover users by username
- 🛡️ **Admin Dashboard** — full moderation and analytics panel
- 📱 **QR Codes** — profile QR, payment QR

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, React 19, TypeScript |
| **Styling** | Tailwind CSS with custom design tokens |
| **State** | TanStack Query + Zustand |
| **Forms** | React Hook Form + Zod |
| **Backend** | NestJS 10, TypeScript |
| **Real-time** | Socket.IO 4 |
| **Database** | PostgreSQL 16 via Prisma 6 |
| **Caching** | Redis 7 |
| **Storage** | MinIO (S3-compatible) |
| **Auth** | Clerk + JWT (15m access + 30d refresh, rotating) |
| **Password** | Argon2id |
| **Monorepo** | pnpm workspaces + Turborepo |

---

## 📁 Project Structure

```
weeverything/                   ← Monorepo root
├── apps/
│   ├── api/                    ← NestJS backend (port 4000)
│   │   └── src/
│   │       ├── auth/           ← Auth + JWT + RBAC
│   │       ├── users/          ← User profiles + sessions
│   │       ├── connections/    ← Social connections
│   │       ├── conversations/  ← Chat rooms
│   │       ├── messages/       ← Messages + Socket.IO gateway
│   │       ├── moments/        ← Social feed
│   │       ├── notifications/  ← Notification system
│   │       ├── wallet/         ← Double-entry ledger
│   │       ├── qr/             ← QR code system
│   │       ├── mini-apps/      ← Mini app registry
│   │       ├── tasks/          ← Task manager
│   │       ├── expenses/       ← Expense splitter
│   │       ├── polls/          ← Poll system
│   │       └── admin/          ← Admin panel
│   └── web/                    ← Next.js 15 frontend (port 3000)
│       └── src/app/
│           ├── (app)/          ← Authenticated app shell
│           │   ├── home/       ← Dashboard
│           │   ├── chats/      ← Conversations
│           │   ├── moments/    ← Social feed
│           │   ├── wallet/     ← Wallet + transfers
│           │   ├── mini-apps/  ← Mini apps hub
│           │   ├── notifications/
│           │   ├── search/
│           │   ├── settings/
│           │   └── admin/
│           └── auth/           ← Login + Register pages
├── packages/
│   ├── database/               ← Prisma schema + generated client
│   └── types/                  ← Shared TypeScript types
├── docs/                       ← Architecture + Project State docs
├── .env.example                ← Environment variable template
├── docker-compose.yml
├── pnpm-workspace.yaml
└── turbo.json
```

---

## 🚀 Quick Start

### Prerequisites

| Tool | Required Version | Check Command |
|------|-----------------|---------------|
| Node.js | ≥ 18 | `node -v` |
| pnpm | ≥ 9 | `pnpm -v` |
| Docker Desktop | ≥ 26 | `docker -v` |
| Git | any | `git -v` |

> ⚠️ Docker is **required** to run PostgreSQL and Redis locally.

### 1. Clone the repository

```bash
git clone https://github.com/Atharv-start/weeverything.git
cd weeverything
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
# Open .env and fill in your secrets (see .env.example for guidance)
```

### 4. Start infrastructure (Docker)

```bash
docker compose up -d postgres redis minio
```

### 5. Set up the database

```bash
pnpm db:generate    # Generate Prisma client
pnpm db:migrate     # Run migrations
pnpm db:seed        # Seed demo data
```

### 6. Start development servers

```bash
pnpm dev
```

This starts:
- 🌐 **Web App** → http://localhost:3000
- ⚙️ **API Server** → http://localhost:4000

---

## 🔐 Demo Accounts

After running `pnpm db:seed`, these accounts are available:

| Email | Password | Role |
|-------|----------|------|
| `admin@weeverything.dev` | `Password123!` | SUPER_ADMIN |
| `alice@weeverything.dev` | `Password123!` | USER |
| `bob@weeverything.dev` | `Password123!` | USER |

---

## 📋 Available Scripts

```bash
# Development
pnpm dev              # Start all apps in parallel (Turbo)
pnpm build            # Build all apps for production

# Code Quality
pnpm typecheck        # TypeScript check all packages
pnpm lint             # Lint all packages
pnpm test             # Run all tests

# Database (Prisma)
pnpm db:generate      # Generate Prisma client
pnpm db:migrate       # Run pending migrations (dev)
pnpm db:seed          # Seed development data
pnpm db:studio        # Open Prisma Studio GUI
pnpm db:reset         # Reset and re-seed database
```

---

## 🔑 API Reference

All routes are prefixed with `/api/v1`

| Module | Endpoints |
|--------|-----------|
| **Auth** | `POST /auth/register` · `POST /auth/login` · `POST /auth/logout` · `POST /auth/refresh` |
| **Users** | `GET /users/search` · `GET /users/:username/profile` · `PUT /users/:username/profile` |
| **Connections** | `POST /connections/request` · `POST /connections/accept` · `POST /connections/reject` |
| **Conversations** | `GET/POST /conversations` · `GET /conversations/:id` |
| **Messages** | `GET/POST/PUT/DELETE /conversations/:id/messages` |
| **Moments** | `GET/POST /moments` · `POST /moments/:id/like` · `POST /moments/:id/comments` |
| **Notifications** | `GET /notifications` · `POST /notifications/mark-all-read` |
| **Wallet** | `GET /wallet` · `POST /wallet/transfer` · `POST /wallet/payment-request` |
| **QR** | `GET /qr/profile` · `POST /qr/parse` |
| **Tasks** | `GET/POST/PUT/DELETE /tasks` |
| **Expenses** | `GET/POST /expenses/groups` · `POST /expenses/groups/:id/expenses` |
| **Polls** | `GET/POST /polls` · `POST /polls/:id/vote` |
| **Admin** | `GET /admin/dashboard` · `GET /admin/users` · `GET /admin/reports` |
| **Health** | `GET /health` |

---

## 🔒 Security

- **Passwords** — Argon2id (memoryCost=65536, timeCost=3)
- **Tokens** — JWT access (15min) + rotating refresh (30 days), hash-stored in DB
- **WebSocket** — JWT validated server-side on connect, rooms joined server-side only
- **RBAC** — Hierarchical (`USER < MODERATOR < ADMIN < SUPER_ADMIN`)
- **Rate Limiting** — 100 req/min general, 10/min on auth endpoints
- **Wallet** — Balance calculated from ledger, never trusted from client; all transfers use DB transactions with idempotency keys

> 🔐 See [SECURITY.md](./SECURITY.md) for vulnerability reporting.

---

## 🤝 Contributing

We welcome contributions! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before submitting a pull request.

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feat/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/Atharv-start">Atharv Raj Pandab</a></p>
</div>
