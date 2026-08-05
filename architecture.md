# System Architecture — WeEverything OS

This document maps the real directory layout, technical stack, authentication flows, and data relationships of WeEverything.

---

## 1. Directory Structure
```
weeverything/
├── apps/
│   ├── web/                     # Next.js 15.1.3 App Router Frontend
│   │   ├── src/
│   │   │   ├── app/             # Page routes and layout groupings
│   │   │   ├── components/      # ClerkTokenSync, etc.
│   │   │   ├── lib/             # Axios API client config
│   │   │   └── store/           # Zustand Auth Store client state
│   │   └── tailwind.config.js   # Stitch style properties mapping
│   └── api/                     # NestJS backend API Server
│       ├── src/
│       │   ├── auth/            # JwtAuthGuard and Clerk token sync controller
│       │   ├── ai/              # Google Gemini integration service and controller
│       │   ├── connections/     # Contacts relationship management
│       │   ├── conversations/   # Conversation rooms resolver
│       │   └── messages/        # Chat messages log and Gateway
├── packages/
│   └── database/                # Prisma ORM sqlite module
│       ├── prisma/
│       │   ├── schema.prisma    # SQLite schema models
│       │   └── dev.db           # SQLite database file
```

---

## 2. Technical Stack
* **MonoRepo Orchestrator:** Turborepo 2.3+
* **Package Manager:** pnpm 9.15
* **Frontend:** Next.js 15.1.3, React 19, TailwindCSS 3
* **Backend:** NestJS 10, Passport (legacy), WebSockets/Socket.io (ready)
* **Database:** SQLite, Prisma ORM 6.3
* **Authentication:** Clerk Auth (`@clerk/nextjs` for Next.js, `@clerk/backend` for NestJS)
* **AI Provider:** Google Generative AI (`@google/generative-ai` SDK, `gemini-1.5-flash` model)

---

## 3. Core Architectural Flows

### A. Clerk Authentication & Local Session Sync
1. The user logs in via the Next.js Clerk component (`<SignIn />` or `<SignUp />`).
2. Next.js Clerk middleware checks the session cookie, letting the request continue if valid.
3. The `<ClerkTokenSync />` component obtains the Clerk Bearer Token client-side and passes it as an authorization header to the backend API (`/auth/me`).
4. NestJS `JwtAuthGuard` intercepts the request:
   - Verifies the token signatures using Clerk public keys.
   - Extract the `sub` (Clerk User ID).
   - Searches SQLite for a user matching `clerkId = sub`.
   - If not found, fetches user fields from Clerk backend REST API, links or creates a new SQLite user row, and credit them with ₹1000.00.
   - Attaches the resolved local user object to `request.user`.

### B. Gemini AI Integration (Server-Side Only)
1. Next.js triggers a request to `/api/ai/...` with user criteria (e.g. caption, task plan text, chat ID).
2. The NestJS `AiService` loads `GEMINI_API_KEY` from secure process environment variables.
3. Calls the Gemini API `gemini-1.5-flash` model to process the query.
4. If no key is set or a failure occurs, returns a pre-configured JSON mock payload.
5. Returns data safely to Next.js clients. The frontend never accesses the API key directly.

### C. Contacts and Chats
* **Contacts:** A unidirectional connection request flow (requesterId, receiverId, status). A connection is bidirectional in the `Connection` table once accepted.
* **Chats:** Room structures containing `ConversationMember` relationships and `Message` logs. Message history is pulled via polling (`refetchInterval` on query client).
