# Enterprise UPI Payment Integration & Webhook Architecture

This document specifies the production payment architecture for **WeEverything Super App Platform**, covering NPCI UPI Intent Flow, Razorpay / PhonePe / Cashfree payment gateways, webhook signature verification, signed requests, idempotency, and audit logging.

---

## 1. System Architecture Overview

```
+-------------------+        +--------------------+        +---------------------+
|  Mobile/Web App   | -----> |  WeEverything API  | -----> |  NPCI / Payment PG  |
|  (Client App)     |        |  (NestJS Backend)  |        |  (PhonePe/Razorpay) |
+-------------------+        +--------------------+        +---------------------+
         |                            ^                               |
         |                            |  HMAC-SHA256 Webhook          |
         +============================+===============================+
```

---

## 2. Payment Flow & State Machine

Every payment transaction strictly transitions through the following idempotent state machine:

```
    [INITIATED]
         |
         v
     [PENDING] --------(User Aborts / Timeout)--------> [FAILED]
         |
         v (Signed Webhook Signature Verified)
     [SUCCESS]
         |
         +------------(Refund Requested)--------------> [REFUNDED]
```

### Supported Payment Protocols:
1. **UPI Intent Flow (`upi://pay`)**: Direct application-to-application launch (PhonePe, Google Pay, Paytm, BHIM).
2. **Collect Requests**: Asynchronous push notification request sent to target UPI VPA (`username@upi`).
3. **Dynamic QR Code**: Time-bound static/dynamic QR code generated using standard `QRCodeSVG` specs containing `pa`, `pn`, `am`, `cu`, and `tn`.

---

## 3. Idempotency & Replay Protection

To prevent double debits and duplicate transaction execution:
- Every payment request **MUST** include a unique header: `X-Idempotency-Key: IDEMP_<TIMESTAMP>_<UUIDv4>`.
- The NestJS backend caches idempotency keys in Redis for 24 hours.
- Duplicate incoming requests with identical keys instantly return the cached response without re-triggering gateway API calls.

---

## 4. Webhook Security & Signature Verification

Payment Gateways (Razorpay / PhonePe / Cashfree) deliver real-time payment status via webhooks.

### Verification Algorithm (HMAC-SHA256):
```typescript
import * as crypto from 'crypto';

export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  secretKey: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(rawBody)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signatureHeader),
    Buffer.from(expectedSignature)
  );
}
```

---

## 5. Environment Configuration & Secret Encryption

Secrets are never exposed on client apps.

### `.env` Production Variables:
```env
# UPI Gateway Config
UPI_GATEWAY_PROVIDER="PHONEPE" # Options: RAZORPAY, PHONEPE, CASHFREE
UPI_MERCHANT_ID="MERCHANT_PROD_1009842"
UPI_MERCHANT_VPA="weeverything@upi"
UPI_SALT_KEY="SEC_PROD_HASH_KEY_V2"
UPI_SALT_INDEX="1"
UPI_WEBHOOK_SECRET="whsec_prod_90418429148"

# Sandbox Override Mode
PAYMENT_SANDBOX_MODE="false"
```

---

## 6. Audit Logging & Security Compliance

- **PCI-DSS Compliance**: No raw credit/debit card numbers or UPI PINs are ever stored.
- **Audit Logs**: All transaction attempts, status state transitions, and webhook payloads are persisted in encrypted PostgreSQL audit tables with SHA-256 integrity checksums.
