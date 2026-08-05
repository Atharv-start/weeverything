# Product Requirement Document (PRD) — WeEverything OS

WeEverything is a youth-focused digital super-app that consolidates communication, discovery feed, wallets, and micro-utilities into a single, unified interface.

---

## 1. Product Vision & Problem Statement
* **Vision:** One platform, one interface, WeEverything. Provide a youth-centric digital workspace that reduces context switching between messaging apps, finance tools, feeds, and utility trackers.
* **Problem:** Users are currently fatigued by managing 10+ different apps for communication, tracking habits, splitting expenses, and checking social feeds. They suffer from UI clutter, fragmented notifications, and disjointed experiences.
* **Target Users:** Gen-Z, students, young professionals, and digital nomads seeking a streamlined, snappy, brutalist-designed "digital home."

---

## 2. Core User Personas & Journeys
* **Persona A (The Social Organizer):** Wants to quickly chat with friends, create polls for dinner planning, log shared expenses, and see trending moments.
* **Persona B (The Productivity Enthusiast):** Uses the Calorie Tracker, Daily Task Planner, and checks AI summaries to stay on track.

---

## 3. Product Status & Features Matrix

### COMPLETED
* **Stitch Branding System:** Cinematic Brutalism theme styling (Midnight Onyx, Electric Lime, Geist Typography, snappy transitions).
* **Multi-app Architecture:** Monorepo with Next.js web client, NestJS API server, and shared Prisma database module.
* **Database Models:** Prisma SQLite schemas representing users, connections, chats, expenses, moments, tasks, and wallets.
* **Splitter Mini-App:** Expense group split calculator connected to the SQLite database.
* **Food Tracker Mini-App:** Log calories, track macro targets, and review metrics.
* **AI Engine Foundation:** Google Gemini integration services with offline simulated feedback fallbacks.
* **Search User Directory:** Basic user search mechanism.

### IN PROGRESS
* **Clerk Auth Stabilization:** Correcting redirect 404 targets and mounting page views securely.
* **Messaging & Chat system:** Multi-recipient conversations, message log polling, and popular emoji picker attachments.

### PLANNED
* **Universal AI Assistant:** Real-time chatbot queries on home discovery rows.
* **Connected Apps / OAuth integration:** Real OAuth handshakes to Google/YouTube/Instagram APIs.
* **Security Audits:** Enforcing backend permission checks for cross-tenant ID manipulation protection.

### OUT OF SCOPE
* **Real Fiat Wallet Deposits:** Integrating actual bank transfer gateways or credit card merchant accounts (restricted to local ledgers).
* **Native Android/iOS apps:** Creating Swift/Kotlin native wrappers.

---

## 4. Functional Requirements
* **Authentication:** Clerk must be the single source of truth for accounts. Clerk users are linked to database User rows.
* **Chats:** Support direct direct messages and group chats. Mark messages as read, show timestamps.
* **Moments:** Social feed where users can post captions and photos.
* **Wallet:** Local ledger entries for CREDIT/DEBIT tracking and seeding welcome balances.
* **Connected Apps:** Simulated/real integration handshakes.

---

## 5. Non-Functional Requirements
* **Performance:**Snappy visual interactions (< 150ms transitions).
* **Contrast & Accessibility:** Maintain legible dark text on light backgrounds and light text on dark backgrounds.
