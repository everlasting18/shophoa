# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Dev server (localhost:5173)
npm run build      # Type-check + Vite build → dist/
npm run preview    # Preview production build
npm run deploy:cf  # Build + deploy to Cloudflare Pages via wrangler
npx tsc --noEmit   # Type-check only (no test suite)
```

## Environment

```
VITE_POCKETBASE_URL=   # PocketBase instance URL (required)
VITE_SHOP_URL=         # Storefront URL for cache revalidation (optional, defaults to https://vuonhoatuoi.vn)
```

## Stack

- **Vite + React 19 + TypeScript** — standalone SPA, no SSR
- **TanStack Router v1** — file-based routing under `src/routes/`; route tree auto-generated to `src/routeTree.gen.ts` on build/dev
- **TanStack Query** — all data fetching; hooks live in `src/features/<feature>/api.ts`
- **Zustand 5 + persist** — auth state only, localStorage key `vht-admin-auth`
- **PocketBase 0.26.8** — singleton at `src/lib/pb.ts`; `pb.afterSend` handles global 401 → auto-logout
- **Tailwind v4** — via `@tailwindcss/vite` plugin, no config file; neutral palette is `stone-*` (not zinc)
- **CKEditor 5 (GPL)** — rich text in product form (`src/components/ui/rich-editor.tsx`); lazy-loaded via `React.lazy()` to keep main bundle small; upload adapter posts to PocketBase `media` collection

## Routing Architecture

```
src/routes/
  __root.tsx          # QueryClient context + ToastProvider + 404
  login.tsx           # Public login page
  _auth.tsx           # Auth guard (beforeLoad) + AdminLayout wrapper
  _auth/
    index.tsx         # Dashboard
    orders/
      index.tsx       # Orders list (validateSearch: { status })
      $id.tsx         # Order detail
    products/
      index.tsx       # Products table with search + active/inactive filter
      $id.tsx         # Product create/edit form with CKEditor
    categories.tsx    # Category tree with drag-drop reorder (owner only)
    banners.tsx       # Banner table with drag-drop reorder (owner only)
    settings.tsx      # Key-value settings from PocketBase (owner only)
```

**Auth guard** (`_auth.tsx`): reads Zustand token, redirects to `/login` if absent, restores `pb.authStore.save(token, null)` on every navigation (needed because `pb.authStore` is in-memory only).

**Owner-only guard**: `categories`, `banners`, `settings` each have a `beforeLoad` that checks `useAuthStore.getState().role !== "owner"` and redirects to `/`.

**Orders list URL**: uses `validateSearch` — all links to `/orders` must pass `search={{ status: "" }}` or a specific status value, otherwise TanStack Router throws a type error.

## Auth & Roles

Login tries `_superusers` first (→ `role: "owner"`), falls back to `users` collection (→ `role` from `users.role` field: `"owner"` | `"staff"`).

`useAuthStore` persists `{ token, adminEmail, role }`. Staff see only Dashboard, Orders, Products. The `ownerOnly: true` flag on `NavItem` controls sidebar and mobile bottom sheet visibility.

## Layout

`src/components/layout/admin-layout.tsx` renders inside `_auth.tsx`:

- **Desktop (lg+)**: fixed 240px sidebar; nav items filtered by `ownerOnly`
- **Mobile**: sticky top bar + fixed bottom nav (Dashboard, Đơn hàng, Sản phẩm) + "Thêm" button (owner only) opens bottom sheet for Danh mục, Banners, Cài đặt
- Pending orders badge on "Đơn hàng" tab via `usePendingCount` query (staleTime 30s)
- `useOrdersRealtime` subscribes to PocketBase `orders` on mount; invalidates queries + shows toast on new order

## Data Layer

- `src/lib/pb.ts` — PocketBase singleton, `autoCancellation(false)`, 401 handler
- `src/features/<feature>/api.ts` — TanStack Query hooks only
- `src/features/orders/realtime.ts` — wraps `pb.collection("orders").subscribe()`, cleans up on unmount
- `src/schema/pocketbase.ts` — TypeScript interfaces matching PocketBase collection schemas
- `src/lib/utils.ts` — `formatPrice`, `generateSlug`, `useDebounce` (300ms default), `cn`

**Query key conventions**: `["orders", filters]`, `["orders", id]`, `["orders", "pending-count"]`, `["products", page, search, activeFilter]`, `["dashboard"]`

**Pagination**: Orders and Products use 10 items/page. Categories and Banners use `getFullList` (needed for drag-drop reorder).

## Media & Config

- `PHOTO_BASE = "https://photo.fitchy.shop"` — CDN proxy for PocketBase files (`src/lib/config.ts`)
- `SHOP_URL` — storefront URL used to call `/api/revalidate` after mutations (`src/lib/config.ts`)
- `src/lib/media.ts` — `getThumbUrl(collectionId, recordId, filename)`, `getImageUrl(...)`
- CKEditor uploads: `pb.collection("media").create(formData)` → URL from `PHOTO_BASE/collectionId/recordId/file`

## Cache Revalidation

After each mutation (save/toggle/delete), `src/features/products/api.ts` and `src/features/categories/api.ts` fire-and-forget `POST ${SHOP_URL}/api/revalidate { path }` to purge the Cloudflare edge cache for affected paths. Products revalidate `/san-pham/{slug}`, `/san-pham`, and `/`. Categories revalidate `/{slug}` and `/`.

## Cloudflare Deployment

Static SPA deployed to Cloudflare Pages. `public/_redirects` (`/* /index.html 200`) handles client-side routing. Config: `wrangler.toml` (project `shophoa-admin`).

## Feature Notes

- **Product form**: thumbnail + up to 4 gallery images; `images-` FormData key removes existing PocketBase images. Slug is preserved on edit (only generated on create). `short_description` hard-capped at 150 chars.
- **Category drag-drop**: dragging to a different parent sets `sort_order = max(sibling sort_orders) + 1` to avoid conflicts
- **Settings page**: inputs use local state with server fallback (`values[id] ?? s.value`) — no form library
- **Dashboard revenue**: uses `getFullList` to sum all non-cancelled orders client-side — acceptable for small shop, will slow with scale
