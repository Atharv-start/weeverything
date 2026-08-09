# WeEverything — Phase 9 Public Launch & Onboarding Guide

This document outlines the complete operational and technical requirements for launching WeEverything publicly with real Indian UPI payments, a custom domain with HTTPS, Google Search Console indexing, and production security controls.

---

## Part 1: Real UPI Payment Provider Onboarding

WeEverything includes a payment abstraction layer supporting **Razorpay**, **Cashfree**, and **Sandbox** test modes.

### 1.1 Provider Merchant Onboarding Requirements
To accept real-money UPI payments from users in India via Google Pay, PhonePe, Paytm, or BHIM:

1. **Merchant Account Registration**:
   - Register a merchant business account at [Razorpay Dashboard](https://dashboard.razorpay.com/) or [Cashfree Payments](https://merchant.cashfree.com/).
2. **Business Verification & KYC**:
   - Provide business PAN, GSTIN (if registered), registered bank account details, and authorized signee Aadhaar/PAN.
   - Upload business terms of service, privacy policy, and refund/cancellation policies (all included under `/terms`, `/privacy`, `/acceptable-use`).
3. **API Credentials Generation**:
   - In Razorpay Dashboard: Go to **Settings > API Keys** -> Generate **Key ID** and **Key Secret**.
   - In Cashfree Dashboard: Go to **Developers > API Keys** -> Copy **App ID** and **Secret Key**.
4. **Webhook Setup**:
   - Webhook URL: `https://<YOUR_DOMAIN>/api/wallet/payment/webhook`
   - Select events:
     - `payment.captured`
     - `order.paid`
     - `payment.failed`
   - Copy generated **Webhook Secret** and set as `RAZORPAY_WEBHOOK_SECRET` or `CASHFREE_WEBHOOK_SECRET` in `.env`.

### 1.2 Environment Configuration
In production `.env`:
```env
PAYMENT_PROVIDER="razorpay" # 'razorpay' | 'cashfree' | 'sandbox'
PAYMENT_MODE="live"        # 'sandbox' | 'live'

RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="your_razorpay_live_secret"
RAZORPAY_WEBHOOK_SECRET="your_razorpay_webhook_secret"
```

---

## Part 2: Custom Domain & HTTPS Setup

### 2.1 Domain DNS Configuration
To point your custom domain (e.g., `https://weeverything.app` or `https://yourdomain.com`) to your server:

1. Log in to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.).
2. Add the following DNS records:
   - **A Record**: `@` -> `YOUR_SERVER_PUBLIC_IP`
   - **CNAME Record**: `www` -> `@`
3. If using Cloudflare DNS: Ensure Proxy status is enabled (Orange Cloud) for SSL termination and DDoS protection.

### 2.2 SSL / Reverse Proxy Configuration
When using the included `docker-compose.prod.yml` and `Caddyfile`, HTTPS SSL certificates are provisioned automatically via Let's Encrypt for your `DOMAIN_NAME`.

---

## Part 3: Google Search Console & SEO Discovery

### 3.1 Google Search Console Verification Steps
To enable crawling and track Google indexing:

1. Open [Google Search Console](https://search.google.com/search-console).
2. Click **Add Property** -> Enter your domain (e.g. `weeverything.app`).
3. Choose **DNS Record Verification**:
   - Copy the provided TXT record (e.g. `google-site-verification=...`).
   - Add the TXT record in your DNS settings.
   - Click **Verify** in Google Search Console.
4. **Submit Sitemap**:
   - Navigate to **Sitemaps** in the left menu.
   - Enter `sitemap.xml` (URL: `https://weeverything.app/sitemap.xml`).
   - Click **Submit**.

### 3.2 Indexing vs Privacy Boundary
- **Indexable Public Pages**: `/`, `/home`, `/about`, `/terms`, `/privacy`, `/community-guidelines`, `/app-store`, `/mini-apps`, public `/moments` & `/channels`.
- **Blocked Private Pages** (via `robots.txt`): `/chats`, `/wallet`, `/admin`, `/settings`, `/workspace`, `/notifications`, `/api/`.

---

## Part 4: Production Database & Security Checklist

1. **Remove Seed/Demo Fallbacks**:
   - Database starts clean in production. User-generated moments, channel reels, and wallet ledger entries are real and persisted in PostgreSQL.
2. **Secrets Security**:
   - Ensure all JWT secrets (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `COOKIE_SECRET`) are at least 32 random characters.
3. **Database Health Monitoring**:
   - Public health endpoint available at `GET /health` returning DB and Redis status.
