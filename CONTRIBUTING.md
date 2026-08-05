# Contributing to WeEverything

Thank you for your interest in contributing to WeEverything! This guide will help you get started with your development environment, understand our architecture, and submit pull requests.

## 🛠 Local Development Setup

### Prerequisites
- **Node.js**: >= 18.0.0
- **pnpm**: >= 9.0.0
- **Docker & Docker Compose**: Required for PostgreSQL and Redis

### Step-by-step Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/weeverything/weeverything.git
   cd weeverything
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start local services (Postgres & Redis)**
   ```bash
   docker compose up -d postgres redis
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

5. **Initialize Database**
   ```bash
   pnpm db:generate
   pnpm db:migrate
   pnpm db:seed
   ```

6. **Run Development Server**
   ```bash
   pnpm dev
   ```

## 🏗 Architecture & Code Structure

WeEverything is built as a pnpm monorepo managed by Turborepo:
- `apps/web`: Next.js 15 App Router frontend
- `apps/api`: NestJS REST + Socket.IO backend
- `packages/database`: Prisma ORM schema & client
- `packages/types`: Shared TypeScript interface definitions

## 📏 Code Style Guidelines

- **TypeScript**: Strict mode is enabled. Do not use `any` unless strictly necessary.
- **Components**: Functional components only. Use hooks for state.
- **Styling**: Tailored CSS design variables in `globals.css` with utility classes.
- **No Fake Data**: Do not hardcode fake users, balances, or mock metrics in production components. Use real API calls or clean empty states.

## 🧪 Testing & Verification

Before submitting a Pull Request, run:

```bash
# Typecheck all packages
pnpm typecheck

# Build all packages
pnpm build
```

## 🔀 Pull Request Process

1. Create a feature branch off `main`: `git checkout -b feature/my-feature`
2. Write clear, concise commit messages.
3. Verify typecheck and build pass locally.
4. Push your branch and open a Pull Request targeting `main`.
5. Provide a summary of changes and testing steps in the PR description.
