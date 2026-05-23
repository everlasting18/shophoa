# Tiệm Hoa Nhà Tình — Storefront

Website bán hoa tươi online tại TPHCM. Xây dựng bằng **Next.js 16 App Router + PocketBase**, deploy lên **Cloudflare Pages** qua OpenNext.

---

## Mục lục

- [Yêu cầu](#yêu-cầu)
- [Cài đặt & Chạy local](#cài-đặt--chạy-local)
- [Biến môi trường](#biến-môi-trường)
- [Lệnh thường dùng](#lệnh-thường-dùng)
- [Stack & Dependencies](#stack--dependencies)
- [Kiến trúc & Routing](#kiến-trúc--routing)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [PocketBase Collections](#pocketbase-collections)
- [Luồng Checkout](#luồng-checkout)
- [Phí Giao Hàng](#phí-giao-hàng)
- [Thông Báo Đơn Hàng](#thông-báo-đơn-hàng)
- [Chống Spam — Cloudflare Turnstile](#chống-spam--cloudflare-turnstile)
- [Media & Ảnh](#media--ảnh)
- [SEO](#seo)
- [Cache & Revalidation](#cache--revalidation)
- [Giám Sát Lỗi](#giám-sát-lỗi)
- [Tuỳ chỉnh](#tuỳ-chỉnh)
- [Deploy lên Cloudflare Pages](#deploy-lên-cloudflare-pages)

---

## Yêu cầu

- **Node.js ≥ 18**
- **PocketBase** instance đang chạy (xem phần Collections để biết schema cần thiết)
- **Tài khoản Cloudflare** (để deploy production)
- **wrangler CLI** (cài qua `npm i -g wrangler` hoặc dùng `npx`)

---

## Cài đặt & Chạy local

```bash
# 1. Cài dependencies
npm install

# 2. Tạo file env (xem mục Biến môi trường bên dưới)
cp .env.example .env.local   # hoặc tạo mới

# 3. Chạy dev server
npm run dev
# → http://localhost:3000
```

---

## Biến môi trường

Tạo file `.env.local` ở thư mục gốc:

```env
# ─── BẮT BUỘC ────────────────────────────────────────────────────────────────
NEXT_PUBLIC_POCKETBASE_URL=https://your-pocketbase-url.com

# ─── CHỐNG SPAM (Cloudflare Turnstile) ───────────────────────────────────────
# Bỏ trống → widget không render, bước verify bị skip, checkout vẫn hoạt động
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA   # Test key: luôn pass
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA  # Test key tương ứng

# ─── THÔNG BÁO ĐƠN HÀNG (tuỳ chọn) ──────────────────────────────────────────
# Discord
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
DISCORD_ERROR_WEBHOOK_URL=https://discord.com/api/webhooks/...   # Webhook lỗi hệ thống

# Lark (Feishu)
LARK_WEBHOOK_URL=https://open.larksuite.com/open-apis/bot/v2/hook/...
LARK_APP_ID=cli_xxx          # Cần để gửi ảnh sản phẩm trong card
LARK_APP_SECRET=xxx          # Cần để gửi ảnh sản phẩm trong card
```

**Ghi chú:**
- Có thể dùng Discord, Lark, hoặc cả hai song song
- Thiếu tất cả webhook → dev log ra terminal, production trả 503 nhưng **checkout vẫn hoàn tất** (notify là fire-and-forget)
- Thiếu `LARK_APP_ID`/`LARK_APP_SECRET` → vẫn gửi tin nhắn Lark được nhưng không có ảnh sản phẩm

---

## Lệnh thường dùng

```bash
npm run dev          # Dev server tại localhost:3000
npm run build        # Production build (Next.js)
npm run start        # Chạy bản build production local
npm run lint         # ESLint (Next.js config)
npm run build:cf     # Build cho Cloudflare Pages (OpenNext)
npm run deploy:cf    # Build + deploy lên Cloudflare Pages
npm run preview:cf   # Build + preview Cloudflare runtime local
```

---

## Stack & Dependencies

| Lớp | Công nghệ | Version |
|---|---|---|
| Framework | Next.js App Router (SSR/ISR) | 16.2.6 |
| UI | React | 19 |
| Styling | Tailwind CSS v4 + shadcn/ui + @base-ui/react | — |
| Backend / DB | PocketBase | 0.26.8 |
| State | Zustand (cart, persist localStorage) | 5 |
| Form | React Hook Form + Zod | — |
| Carousel | Embla Carousel | 8 |
| Image CDN | Cloudflare Image Resizing | — |
| Font | Baloo 2 (Google Fonts, Vietnamese subset) | — |
| Deploy | Cloudflare Pages via OpenNext | — |
| Bot protection | Cloudflare Turnstile | — |

---

## Kiến trúc & Routing

### Pages

```
/                          Trang chủ (ISR 3600s)
                           → Banner hero, vòng tròn danh mục, best sellers, sections theo danh mục
/[slug]                    Trang danh mục (ISR 3600s)
                           → Lọc giá, phân trang 24 SP/trang, sắp xếp, breadcrumb, schema ItemList
/san-pham                  Tất cả sản phẩm (ISR 3600s) — lọc danh mục + giá
/san-pham/[slug]           Chi tiết sản phẩm (ISR 3600s) — gallery, thêm giỏ hàng, schema Product
/tim-kiem                  Tìm kiếm (force-dynamic, SSR) — tìm tên + lọc giá
/gio-hang                  Giỏ hàng (CSR, noindex)
/dat-hoa                   Checkout (CSR, noindex) — địa chỉ, chọn giờ, phí ship, Turnstile
/dat-hoa/cam-on            Xác nhận đơn hàng
/gioi-thieu                Giới thiệu
/lien-he                   Liên hệ
/chinh-sach-bao-mat        Chính sách bảo mật
```

### API Routes

```
GET  /api/navigation        Navigation tree từ PocketBase categories (cached)
GET  /api/settings          Cài đặt công khai (phone, địa chỉ, Zalo, giờ mở cửa)
GET  /api/shipping-zones    Danh sách zone + phí ship động từ PocketBase
POST /api/revalidate        Purge ISR cache theo path (gọi từ admin SPA)
POST /api/notify/order      Gửi thông báo Discord + Lark khi có đơn mới
POST /api/verify-turnstile  Verify Cloudflare Turnstile token
POST /api/alert-error       Forward lỗi client-side về Discord error channel
```

### Rendering strategy

| Trang | Strategy | Lý do |
|---|---|---|
| Trang chủ, danh mục, chi tiết SP | ISR (`revalidate = 3600`) | SEO + performance |
| Tìm kiếm | `force-dynamic` (SSR) | Query params dynamic |
| Giỏ hàng, Checkout | CSR | Zustand, không cần SEO |
| API routes | Edge (Cloudflare Workers) | — |

---

## Cấu trúc thư mục

```
src/
├── app/
│   ├── layout.tsx                  # Root layout: Header, Footer, ZaloFloat, ToastProvider
│   ├── page.tsx                    # Trang chủ
│   ├── sitemap.ts                  # Dynamic sitemap từ PocketBase
│   ├── robots.ts                   # robots.txt
│   ├── globals.css                 # Tailwind v4, CSS variables (màu, font, spacing)
│   ├── (shop)/
│   │   └── [slug]/page.tsx         # Trang danh mục (route group, kế thừa root layout)
│   ├── san-pham/
│   │   ├── page.tsx                # Tất cả sản phẩm
│   │   └── [slug]/page.tsx         # Chi tiết sản phẩm
│   ├── tim-kiem/page.tsx           # Tìm kiếm
│   ├── gio-hang/
│   │   ├── layout.tsx              # noindex
│   │   └── page.tsx
│   ├── dat-hoa/
│   │   ├── layout.tsx              # noindex
│   │   ├── page.tsx                # Checkout (client component)
│   │   └── cam-on/page.tsx         # Xác nhận đơn
│   ├── gioi-thieu/page.tsx
│   ├── lien-he/page.tsx
│   ├── chinh-sach-bao-mat/page.tsx
│   └── api/
│       ├── navigation/route.ts
│       ├── settings/route.ts
│       ├── shipping-zones/route.ts
│       ├── revalidate/route.ts
│       ├── notify/order/route.ts
│       ├── verify-turnstile/route.ts
│       └── alert-error/route.ts
│
├── components/
│   ├── home/
│   │   ├── hero-banner.tsx         # Carousel banner + SearchOverlay (chọn danh mục + giá)
│   │   ├── category-circles.tsx    # Vòng tròn danh mục nhanh
│   │   └── product-section.tsx     # Section sản phẩm có title + "Xem thêm"
│   ├── product/
│   │   ├── product-card.tsx        # Card sản phẩm (ảnh, tên, giá, badge)
│   │   ├── product-grid.tsx        # Grid sản phẩm responsive
│   │   ├── product-gallery.tsx     # Gallery ảnh chi tiết SP (lightbox)
│   │   ├── price-display.tsx       # Hiển thị giá + giá gốc (nếu có sale)
│   │   └── add-to-cart-button.tsx  # Nút thêm vào giỏ hàng
│   ├── category/
│   │   ├── filter-sidebar.tsx      # Sidebar lọc giá + danh mục (mode: auto/sidebar/mobile)
│   │   ├── sort-select.tsx         # Dropdown sắp xếp (mới nhất, giá tăng/giảm)
│   │   └── pagination.tsx          # Phân trang
│   ├── checkout/                   # Các phần của form checkout
│   ├── layout/
│   │   ├── header.tsx              # Header: logo, nav, search, giỏ hàng
│   │   ├── footer.tsx              # Footer: thông tin liên hệ, links
│   │   ├── search-dialog.tsx       # Ô tìm kiếm full-screen
│   │   └── zalo-float.tsx          # Nút nổi: Phone + Zalo + Báo giá (nếu có zaloGroup)
│   └── ui/                         # shadcn/ui: Button, Badge, Toast, Dialog, Skeleton, Carousel...
│
├── services/
│   ├── pocketbase.ts               # PocketBase singleton, autoCancellation(false)
│   ├── navigation.ts               # getNavigation() — React cache(), fallback NAV_ITEMS
│   ├── settings.ts                 # getSiteSettings() — React cache(), merge PB + defaults
│   ├── shipping.ts                 # getShippingZones() — React cache(), fallback FALLBACK_ZONES
│   └── seo.ts                      # JSON-LD builders: LocalBusiness, Product, Breadcrumb, ItemList
│
├── stores/
│   └── cart-store.ts               # Zustand cart (persist key: vuonhoatuoi-cart)
│
├── config/
│   ├── constants.ts                # SITE_NAME, SITE_URL, CONTACT, NAV_ITEMS
│   ├── shipping.ts                 # FALLBACK_ZONES, buildDistrictMap(zones)
│   └── third-party.ts             # PB_URL, PHOTO_BASE, SITE_URL, SOCIAL
│
├── hooks/
│   ├── use-provinces.ts            # Tỉnh/huyện/xã từ Vietnam Provinces API
│   └── use-settings.ts            # Fetch /api/settings từ client component
│
├── lib/
│   ├── media.ts                    # getThumbUrl(), getImageUrl() — dev/prod aware
│   ├── utils.ts                    # formatPrice(), cn()
│   ├── date-utils.ts               # todayISO(), isoToDisplay(), shortDateISO()
│   ├── notify-error.ts             # Alert Discord error channel (fire-and-forget)
│   └── sanitize.ts                 # sanitizeHtml() (strip scripts), stripHtml() (plain text)
│
└── schema/
    ├── pocketbase.ts               # TypeScript interfaces: Product, Category, Order, Banner, Settings...
    ├── checkout.ts                 # Zod schema checkout form
    └── app.ts                      # App-level types: CartItem, CartStore, SiteContact, NavItem...
```

---

## PocketBase Collections

### `products`
| Field | Type | Ghi chú |
|---|---|---|
| `name` | text | Tên sản phẩm |
| `slug` | text | URL-friendly, unique |
| `price` | number | Giá bán (VNĐ) |
| `sale_price` | number | Giá gốc (để gạch ngang), 0 = không sale |
| `thumbnail` | file | Ảnh đại diện |
| `images` | file[] | Gallery ảnh |
| `short_description` | text | Mô tả ngắn (dùng cho meta + card) |
| `description` | richtext (HTML) | Mô tả đầy đủ (CKEditor) |
| `occasions` | text[] | Dịp tặng (xem danh sách bên dưới) |
| `categories` | relation[] | Liên kết categories |
| `is_active` | bool | Hiển thị trên shop |
| `is_featured` | bool | Nổi bật |
| `is_best_seller` | bool | Bán chạy nhất |

**Occasions hợp lệ:**
```
Sinh nhật, Khai trương, Tốt nghiệp, Tình yêu, Chia buồn,
Sự kiện, Chúc mừng, Valentine, 8/3, 20/10, 20/11
```

### `categories`
| Field | Type | Ghi chú |
|---|---|---|
| `name` | text | Tên danh mục |
| `slug` | text | URL slug (VD: `hoa-sinh-nhat`) |
| `parent` | relation | Danh mục cha (self-relation, để trống = root) |
| `image` | file | Ảnh đại diện |
| `description` | text | Mô tả SEO |
| `sort_order` | number | Thứ tự hiển thị |
| `is_active` | bool | — |

### `orders`
| Field | Type | Ghi chú |
|---|---|---|
| `order_code` | text | VD: `ORD-20240519-1234` |
| `customer_name` | text | Người đặt |
| `customer_phone` | text | — |
| `recipient_name` | text | Người nhận |
| `recipient_phone` | text | — |
| `recipient_address` | text | Địa chỉ đầy đủ |
| `delivery_date` | text | ISO date |
| `delivery_time` | text | VD: `08:00–12:00` |
| `items` | json | `[{ name, price, quantity, thumbnail }]` |
| `subtotal` | number | Tổng tiền hàng |
| `shipping_fee` | number | Phí ship |
| `total` | number | Tổng thanh toán |
| `note` | text | Ghi chú đơn hàng |
| `card_message` | text | Nội dung thiệp |
| `status` | select | `pending` / `confirmed` / `cancelled` |
| `payment_method` | select | `cod` / `bank_transfer` |

### `banners`
| Field | Type |
|---|---|
| `image` | file |
| `link` | url |
| `sort_order` | number |
| `is_active` | bool |

### `settings`
Key-value store. Các key được dùng:

| Key | Mô tả |
|---|---|
| `phone` | Số điện thoại (VD: `0976491322`) |
| `phone_display` | Hiển thị (VD: `0976.491.322`) |
| `email` | Email liên hệ |
| `addresses` | JSON array địa chỉ cửa hàng |
| `zalo` | Link Zalo OA |
| `zalo_group` | Link nhóm Zalo báo giá (nếu có → hiện nút Báo giá) |
| `opening_hours` | Giờ mở cửa |

### `shipping_zones`
| Field | Type | Ghi chú |
|---|---|---|
| `name` | text | VD: `Nội thành Q1-Q3-Q5` |
| `districts` | text[] | Danh sách tên quận/huyện |
| `fee` | number | Phí giao hàng (VNĐ), `0` = lấy tại cửa hàng |

---

## Luồng Checkout

```
Giỏ hàng (Zustand)
     ↓
/dat-hoa (client component)
     ↓
[mount] fetch GET /api/shipping-zones
     ↓ fallback FALLBACK_ZONES nếu PB không phản hồi
Chọn tỉnh → quận → xã
     ↓ buildDistrictMap(zones) → auto-map quận → zone → phí ship
Nhập thông tin người nhận + ghi chú + nội dung thiệp
     ↓
[submit] POST /api/verify-turnstile { token }
     ↓ fail → báo lỗi, dừng
Tạo record `orders` trực tiếp qua PocketBase SDK
     ↓
fire-and-forget POST /api/notify/order
     ↓ gửi song song Discord + Lark (không block checkout)
Redirect /dat-hoa/cam-on?code=<orderCode> + xoá giỏ hàng
```

**Form persistence:** Dữ liệu form được debounce 500ms vào `sessionStorage` key `checkout-form` — survive back-navigation.

---

## Phí Giao Hàng

Phí ship được quản lý **động** trong PocketBase collection `shipping_zones`. Dưới đây là mặc định (`FALLBACK_ZONES`) khi PocketBase không phản hồi:

| Khu vực | Phí |
|---|---|
| Quận 1, 3, 5, 10 | 20.000đ |
| Quận 4, Phú Nhuận | 30.000đ |
| Quận 6, 7, 8, 11, Bình Thạnh | 40.000đ |
| Tân Bình, Bình Tân, Tân Phú, Gò Vấp | 60.000đ |
| Quận 2 | 50.000đ |
| Quận 9, 12, Nhà Bè, Bình Chánh, Hóc Môn, Thủ Đức | 80.000đ |
| Lấy tại cửa hàng | Miễn phí |

Để cập nhật phí ship: vào admin panel → quản lý collection `shipping_zones`. Không cần deploy lại.

---

## Thông Báo Đơn Hàng

`POST /api/notify/order` gửi thông báo song song tới Discord và Lark (tuỳ env vars đã set). **Checkout không bị ảnh hưởng nếu webhook fail.**

### Discord

- Embed chính: thông tin đơn hàng đầy đủ
- Embed phụ: một embed per sản phẩm, có thumbnail
- Retry tối đa **3 lần** với exponential backoff (1s, 2s)
- Tôn trọng header `Retry-After` khi bị rate limit 429
- Fail hoàn toàn → gửi alert về `DISCORD_ERROR_WEBHOOK_URL`

**Setup:**
1. Discord server → channel → Edit Channel → Integrations → Webhooks → New Webhook
2. Copy URL → thêm `DISCORD_WEBHOOK_URL` vào env

### Lark (Feishu)

- Interactive Card với header màu đỏ, thông tin đơn in đậm
- Ảnh thumbnail sản phẩm nhúng trực tiếp trong card

**Luồng gửi ảnh:**
1. Dùng `LARK_APP_ID` + `LARK_APP_SECRET` → lấy `tenant_access_token`
2. Với mỗi sản phẩm: download ảnh từ CDN → upload lên Lark → nhận `img_key`
3. Nhúng `img_key` vào card → gửi qua `LARK_WEBHOOK_URL`

**Setup Lark (từng bước):**

**Bước 1 — Tạo Custom Bot (webhook URL)**
1. Mở Lark → vào group chat muốn nhận thông báo
2. Settings → Bots → Add Bot → Custom Bot
3. Đặt tên, upload icon → copy **Webhook URL**
4. Thêm `LARK_WEBHOOK_URL` vào env

**Bước 2 — Tạo Lark App (để gửi ảnh)**
1. Vào [open.larksuite.com](https://open.larksuite.com) → Developer Console → Create App → Custom App
2. Credentials & Basic Info → copy **App ID** và **App Secret**
3. Thêm `LARK_APP_ID` và `LARK_APP_SECRET` vào env

**Bước 3 — Cấu hình permissions cho App**
1. Features → bật **Bot**
2. Permissions & Scopes → thêm scope `im:resource` (upload images/files)
3. Version Management → Create Version → Submit for release

**Bước 4 — Cấp quyền cho tổ chức**
1. Vào Lark Admin Console (`admin.larksuite.com`) → Apps → tìm app → Enable

---

## Chống Spam — Cloudflare Turnstile

Widget Turnstile nhúng trong form `/dat-hoa` (Managed mode — tự động pass hoặc challenge tuỳ rủi ro browser).

**Luồng:**
1. Widget load ngầm, Cloudflare phân tích browser fingerprint
2. Pass (tự động hoặc challenge) → Turnstile trả về token
3. Submit form: `POST /api/verify-turnstile { token }` → server verify với Cloudflare API
4. Pass → tạo đơn; Fail → báo lỗi, dừng

**Test keys:**

| Mục đích | Site Key | Secret Key |
|---|---|---|
| Luôn pass | `1x00000000000000000000AA` | `1x0000000000000000000000000000000AA` |
| Luôn fail | `2x00000000000000000000AB` | `2x0000000000000000000000000000000AB` |

**Setup production:**
1. Cloudflare Dashboard → Turnstile → Add site
2. Chọn widget type **Managed**
3. Copy Site Key → `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
4. Copy Secret Key → `TURNSTILE_SECRET_KEY`

---

## Media & Ảnh

`src/lib/media.ts` export hai hàm chính:

| Hàm | Mô tả |
|---|---|
| `getThumbUrl(collectionId, id, thumbnail, width?)` | Ảnh thumbnail, fallback về Unsplash nếu thiếu |
| `getImageUrl(collectionId, id, filename, width?)` | Ảnh full size |

**URL generation theo môi trường:**
- **Dev:** `https://photo.fitchy.shop/{collectionId}/{id}/{filename}`
- **Prod:** `/cdn-cgi/image/format=auto,width={w}/https://photo.fitchy.shop/...` (Cloudflare Image Resizing)

`PHOTO_BASE = https://photo.fitchy.shop` — CDN reverse proxy cho PocketBase files.

**Fallback thumbnail:** Khi `thumbnail` rỗng, `getThumbUrl` chọn deterministic từ 10 ảnh hoa Unsplash dựa trên hash của `recordId` — không bao giờ hiển thị ảnh broken.

---

## SEO

| Tính năng | Chi tiết |
|---|---|
| Title template | `%s \| Tiệm hoa nhà tình` (root layout) |
| Canonical | Mỗi trang set `alternates.canonical` riêng |
| JSON-LD | `LocalBusiness` (trang chủ), `Product` (chi tiết SP), `BreadcrumbList`, `ItemList` (danh mục) |
| Sitemap | `src/app/sitemap.ts` — dynamic từ PocketBase (products + categories active) |
| Robots | `src/app/robots.ts` — App Router native |
| Noindex | `/gio-hang`, `/dat-hoa` qua `layout.tsx` riêng |
| OG Image | Trang chủ: `/images/banner1.jpg`, chi tiết SP: thumbnail sản phẩm |

**JSON-LD helpers** (`src/services/seo.ts`):
- `localBusinessSchema(contact)` — thông tin shop, địa chỉ, số điện thoại
- `productSchema(product)` — giá, ảnh, mô tả
- `breadcrumbSchema(items)` — chuỗi breadcrumb
- `categoryItemListSchema(category, products)` — danh sách SP trong danh mục

---

## Cache & Revalidation

- Trang ISR dùng `export const revalidate = 3600` (Cloudflare edge cache 1 tiếng)
- Admin SPA gọi `POST /api/revalidate { path }` sau mỗi lần lưu sản phẩm/danh mục để purge cache ngay
- `public/_headers` set long-lived `Cache-Control` cho `/_next/static/*` và `/images/*`
- `open-next.config.ts`: `incrementalCache: "dummy"` — không dùng KV, dựa vào Cloudflare edge cache

---

## Giám Sát Lỗi

`src/lib/notify-error.ts` gửi embed màu đỏ về `DISCORD_ERROR_WEBHOOK_URL`. No-op nếu không set env var. Luôn fire-and-forget, không bao giờ throw.

| Nơi trigger | Điều kiện |
|---|---|
| `POST /api/notify/order` | Discord webhook fail sau đủ 3 retry |
| `POST /api/alert-error` | PocketBase không tạo được đơn hàng (từ client) |

---

## Tuỳ chỉnh

| Muốn đổi | File | Chỗ cụ thể |
|---|---|---|
| Màu chủ đạo, spacing | `src/app/globals.css` | CSS variables (`:root`) |
| Font | `src/app/layout.tsx` | `Baloo_2` → font khác từ `next/font/google` |
| Tên shop, domain | `src/config/constants.ts` | `SITE_NAME`, `SITE_URL` |
| Số điện thoại, địa chỉ | PocketBase `settings` | key `phone`, `addresses` |
| Menu điều hướng | `src/config/constants.ts` | `NAV_ITEMS` (fallback khi PB chưa có data) |
| Phí ship mặc định | `src/config/shipping.ts` | `FALLBACK_ZONES` |
| Phí ship động | Admin → collection `shipping_zones` | Không cần deploy lại |
| Nút Báo giá (Zalo Group) | PocketBase `settings` | key `zalo_group` — set URL → nút xuất hiện; bỏ trống → ẩn |

---

## Deploy lên Cloudflare Pages

### Lần đầu

```bash
# Login Cloudflare
npx wrangler login

# Deploy
npm run deploy:cf
```

### Các lần sau

```bash
npm run deploy:cf
```

### Env vars trên Cloudflare

Settings → Environment variables → Production:

| Biến | Bắt buộc | Ghi chú |
|---|---|---|
| `NEXT_PUBLIC_POCKETBASE_URL` | ✅ | — |
| `DISCORD_WEBHOOK_URL` | Tuỳ chọn | Thông báo đơn mới |
| `DISCORD_ERROR_WEBHOOK_URL` | Tuỳ chọn | Alert lỗi hệ thống |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Tuỳ chọn | Chống spam checkout |
| `TURNSTILE_SECRET_KEY` | Tuỳ chọn | Kèm theo site key |
| `LARK_WEBHOOK_URL` | Tuỳ chọn | Thông báo đơn mới |
| `LARK_APP_ID` | Tuỳ chọn | Cần để gửi ảnh |
| `LARK_APP_SECRET` | Tuỳ chọn | Cần để gửi ảnh |

### Chi tiết kỹ thuật Cloudflare

- `@opennextjs/cloudflare` (OpenNext) adapter để chạy Next.js trên Cloudflare Workers
- `wrangler.toml`: project name `shophoa`, `compatibility_flags: ["nodejs_compat"]`
- Deploy script tự động copy assets, tạo `_worker.js` và `_routes.json`
- `_routes.json` loại trừ static paths (`/_next/static/*`, `/images/*`...) khỏi Worker để giảm CPU usage
- `public/_headers` set `Cache-Control: public, max-age=31536000, immutable` cho static assets

---

## Scripts one-off

```
scripts/           # Migration/seeding scripts cho PocketBase
```

Chạy bằng `node scripts/<name>.mjs`. Dùng cho import data ban đầu hoặc migration schema.
