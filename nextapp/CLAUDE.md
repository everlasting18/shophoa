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
```

No test suite is configured.

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
- **Zustand 5 + persist** — cart state only (`src/stores/cart-store.ts`), localStorage key `vuonhoatuoi-cart`
- **React Hook Form + Zod** — checkout form validation (`src/schema/checkout.ts`)
- **@base-ui/react** — low-level UI primitives (used alongside shadcn components)
- **Baloo 2** — Google Font, loaded via `next/font`, CSS variable `--font-baloo`

## Architecture Overview

This is the public-facing Vietnamese flower shop ("Tiệm hoa nhà tình"). The admin panel has been extracted to a separate Vite+React SPA. This app is shop-only.

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
    settings/route.ts           # Public site settings
    shipping-zones/route.ts     # Dynamic shipping zones from PocketBase (falls back to FALLBACK_ZONES)
    revalidate/route.ts         # ISR cache purge: POST { path }
    notify/order/route.ts       # Discord notification on new order — 3-retry + exponential backoff + rate limit
    verify-turnstile/route.ts   # Verify Cloudflare Turnstile token server-side
    alert-error/route.ts        # Forward client-side errors to DISCORD_ERROR_WEBHOOK_URL
```

The `(shop)` route group has no layout of its own — category pages inherit the root layout directly.

### Data Layer

- `src/services/pocketbase.ts` — singleton PocketBase client (shared across server and client components)
- `src/services/settings.ts`, `src/services/navigation.ts`, `src/services/seo.ts` — server-side services using React `cache()` for per-request deduplication; all fall back gracefully if PocketBase is unreachable
- `src/services/shipping.ts` — `getShippingZones()` (React `cache()`): fetches from PocketBase `shipping_zones`, always ensures a pickup zone (fee=0) exists by appending from `FALLBACK_ZONES` if missing
- `src/schema/` — `pocketbase.ts` (collection types), `checkout.ts` (Zod schema), `app.ts` (app-level types), `index.ts` (re-exports)
- `src/config/` — `constants.ts` (site name, contact, nav), `shipping.ts` (`FALLBACK_ZONES`, `buildDistrictMap(zones)`), `third-party.ts` (CDN, APIs); all exported from `src/config/index.ts`
- `src/lib/sanitize.ts` — `sanitizeHtml(html)` (strips scripts/iframes/event handlers for safe render) and `stripHtml(html)` (plain text for meta descriptions)
- Main PocketBase collections: `products`, `categories`, `banners`, `orders`, `settings`, `media`, `shipping_zones`

Server pages use `export const revalidate = 3600` for ISR. Purge via `POST /api/revalidate { path }`.

### Media URLs

`src/lib/media.ts` exports `getThumbUrl` and `getImageUrl`:
- **Dev**: raw `PHOTO_BASE/collectionId/recordId/filename`
- **Prod**: prefixed with Cloudflare Image Resizing (`/cdn-cgi/image/format=auto,width=N/...`)
- `getThumbUrl` falls back to a deterministic Unsplash flower placeholder when `thumbnail` is missing (hash of `recordId` selects from 10 URLs)

### Checkout Flow

`src/app/dat-hoa/page.tsx` is a single client component (no step routing). Flow:
1. Reads cart from Zustand
2. On mount: fetches shipping zones from `GET /api/shipping-zones` (dynamic from PocketBase, falls back to `FALLBACK_ZONES`). Zones are stored in state; `buildDistrictMap(zones)` derives a `Record<districtName, zoneIndex>` for auto-mapping.
3. User selects province → district → ward; district auto-maps to a shipping zone index. Pickup zone detected by `fee === 0`.
4. Form persisted to `sessionStorage` key `checkout-form` with 500ms debounce (survives accidental back-navigation)
5. **Turnstile verify** (if `NEXT_PUBLIC_TURNSTILE_SITE_KEY` set): `POST /api/verify-turnstile { token }` — blocks submit if bot detected; on PocketBase failure, fires `POST /api/alert-error` fire-and-forget
6. Creates `orders` record directly via PocketBase SDK, then fire-and-forgets `POST /api/notify/order`
7. Redirects to `/dat-hoa/cam-on?code=<orderCode>`

**Turnstile widget** (`@marsidev/react-turnstile`): placed in left column of checkout form, Managed mode, light theme. Token stored in `useRef` (not state) to avoid re-renders. Test keys: `1x00000000000000000000AA` (always pass), `2x00000000000000000000AB` (always fail).

Address fields: `recipientStreet` (free text) + province/district selects from `useProvinces` hook (fetches Vietnam HCSV API). The full address stored in PocketBase is assembled from these parts.

### ZaloFloat

`src/components/layout/zalo-float.tsx` — fixed floating buttons (phone + Zalo + optional Báo giá). The "Báo giá" button only renders when `contact.zaloGroup` is set (PocketBase `settings` key: `zalo_group`). Labels are always visible (not hover-only).

### Discord Notification & Error Alerts

`src/app/api/notify/order/route.ts`:
- Retries up to 3 times with exponential backoff (1s, 2s); respects Discord `Retry-After` header on 429
- On final failure: calls `notifyError()` to alert error channel, returns 502 (checkout unaffected)
- Embeds: one main embed (order info) + one per product with thumbnail

`src/lib/notify-error.ts` — shared utility, always fire-and-forget, never throws:
- Posts red embed to `DISCORD_ERROR_WEBHOOK_URL`; no-op if env var absent
- Used by: `notify/order` (all retries failed), `alert-error` route (client-side PocketBase errors)

### SEO

- `src/services/seo.ts` — JSON-LD helpers: `localBusinessSchema` (homepage), `productSchema`, `breadcrumbSchema`, `categoryItemListSchema`
- Homepage exports `metadata` with keywords + OG image + renders `localBusinessSchema` JSON-LD
- `/gio-hang` and `/dat-hoa` have `layout.tsx` files that set `robots: noindex`
- `src/app/sitemap.ts` — dynamic sitemap from PocketBase (single source of truth, no next-sitemap)
- `src/app/robots.ts` — App Router native robots.txt

### Cloudflare Deployment

Deployed via `@opennextjs/cloudflare` (OpenNext). The `deploy:cf` script: builds → copies assets → writes `_routes.json` (excludes static paths from Worker) → deploys with `wrangler pages deploy`. Config: `wrangler.toml`, `open-next.config.ts`.

- `incrementalCache: "dummy"` — no KV cache; relies on Cloudflare edge cache via `Cache-Control: s-maxage=3600`
- `public/_headers` — sets long-lived cache headers for `/_next/static/*` and `/images/*`
- `/api/revalidate` is called by the admin SPA after product/category saves to purge edge cache for specific paths

### Scripts

`scripts/` — one-off PocketBase migration/seeding scripts (`.mjs`), run with `node scripts/<name>.mjs`
