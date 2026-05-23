# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev        # Start dev server (localhost:3000)
npm run build      # Build (Turbopack)
npm run start      # Serve production build
npm run lint       # Run ESLint
npm run build:cf   # Build for Cloudflare Pages (OpenNext)
npm run deploy:cf  # Build + deploy to Cloudflare Pages via wrangler
npm run preview:cf # Build + preview Cloudflare Pages locally
npx tsc --noEmit   # Type-check only (no test suite)
```

## Environment Variables

```
NEXT_PUBLIC_POCKETBASE_URL=      # PocketBase backend URL (required)
DISCORD_WEBHOOK_URL=             # Discord webhook for order notifications (optional)
DISCORD_ERROR_WEBHOOK_URL=       # Discord webhook for system error alerts (optional)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=  # Cloudflare Turnstile site key (optional, dev: 1x00000000000000000000AA)
TURNSTILE_SECRET_KEY=            # Cloudflare Turnstile secret key (optional, dev: 1x0000000000000000000000000000000AA)
```

- `DISCORD_WEBHOOK_URL` absent → dev logs to terminal, prod returns 503, checkout unaffected (fire-and-forget)
- `DISCORD_ERROR_WEBHOOK_URL` absent → `notifyError()` is a no-op, no alerts sent
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` absent → Turnstile widget not rendered, verify step skipped entirely

## Stack

- **Next.js 16** (App Router) + **React 19** — RSC for server pages, `"use client"` for interactive components
- **Tailwind v4** — configured via PostCSS (`postcss.config.mjs`); plugins declared with `@plugin` in `globals.css` (not `tailwind.config.ts`)
- **PocketBase 0.26.8** — BaaS; singleton client at `src/services/pocketbase.ts`, `autoCancellation(false)`
- **Zustand 5 + persist** — cart state only (`src/stores/cart-store.ts`), localStorage key `tiemhoanhatinh-cart`
- **React Hook Form + Zod** — checkout form validation (`src/schema/checkout.ts`)
- **@base-ui/react** — low-level UI primitives (used alongside shadcn components)
- **Merriweather** — Google Font, loaded via `next/font`, CSS variable `--font-merriweather`

## Architecture Overview

Public-facing Vietnamese flower shop ("Tiệm hoa nhà tình") at `tiemhoanhatinh.com`. Admin panel is a separate Vite+React SPA. This app is shop-only.

### Routing

```
src/app/
  layout.tsx                    # Root layout: Header, Footer, ZaloFloat, ToastProvider
  page.tsx                      # Homepage
  (shop)/[slug]/page.tsx        # Category pages — slug looked up in PocketBase `categories`
  san-pham/[slug]/page.tsx      # Product detail
  san-pham/page.tsx             # All products listing
  tim-kiem/page.tsx             # Search (force-dynamic, regex filter on PB)
  gio-hang/page.tsx             # Cart
  dat-hoa/page.tsx              # Checkout (client component)
  dat-hoa/cam-on/page.tsx       # Order confirmation
  api/
    navigation/route.ts         # Navigation tree from PocketBase categories
    settings/route.ts           # Public site settings (contact, hours, etc.)
    shipping-zones/route.ts     # Dynamic shipping zones from PocketBase (falls back to FALLBACK_ZONES)
    revalidate/route.ts         # ISR cache purge: POST { path } or { paths: [] } — always revalidates /sitemap.xml
    notify/order/route.ts       # Discord notification on new order — 3-retry + exponential backoff + rate limit
    verify-turnstile/route.ts   # Verify Cloudflare Turnstile token server-side
    alert-error/route.ts        # Forward client-side errors to DISCORD_ERROR_WEBHOOK_URL
```

The `(shop)` route group has no layout of its own — category pages inherit the root layout directly.

### Data Layer

- `src/services/pocketbase.ts` — singleton PocketBase client (shared across server and client components)
- `src/services/settings.ts` — `getSiteSettings()` (React `cache()`): fetches contact/hours from PocketBase `settings` collection, falls back to `CONTACT` from config. Used by Footer (server) and fetched client-side by Header via `/api/settings`.
- `src/services/navigation.ts`, `src/services/seo.ts` — server-side services using React `cache()`
- `src/services/shipping.ts` — `getShippingZones()` (React `cache()`): always ensures a pickup zone (fee=0) exists
- `src/schema/` — `pocketbase.ts` (collection types), `checkout.ts` (Zod schema), `app.ts` (app-level types), `index.ts` (re-exports)
- `src/config/` — `constants.ts` (SITE_NAME, CONTACT, NAV_ITEMS), `third-party.ts` (SITE_URL, PHOTO_BASE, ZALO_PHONE, SOCIAL); all exported from `src/config/index.ts`
- Main PocketBase collections: `products`, `categories`, `banners`, `orders`, `settings`, `media`, `shipping_zones`

Server pages use `export const revalidate = 3600` for ISR. Purge via `POST /api/revalidate { path }` or `{ paths: [] }`.

### Config Constants

- `SITE_URL` = `https://tiemhoanhatinh.com`
- `PHOTO_BASE` = `https://photo.tiemhoanhatinh.com` (Cloudflare R2 proxy for PocketBase files)
- `SITE_NAME` = `"Tiệm hoa nhà tình"`

### Media URLs

`src/lib/media.ts` exports `getThumbUrl` and `getImageUrl`:
- **Dev**: raw `PHOTO_BASE/collectionId/recordId/filename`
- **Prod**: prefixed with Cloudflare Image Resizing (`/cdn-cgi/image/format=auto,width=N/...`)
- `getThumbUrl` falls back to a deterministic Unsplash flower placeholder when `thumbnail` is missing

### Checkout Flow

`src/app/dat-hoa/page.tsx` is a single client component (no step routing). Flow:
1. Reads cart from Zustand
2. On mount: fetches shipping zones from `GET /api/shipping-zones`. `buildDistrictMap(zones)` derives a `Record<districtName, zoneIndex>` for auto-mapping district → shipping fee.
3. Form persisted to `sessionStorage` key `checkout-form` with 500ms debounce
4. **Turnstile verify** (if `NEXT_PUBLIC_TURNSTILE_SITE_KEY` set): `POST /api/verify-turnstile { token }` — blocks submit if bot detected
5. Creates `orders` record directly via PocketBase SDK, then fire-and-forgets `POST /api/notify/order`
6. Redirects to `/dat-hoa/cam-on?code=<orderCode>`

**Turnstile widget**: Token stored in `useRef` (not state) to avoid re-renders. Test keys: `1x00000000000000000000AA` (always pass), `2x00000000000000000000AB` (always fail).

### Header Contact Sync

Header is a client component that fetches contact info from `/api/settings` on mount (same source as Footer). Initial render uses static `CONTACT` from config as fallback — no flash of wrong data.

### ZaloFloat

`src/components/layout/zalo-float.tsx` — fixed floating buttons (phone + Zalo + optional Báo giá). The "Báo giá" button only renders when `contact.zaloGroup` is set (PocketBase `settings` key: `zalo_group`, stored as full Zalo URL). On product detail pages (`/san-pham/.*`), buttons shift up to avoid overlapping the sticky add-to-cart bar.

### Discord Notification & Error Alerts

`src/app/api/notify/order/route.ts`:
- Retries up to 3 times with exponential backoff (1s, 2s); respects Discord `Retry-After` header on 429
- On final failure: calls `notifyError()`, returns 502 (checkout unaffected — fire-and-forget)

`src/lib/notify-error.ts` — always fire-and-forget, never throws. No-op if `DISCORD_ERROR_WEBHOOK_URL` absent.

### SEO

- `src/services/seo.ts` — JSON-LD helpers: `websiteSchema` (with SearchAction), `localBusinessSchema`, `productSchema`, `breadcrumbSchema`, `categoryItemListSchema`
- `layout.tsx` sets `title.template = "%s | Tiệm hoa nhà tình"`. Product and category `generateMetadata` use `title: { absolute: "..." }` to bypass the template (prevents site name appearing twice).
- `src/app/sitemap.ts` — dynamic from PocketBase, `revalidate = 3600`. `/api/revalidate` always purges `/sitemap.xml` alongside any other path.
- `src/app/robots.ts` — disallows `/dat-hoa`, `/gio-hang`, `/my-account`
- `/gio-hang` and `/dat-hoa` have `layout.tsx` files that set `robots: noindex`

### Cloudflare Deployment

Deployed via `@opennextjs/cloudflare` (OpenNext). The `deploy:cf` script: builds → copies assets → writes `_routes.json` (excludes static/image paths from Worker) → deploys with `wrangler pages deploy`.

- `incrementalCache: "dummy"` — no KV cache; relies on Cloudflare edge cache via `Cache-Control: s-maxage=3600`
- `public/_headers` — long-lived cache headers for `/_next/static/*`, `/images/*`, `/favicon.ico`
- `/api/revalidate` accepts `{ path }` (single) or `{ paths }` (array); always also revalidates `/sitemap.xml`

### Scripts

`scripts/` — one-off PocketBase migration/seeding scripts (`.mjs`), run with `node scripts/<name>.mjs`
