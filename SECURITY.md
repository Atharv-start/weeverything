# Security Policy

WeEverything Technologies takes security seriously. We appreciate the work of security researchers in improving the safety of our platform.

## Supported Versions

| Version | Supported |
| ------- | --------- |
| Main (v2.x) | :white_check_mark: |
| < 2.0 | :x: |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you believe you have found a security vulnerability in WeEverything, please disclose it responsibly by sending an email to:

📧 **[security@weeverything.app](mailto:security@weeverything.app)**

### What to Include in Your Report

- Type of issue (e.g., SQL injection, XSS, broken access control, authentication flaw)
- Full steps to reproduce the issue
- Proof-of-Concept code or screenshots, if available
- Potential impact of the vulnerability

### Response Timeline

- **Initial Response**: Within 48 hours
- **Triage & Assessment**: Within 5 business days
- **Fix & Deployment**: Target within 30–90 days depending on severity

## Responsible Disclosure Policy

We ask that you:
- Make a good faith effort to avoid privacy violations, destruction of data, and interruption or degradation of our service.
- Only interact with accounts you own or with explicit permission of the account holder.
- Give us reasonable time to fix the issue before making any information public.

## Security Controls Overview

- **Passwords**: Argon2id (memoryCost=65536, timeCost=3)
- **Tokens**: JWT access (15m) + rotating refresh (30 days), stored as cryptographic hashes
- **WebSockets**: Server-side JWT validation on connection establishment
- **RBAC**: Hierarchical access control enforced on backend endpoints
- **Financial Ledger**: Double-entry accounting with idempotency keys and database transactions
- **Rate Limiting**: Throttled auth and API endpoints
