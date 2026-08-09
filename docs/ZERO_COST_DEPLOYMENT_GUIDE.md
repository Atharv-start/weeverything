# WeEverything Zero-Cost (₹0) Production Deployment Guide

This guide details the exact steps to deploy the complete WeEverything platform live to the web for **₹0** using forever-free tier cloud infrastructure.

---

## 📊 Zero-Cost Infrastructure Architecture

| Layer | Provider | Free Tier Specification | Cost |
| :--- | :--- | :--- | :--- |
| **Frontend** | **Vercel** *(or Cloudflare Pages)* | Next.js 15 App Router, React 19, automatic SSL, CDN | **₹0** |
| **Backend API & WebSockets** | **Koyeb** *(or Render)* | NestJS Node.js runtime, native WebSockets (`wss://`) | **₹0** |
| **Database** | **Neon.tech** *(or Supabase)* | 500MB Serverless PostgreSQL, Prisma ORM pooling | **₹0** |
| **Cache & Pub/Sub** | **Upstash Redis** | 10,000 commands/day, TCP `ioredis` protocol | **₹0** |
| **Object Storage** | **Cloudflare R2** | 10GB storage, $0 egress bandwidth fees | **₹0** |
| **Authentication** | **Clerk** | Up to 10,000 monthly active users | **₹0** |
| **Total Cost** | | | **₹0** |

---

## 🚀 Step 1: Provision Free Database & Redis (5 mins)

### 1. PostgreSQL on Neon.tech
1. Sign up at [neon.tech](https://neon.tech) (Free Forever, no credit card required).
2. Create a project named `weeverything-prod`.
3. Copy the pooled PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://user:pass@ep-xyz-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
   ```

### 2. Redis on Upstash
1. Sign up at [upstash.com](https://upstash.com) (Free Forever).
2. Create a Redis database named `weeverything-redis`.
3. Copy the Redis connection URL:
   ```env
   REDIS_URL="rediss://default:password@xyz.upstash.io:6379"
   ```

---

## ⚙️ Step 2: Deploy NestJS API to Koyeb / Render (5 mins)

1. Sign up at [koyeb.com](https://koyeb.com) or [render.com](https://render.com) (Free Web Service).
2. Click **New Service** → Connect your GitHub Repository (`weeverything`).
3. Set configuration:
   - **Service Type**: Web Service
   - **Build Command**: `pnpm --filter @weeverything/database generate && pnpm --filter api build`
   - **Run Command**: `pnpm --filter api start`
4. Add Environment Variables:
   ```env
   NODE_ENV=production
   PORT=4000
   DATABASE_URL=<your-neon-db-url>
   REDIS_URL=<your-upstash-redis-url>
   CORS_ORIGINS=https://weeverything.vercel.app
   JWT_ACCESS_SECRET=your-secure-access-secret-32-chars
   JWT_REFRESH_SECRET=your-secure-refresh-secret-32-chars
   COOKIE_SECRET=your-secure-cookie-secret-32-chars
   CLERK_SECRET_KEY=<your-clerk-live-secret-key>
   ```
5. Run initial database migration:
   - Execute database sync command: `pnpm --filter @weeverything/database exec prisma db push`
6. Copy your live API URL (e.g. `https://api-weeverything.koyeb.app`).

---

## 🌐 Step 3: Deploy Next.js Frontend to Vercel (3 mins)

1. Sign up at [vercel.com](https://vercel.com) (Free Hobby Tier).
2. Click **Add New Project** → Import `weeverything` repository.
3. Configure Project Settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
4. Environment Variables:
   ```env
   NEXT_PUBLIC_API_URL=https://api-weeverything.koyeb.app
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>
   ```
5. Click **Deploy**.
6. Your live public frontend URL is generated automatically: `https://weeverything.vercel.app` (or `https://weeverything.pages.dev`).

---

## 🔍 Step 4: Google Search Console Setup for Free URL

Once `https://weeverything.vercel.app` is live:

1. Open [Google Search Console](https://search.google.com/search-console).
2. Select **URL prefix** property and enter your free production URL:
   `https://weeverything.vercel.app`
3. Verify Ownership:
   - Choose **HTML Tag** method.
   - Add the meta tag to `apps/web/src/app/layout.tsx` metadata:
     ```ts
     verification: { google: 'your-verification-code' }
     ```
4. Submit Sitemap:
   - Navigate to **Sitemaps** in the left menu.
   - Enter `sitemap.xml` and click **Submit**.
5. Request Indexing:
   - Enter `https://weeverything.vercel.app/` in the top search bar and click **Request Indexing**.

---

## 🧪 Real User Verification Checklist

After deployment, open `https://weeverything.vercel.app` in any browser or mobile device to verify:

- [x] **Public Homepage & Navigation**: Loads styled theme with fast response time.
- [x] **Real User Registration & Login**: Authenticates via Clerk without localhost dependency.
- [x] **Realtime WebSockets**: Chat messages and typing indicators transmit instantly via `wss://`.
- [x] **PostgreSQL Persistence**: Moments updates, Channel video reels, and user profiles persist across sessions.
- [x] **UPI Payment Gateway**: Real double-entry wallet ledger and Sandbox/Razorpay UPI Intent checkout functions natively.
- [x] **Google Indexability**: `robots.txt` allows public routes while protecting `/chats`, `/wallet`, `/admin`, and `/settings`.
