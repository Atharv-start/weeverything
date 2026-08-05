# Architecture Decision Records (ADR) — WeEverything OS

This document records Technical Decisions made during the WeEverything project.

---

## Decisions Log

### ADR 1 — Migration of Authentication to Clerk
* **Date:** 2026-07-15
* **Decision:** Replace local custom JWT password/refresh token auth with Clerk auth.
* **Reason:** Clerk is a secure, industry-standard authentication provider supporting OAuth (Google, Apple, etc.) and MFA. It reduces backend security risks and simplifies user account management.
* **Alternatives Considered:** Auth0, NextAuth (Auth.js), custom SQLite password hashing.
* **Files Affected:** `schema.prisma`, `layout.tsx`, `middleware.ts`, `jwt-auth.guard.ts`.
* **Consequences:** We added `clerkId` to User model and created a sync mechanism so Clerk profiles link directly to SQLite user statistics.

---

### ADR 2 — SQLite Database Preservation
* **Date:** 2026-07-15
* **Decision:** Retain the local SQLite database (`dev.db`) instead of resetting or switching to PostgreSQL.
* **Reason:** Avoids disrupting pre-existing mock statistics and seed entries which are critical for visual discovery rows.
* **Alternatives Considered:** Docker PostgreSQL setup, local raw files storage.
* **Files Affected:** `schema.prisma`.
* **Consequences:** We synchronized Clerk accounts to local database statistics, maintaining the integrity of all relational tables.

---

### ADR 3 — Server-Side Only Google Gemini API Invocations
* **Date:** 2026-07-15
* **Decision:** Perform all Google AI Studio / Gemini API requests exclusively on the NestJS backend.
* **Reason:** Exposing `GEMINI_API_KEY` on the client package (e.g. using `NEXT_PUBLIC_`) compromises security and invites credentials theft.
* **Alternatives Considered:** Client-side API keys with restricted CORS origins.
* **Files Affected:** `apps/api/src/ai/*`, `apps/web/src/*`.
* **Consequences:** The client requests AI metrics through NestJS routes, protecting credentials and allowing backend rate limiting.
