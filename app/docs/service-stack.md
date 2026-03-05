# Service Stack Decision Log

Last updated: 2026-03-03
Project: Food Marketplace (FastAPI + React + Postgres)
Owner: <your name>

## 1) Core Principles

- Keep tool count small: one service per need.
- Prefer managed services with easy upgrade from free tier.
- Every service must be deployable in <= 1 day.
- If blocked, switch to fallback immediately.

## 2) Selected Stack (MVP)

## Backend Hosting

- Service: Render
- Purpose: Deploy FastAPI API
- Why selected: Simple deploy, free/starter path, good Python support
- Free-tier constraints: Sleep/cold starts on free plans
- Upgrade trigger: API latency/business use requires always-on
- Fallback: Railway
- Owner: <name>
- Status: [ ] Not started [ ] In progress [ ] Live

## Frontend Hosting

- Service: Vercel
- Purpose: Deploy React/Vite frontend
- Why selected: Fast CI/CD from GitHub, strong DX
- Free-tier constraints: Hobby limits
- Upgrade trigger: Team/commercial scale needs
- Fallback: Netlify
- Owner: <name>
- Status: [ ] Not started [ ] In progress [ ] Live

## Database

- Service: Neon
- Purpose: Managed PostgreSQL
- Why selected: Serverless Postgres, easy branching/backups
- Free-tier constraints: Compute/storage caps
- Upgrade trigger: Sustained production load
- Fallback: Supabase Postgres / Render Postgres
- Owner: <name>
- Status: [ ] Not started [ ] In progress [ ] Live

## DNS/CDN/Security

- Service: Cloudflare
- Purpose: DNS, SSL, CDN, basic WAF/rate limiting
- Why selected: Strong free plan, easy edge protection
- Free-tier constraints: Advanced WAF/rules on paid tiers
- Upgrade trigger: Need advanced bot/security controls
- Fallback: Provider-native DNS + app-level controls
- Owner: <name>
- Status: [ ] Not started [ ] In progress [ ] Live

## Error Monitoring

- Service: Sentry
- Purpose: Backend + frontend error tracking
- Why selected: Fast setup, actionable traces
- Free-tier constraints: Event volume caps
- Upgrade trigger: Missing critical production visibility
- Fallback: self-hosted logs + alerts
- Owner: <name>
- Status: [ ] Not started [ ] In progress [ ] Live

## Product Analytics

- Service: PostHog
- Purpose: Funnel + conversion analytics
- Why selected: Product analytics + feature flags
- Free-tier constraints: Event caps
- Upgrade trigger: Event volume exceeds tier
- Fallback: Plausible/GA + custom events
- Owner: <name>
- Status: [ ] Not started [ ] In progress [ ] Live

## Payments (Uganda - Kampala)

- Service: Flutterwave (primary)
- Purpose: Mobile Money payments (MTN/Airtel Uganda)
- Why selected: Regional support + webhook flow
- Free-tier constraints: N/A (payment fees model)
- Upgrade trigger: Need direct telco integration/optimization
- Fallback: Direct MTN MoMo API integration
- Owner: <name>
- Status: [ ] Not started [ ] In progress [ ] Live

## 3) Integration Map to Current Codebase

## Backend

- Config: `app/core/config.py`
  - Add: `PAYMENT_PROVIDER`, `FLW_SECRET_HASH`, `FLW_PUBLIC_KEY`, `FLW_SECRET_KEY`, `SENTRY_DSN`, `POSTHOG_API_KEY`
- Webhook endpoint: `app/api/webhooks.py`
  - Enforce signature verification + idempotency
- Payment service: `app/services/payments/`
  - `base.py`, `flutterwave.py`, `mock.py`
- Order processing: `app/services/order_service.py`
  - Keep payment transition logic centralized
- Wallet safety: `app/services/wallet_service.py`
  - Preserve row locking + strict ledger writes

## Frontend

- API base URL/env: `frontend/src/api/axios.js`
- Error monitoring init: `frontend/src/main.jsx`
- Product analytics events:
  - Restaurants list view: `frontend/src/pages/Restaurants.jsx`
  - Add to cart: `frontend/src/context/CartContext.jsx`
  - Checkout submit: `frontend/src/components/CheckoutDrawer.jsx`
  - Order success/fail screen: create if missing

## 4) 10-Day Execution Sprint

1. Day 1: Neon DB live + migrate schema
2. Day 2: Render API deploy + env vars + health check
3. Day 3: Vercel frontend deploy + connect API URL
4. Day 4: Cloudflare DNS + SSL + caching basics
5. Day 5: Sentry backend/frontend wired
6. Day 6: PostHog events for funnel
7. Day 7: Payment adapter skeleton + mock provider
8. Day 8: Flutterwave payment init endpoint
9. Day 9: Webhook verification + idempotency storage
10. Day 10: End-to-end payment test + reconciliation check

## 5) KPI Targets (MVP)

- API uptime: >= 99% (monthly)
- Checkout success rate: >= 85%
- Payment webhook duplicate safety: 100% idempotent
- Error detection time: < 15 min (Sentry alerts)
- Funnel visibility: browse -> cart -> checkout -> paid available in PostHog

## 6) Go/No-Go Checklist

- [ ] Web deploy stable (frontend + API + DB)
- [ ] Payment success/failure paths verified
- [ ] Webhook signatures verified
- [ ] Duplicate webhook events safely ignored
- [ ] Admin can view order/payment totals
- [ ] Sentry receives both FE and BE errors
- [ ] PostHog funnel shows real events
- [ ] Backup/restore documented

## 7) Weekly Review Rules

- Remove any tool not adding measurable value.
- If a service causes >1 day delay, replace it.
- Keep architecture provider-agnostic in service layer.
