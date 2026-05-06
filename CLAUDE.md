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
```

## Architecture Overview

This is a Vietnamese flower shop e-commerce site ("Vườn Hoa Tươi") built on **Next.js 16** with **PocketBase** as the backend/database. The app is primarily Vietnamese-language.

### Routing Layout

- `src/app/(shop)/[slug]/page.tsx` — Dynamic category pages. Every category URL (`/hoa-sinh-nhat`, `/bo-hoa-tuoi`, etc.) routes here; the slug is looked up in PocketBase `categories` collection.
- `src/app/san-pham/[slug]/page.tsx` — Individual product detail pages.
- `src/app/gio-hang/page.tsx` — Cart page.
- `src/app/dat-hoa/page.tsx` — Checkout page (client component, multi-step form).
- `src/app/dat-hoa/cam-on/page.tsx` — Order confirmation page.
- `src/app/admin/` — Admin panel (protected by `useAdminStore` + cookie `vht_admin_token`).
- `src/app/api/` — Route handlers: admin auth (login/logout), navigation, settings, and file upload.

### Data Layer

All data fetching goes through the singleton PocketBase client at `src/lib/pocketbase.ts` (`NEXT_PUBLIC_POCKETBASE_URL`). Server components call it directly. The main collections are: `products`, `categories`, `banners`, `orders`, `settings`.

**Key patterns:**
- Server pages set `export const revalidate = 3600` for ISR.
- `src/lib/settings.ts` — `getSiteSettings()` fetches the `settings` collection (key/value pairs) and falls back to hardcoded constants if PocketBase is unreachable.
- `src/lib/navigation.ts` — `getNavItems()` builds the nav tree from `categories`; falls back to the static list in `src/lib/constants.ts`.
- Both use React `cache()` for request deduplication.

### Media URLs

`src/lib/media.ts` exports `getThumbUrl` and `getImageUrl`. In production these are prefixed with `/cdn-cgi/image/format=auto,...` (Cloudflare Image Resizing). In dev the raw PocketBase file URL is used.

### State Management

- **Cart** — `src/stores/cart-store.ts` (Zustand + `persist`, localStorage key `vuonhoatuoi-cart`).
- **Admin auth** — `src/stores/admin-store.ts` (Zustand + `persist`, localStorage key `vht-admin-auth`). Login also sets an `httpOnly` cookie (`vht_admin_token`) via the `/api/auth/admin/login` route handler. The admin layout uses `useSyncExternalStore` to detect hydration and redirects unauthenticated users client-side.

### Checkout Flow

`src/app/dat-hoa/page.tsx` is a client component using `react-hook-form` + Zod (`src/lib/checkout-schema.ts`). On submit it creates a record in the PocketBase `orders` collection directly from the browser. Shipping zones are defined in `src/lib/shipping-config.ts`; district-to-zone mapping happens in the checkout page. Form state is saved to `localStorage` (`checkout-form`) so it survives navigation.

### Admin Panel

`/admin` is a fully client-side SPA panel. Auth guard lives in `src/app/admin/layout.tsx`. Product images are uploaded via `/api/upload` (route handler) which creates a temporary product record in PocketBase to host the file, then returns the URL.

### UI Components

- `src/components/ui/` — shadcn/ui primitives plus custom additions (`toast.tsx`, `rich-editor.tsx` using Tiptap, `quantity-input.tsx`).
- `src/components/product/` — product card, grid, gallery, price display, add-to-cart button.
- `src/components/checkout/` — decomposed checkout sub-forms.
- `src/components/home/` — homepage sections (hero banner with Embla carousel, occasion tabs, product section).
- `cn()` utility in `src/lib/utils.ts` for conditional Tailwind classes.

### SEO

- `src/lib/seo.ts` — structured data helpers (JSON-LD): `localBusinessSchema`, `organizationSchema`, `breadcrumbSchema`, `productSchema`, `categoryItemListSchema`.
- `src/app/sitemap.ts` — dynamic sitemap fed from PocketBase.
- `next-sitemap.config.js` + `postbuild` script generates `public/sitemap-0.xml`.

### Scripts

`scripts/` contains one-off PocketBase migration/seeding scripts (`.mjs`), run with `node scripts/<name>.mjs`.
