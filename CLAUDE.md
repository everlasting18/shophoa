# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev        # Start dev server (localhost:3000)
npm run build      # Build + generate sitemap (postbuild: next-sitemap)
npm run start      # Serve production build
npm run lint       # Run ESLint
```

No test suite is configured.

## Environment Variables

```
NEXT_PUBLIC_POCKETBASE_URL=   # PocketBase backend URL (required for all data fetching)
ZALO_OA_ACCESS_TOKEN=         # Zalo OA access token (server-only); expires ~90 days
ZALO_ADMIN_USER_ID=           # Zalo user_id of the shop owner (must follow the OA)
```

`ZALO_*` vars are optional. In development, if absent, `/api/notify/order` logs the message to terminal instead of calling Zalo. In production, the route returns 503 and checkout continues normally (fire-and-forget).

## Stack

- **Next.js 16** (App Router) + **React 19** — RSC for server pages, `"use client"` for interactive components
- **Tailwind v4** — configured via PostCSS (`postcss.config.mjs`), plugins declared with `@plugin` in `globals.css` (not `tailwind.config.ts`)
- **PocketBase 0.26.8** — BaaS; admin auth uses `pb.collection("_superusers").authWithPassword()` (not the deprecated `pb.admins` API)
- **CKEditor 5** (GPL) — rich text editor in admin, configured in `src/components/ui/rich-editor.tsx`
- **Zustand 5** — cart (`src/stores/cart-store.ts`) and admin auth (`src/stores/admin-store.ts`)
- **React Hook Form + Zod** — checkout form validation (`src/schema/checkout.ts`)

## Architecture Overview

This is a Vietnamese flower shop e-commerce site ("Vườn Hoa Tươi"). The app is primarily Vietnamese-language.

### Routing Layout

- `src/app/(shop)/[slug]/page.tsx` — Category pages; slug is looked up in PocketBase `categories`
- `src/app/san-pham/[slug]/page.tsx` — Product detail pages
- `src/app/tim-kiem/page.tsx` — Search page (`force-dynamic`, full-text regex filter)
- `src/app/gio-hang/page.tsx` — Cart page
- `src/app/dat-hoa/page.tsx` — Checkout (client component, multi-step, persists to `localStorage` key `checkout-form`)
- `src/app/dat-hoa/cam-on/page.tsx` — Order confirmation page
- `src/app/admin/` — Admin panel (protected by `vht_admin_token` httpOnly cookie)
- `src/app/api/` — Route handlers: `auth/admin/{login,logout}`, `upload`, `navigation`, `settings`, `revalidate`, `notify/order` (Zalo notification)

### Data Layer

- Singleton PocketBase client: `src/services/pocketbase.ts` — `autoCancellation(false)` is set
- Server-side services: `src/services/settings.ts`, `src/services/navigation.ts`, `src/services/seo.ts` — all use React `cache()` for request deduplication and fall back gracefully if PocketBase is unreachable
- Type definitions: `src/schema/` — `pocketbase.ts` (collection types), `app.ts` (app-level types), `checkout.ts` (Zod form schema)
- Config: `src/config/` (`constants.ts`, `shipping.ts`, `third-party.ts`) exported from `src/config/index.ts`
- Main PocketBase collections: `products`, `categories`, `banners`, `orders`, `settings`, `media`

Server pages use `export const revalidate = 3600` for ISR. Cache can be purged via `/api/revalidate`.

### Media URLs

`src/lib/media.ts` exports `getThumbUrl` and `getImageUrl`. In dev: raw PocketBase file URL. In prod: prefixed with `/cdn-cgi/image/format=auto,...` (Cloudflare Image Resizing).

File upload flow: browser → `/api/upload` route handler → PocketBase `media` collection → returns CDN URL.

### State Management

- **Cart** — Zustand + persist, localStorage key `vuonhoatuoi-cart`
- **Admin auth** — Zustand + persist, localStorage key `vht-admin-auth`. Login sets `httpOnly` cookie `vht_admin_token` used by API routes. Client-side `pb.authStore` is populated via `pb.authStore.save(token, null)` after login.

### Admin Panel

Fully client-side SPA under `/admin`. Auth guard in `src/app/admin/layout.tsx`. Products, categories, orders, banners, settings — all CRUD. Rich editor uses CKEditor 5 with custom upload adapter pointing to `/api/upload`.

### Custom Hooks

- `src/hooks/use-settings.ts` — reads site settings (phone, address, etc.) from PocketBase
- `src/hooks/use-provinces.ts` — fetches Vietnam provinces/districts for checkout address form

### UI Components

- `src/components/ui/` — shadcn/ui primitives + `toast.tsx` (Context-based, `ToastProvider` in root layout), `rich-editor.tsx` (CKEditor 5), `quantity-input.tsx`, `form-error.tsx`, `input-icon.tsx`
- `src/components/product/` — product card, grid, gallery, price display, add-to-cart button
- `src/components/checkout/` — decomposed checkout sub-forms
- `src/components/home/` — homepage sections (hero banner with Embla carousel, occasion tabs, product section)
- `cn()` utility: `src/lib/utils.ts`

### SEO

- `src/services/seo.ts` — JSON-LD structured data helpers (`localBusinessSchema`, `productSchema`, etc.)
- `src/app/sitemap.ts` — dynamic sitemap from PocketBase
- `next-sitemap.config.js` runs on postbuild

### Scripts

`scripts/` — one-off PocketBase migration/seeding scripts (`.mjs`), run with `node scripts/<name>.mjs`
