# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Admin panel (SPA) for **"Tiệm hoa nhà tình"** — a Vietnamese flower shop. Manages products, orders, categories, banners, settings, and check-in vouchers. Talks directly to PocketBase Cloud; no intermediate API layer.

## Commands

```bash
npm run dev          # Dev server (localhost:5173)
npm run build        # tsc -b + Vite build → dist/
npm run preview      # Preview production build
npm run lint         # ESLint
npm run deploy:cf    # Build + deploy to Cloudflare Pages (preview branch)
npm run deploy:prod  # Build + deploy to Cloudflare Pages (production branch)
npx tsc --noEmit     # Type-check only (no test suite)
```

## Environment

```
VITE_POCKETBASE_URL=   # PocketBase instance URL (required; see .env)
VITE_SHOP_URL=         # Storefront URL for cache revalidation (optional, defaults to https://tiemhoanhatinh.com)
```

## Stack

- **Vite + React 19 + TypeScript** — standalone SPA, no SSR
- **TanStack Router v1** — file-based routing under `src/routes/`; route tree auto-generated to `src/routeTree.gen.ts` on build/dev
- **TanStack Query v5** — all data fetching; hooks live in `src/features/<feature>/api.ts`
- **Zustand 5 + persist** — auth state only, localStorage key `vht-admin-auth`
- **PocketBase 0.26** — singleton at `src/lib/pb.ts`; `autoCancellation(false)`; `pb.afterSend` handles global 401 → auto-logout + redirect to `/login`
- **Tailwind v4** — via `@tailwindcss/vite` plugin, no config file; dark UI on `stone-*` neutrals with `rose-*` accent
- **TipTap v3** — rich text in product form (`src/components/ui/rich-editor.tsx`, lazy-loaded via `React.lazy`); StarterKit + Image + Placeholder; image upload posts to PocketBase `media` collection; uses `isInternalChange` ref to prevent update loops; `setContent(value, { emitUpdate: false })` for external value sync
- **jsQR** — client-side QR decoding for the voucher scanner (`src/components/QRReader.tsx`)

## Routing Architecture

```
src/routes/
  __root.tsx              # RouterContext { queryClient } + ToastProvider + 404 (NotFound) + DEV devtools
  login.tsx               # Public login page
  _auth.tsx               # Auth guard (beforeLoad) + AdminLayout wrapper
  _auth/
    index.tsx             # Dashboard
    orders/
      index.tsx           # Orders list (validateSearch: { status }); filters: status, search, date range
      $id.tsx             # Order detail + status update
    products/
      index.tsx           # Products table: search + active/inactive filter (+ category filter)
      $id.tsx             # Product create/edit form with TipTap rich editor
    categories.tsx        # Category tree with drag-drop reorder (owner only)
    banners.tsx           # Banner table with drag-drop reorder (owner only)
    settings.tsx          # Key-value settings from PocketBase (owner only)
    checkin-vouchers.tsx  # Check-in voucher list/filter/redeem
    qr-scanner.tsx        # Camera QR scanner to look up + redeem a voucher
```

**Auth guard** (`_auth.tsx`): reads Zustand token, redirects to `/login` if absent, restores `pb.authStore.save(token, null)` on every navigation (needed because `pb.authStore` is in-memory only), and redirects to `/login` if the restored token is no longer `isValid`.

**Owner-only guard**: `categories`, `banners`, `settings` each have a `beforeLoad` that checks `useAuthStore.getState().role !== "owner"` and redirects to `/`. `checkin-vouchers` and `qr-scanner` are visible to all roles.

**Orders list URL**: uses `validateSearch` — all links to `/orders` must pass `search={{ status: "" }}` or a specific status value, otherwise TanStack Router throws a type error.

## Auth & Roles

Login tries `_superusers` first (→ `role: "owner"`), falls back to `users` collection (→ `role` from `users.role` field: `"owner"` | `"staff"`).

`useAuthStore` persists `{ token, adminEmail, role, isLoggedIn }`. Staff see Dashboard, Orders, Products, plus the voucher tools. The `ownerOnly: true` flag on `NavItem` controls sidebar and mobile bottom-sheet visibility for Categories, Banners, Settings.

## Layout

`src/components/layout/admin-layout.tsx` renders inside `_auth.tsx`:

- **Desktop (lg+)**: fixed 240px (`w-60`) sidebar; nav items filtered by `ownerOnly`
- **Mobile**: sticky top bar (with back button on nested order/product routes) + fixed bottom nav (Dashboard, Đơn hàng, Sản phẩm). The 4th "Thêm" button opens a bottom sheet for the remaining items, shown to **all roles**; the sheet is `ownerOnly`-filtered so staff see Voucher Check-in + Quét QR (+ Logout), owners additionally see Danh mục, Banners, Cài đặt. Logout lives inside the sheet for everyone.
- Pending orders badge on "Đơn hàng" via `usePendingCount` query (`getList` filter `status="pending"`, staleTime 30s)
- `useOrdersRealtime` subscribes to PocketBase `orders` on mount; shows a toast on new order

## Data Layer

- `src/lib/pb.ts` — PocketBase singleton, `autoCancellation(false)`, 401 handler (re-exports `ClientResponseError`)
- `src/features/<feature>/api.ts` — TanStack Query hooks only
- `src/features/orders/realtime.ts` — wraps `pb.collection("orders").subscribe()`, cleans up on unmount
- `src/schema/pocketbase.ts` — TS interfaces for collections: `Category`, `Product`, `Order`/`OrderItem`, `Banner`, `Settings`, `CheckinVoucher`
- `src/lib/utils.ts` — `cn`, `formatPrice` (VND `Intl.NumberFormat`), `generateSlug` (Vietnamese diacritics-stripping), `useDebounce` (300ms default)

> `src/features/shipping/` and `src/features/staff/` directories exist but are currently empty (planned, not implemented).

**Query key conventions**: `["orders", filters]`, `["orders", id]`, `["orders", "pending-count"]`, `["products", page, search, activeFilter, categoryFilter]`, `["products", id]`, `["products", "category-counts"]`, `["categories"]`, `["banners"]`, `["settings"]`, `["checkin-vouchers", status, search]`, `["dashboard"]`

**Pagination**: Orders and Products use 10 items/page. Categories, Banners, Settings use `getFullList` (reorder / small lists). Check-in vouchers use 20 items/page (`PER_PAGE`), sorted `-created`.

## Media & Config

- `src/lib/config.ts` — `PHOTO_BASE = "https://photo.tiemhoanhatinh.com"` (CDN proxy for PocketBase files), `SHOP_URL` (storefront, defaults to `https://tiemhoanhatinh.com`), `zaloLink(phone)`
- `src/lib/media.ts` — `getThumbUrl(collectionId, recordId, thumbnail)`, `getImageUrl(collectionId, recordId, filename)` → `${PHOTO_BASE}/{collectionId}/{recordId}/{file}`
- TipTap image uploads: `pb.collection("media").create(formData)` → URL from `PHOTO_BASE/collectionId/recordId/file`; triggered via hidden `<input type="file">` in the toolbar

## Cache Revalidation

After mutations, feature hooks fire-and-forget `POST ${SHOP_URL}/api/revalidate { path }` to purge the Cloudflare edge cache:

- **Products** (`products/api.ts`) → `/san-pham/{slug}`, `/san-pham`, `/`
- **Categories** (`categories/api.ts`) → `/{slug}` and `/`
- **Banners** (`banners/api.ts`) and **Settings** (`settings/api.ts`) → `/`

(Reorder mutations skip revalidation.)

## Cloudflare Deployment

Static SPA deployed to Cloudflare Pages at **https://admin.tiemhoanhatinh.com**. `public/_redirects` (`/* /index.html 200`) handles client-side routing. Config: `wrangler.toml` (project `shophoa-admin`).

## Feature Notes

- **Product form** (`products/$id.tsx`): thumbnail + up to 4 gallery images; appending filenames under the `images-` FormData key removes existing PocketBase images. Slug is generated only on create (`generateSlug`); on edit the existing slug is preserved. `short_description` hard-capped at 150 chars. Validates: name required, price > 0, sale_price < price. Categories rendered as a parent→child tag tree; occasions from a fixed `OCCASIONS` list.
- **Category drag-drop**: `useReorderCategories` batch-updates `sort_order` (and `parent` when moved across parents).
- **Banners**: support a separate `mobile_image`; `mobile_image-` FormData key removes it. Edit modal can replace the main desktop `image` and the `mobile_image` (add/replace/remove) plus the link. `useReorderBanners` batch-updates `sort_order`.
- **Settings page**: inputs use local state with server fallback (`values[id] ?? s.value`) — no form library.
- **Check-in vouchers**: `checkin_vouchers` collection (`user_name`, `user_phone`, `screenshot`, `qr_token`, `status: pending|redeemed`, `redeemed_at`, `redeemed_by`). Redeem sets `status`, `redeemed_at`, `redeemed_by = adminEmail`. List is sorted `-created`, paginated 20/page, with a mobile-card / desktop-table split; dialog shows the check-in screenshot with a download link.
- **QR scanner** (`qr-scanner.tsx` + `QRReader.tsx`): state machine `idle → scanning → loading → found | not_found | error`. `QRReader` opens the rear camera (`facingMode: "environment"`), scans a canvas frame through jsQR every 200ms, guards against duplicate detection with `detectedRef`, and stops all tracks on unmount/inactive. On detect, looks up `qr_token` via `getFirstListItem`, then redeems.
- **Dashboard revenue**: uses `getFullList` to sum non-cancelled orders client-side — acceptable for a small shop, will slow with scale.

## Known Gaps / Caveats

- PocketBase `filter` strings are built by manual string concatenation. Search inputs escape quotes, but the QR scanner interpolates the scanned `qr_token` into `qr_token='${code}'` without escaping.
- No test suite — verify changes with `npx tsc --noEmit` and `npm run build`.
