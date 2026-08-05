# AI Engineering Rules — WeEverything OS

This document constitutes the strict AI developer rulebook for working with the WeEverything codebase.

---

## 1. Core Development Rules

### WHAT TO DO
* **Inspect First:** Search files and trace variables before modifying.
* **Respect Workspace Structure:** Use `pnpm` workspace commands (`pnpm --filter ...`) for dependencies, builds, and runs.
* **Reuse Code:** Check existing utilities, hooks, or service wrappers before writing new ones.
* **Server-Side Security:** Always validate inputs (Zod/class-validator) and verify route ownership rules in NestJS.
* **Preserve User Data:** Keep SQLite `dev.db` structures intact; do not perform database resets or clear seed tables.
* **Design Token Contrast:** Check foreground and background variables in `globals.css` to guarantee reading contrast.

### WHAT TO AVOID
* **NO Hardcoding Credentials:** Never save, log, print, or commit API keys (Gemini, Clerk, JWT, database).
* **NO Duplicate Frontends/Backends:** Do not generate demo applications, duplicate controller routers, or alternate monorepos.
* **NO Frontend Secrets:** Do not prefix secret key environment variables with `NEXT_PUBLIC_`.
* **NO Silent Failures:** Never swallow exceptions or print empty catch blocks. Always log the error details in NestJS development consoles.

---

## 2. Artificial Intelligence (AI) Boundaries
The AI Assistant MUST NOT:
1. Access private data of User B from User A's session.
2. Expose internal system tokens or private JWTs in response bodies.
3. Automatically execute financial ledger transfers or delete database tables without direct user confirmation.
4. Render unvalidated text outputs directly as HTML (always sanitize or use standard string components).

---

## 3. Error Handling Policy
* **Frontend:** Display user-friendly error banners with actionable directions (e.g. "Clerk token expired. Please refresh").
* **Backend:** Log complete stack traces in server consoles, but return clean, semantic error payloads to client requests:
  ```json
  {
    "success": false,
    "error": {
      "code": "UNAUTHORIZED",
      "message": "Invalid or expired authorization credentials"
    }
  }
  ```
