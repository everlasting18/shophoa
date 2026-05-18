# Tiệm Hoa Nhà Tình — Storefront

Website bán hoa tươi online tại TPHCM. Xây dựng bằng Next.js 16 App Router + PocketBase, deploy lên Cloudflare Pages.

---

## Yêu cầu

- Node.js ≥ 18
- PocketBase instance đang chạy
- Tài khoản Cloudflare (để deploy)

---

## Cài đặt

```bash
npm install
```

Tạo file `.env.local` ở thư mục gốc:

```env
# Bắt buộc
NEXT_PUBLIC_POCKETBASE_URL=https://your-pocketbase-url.com

# Chống spam đơn hàng (Cloudflare Turnstile)
# Dev: dùng test key bên dưới; Prod: key thật từ Cloudflare dashboard
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA

# Thông báo đơn mới qua Discord (tuỳ chọn)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
DISCORD_ERROR_WEBHOOK_URL=https://discord.com/api/webhooks/...

# Thông báo đơn mới qua Lark (tuỳ chọn)
LARK_WEBHOOK_URL=https://open.larksuite.com/open-apis/bot/v2/hook/...
LARK_APP_ID=cli_xxx
LARK_APP_SECRET=xxx
```

> Có thể dùng Discord, Lark, hoặc cả hai song song. Nếu cả hai đều thiếu: dev log ra terminal, production trả 503 nhưng checkout vẫn hoạt động (notify là fire-and-forget).

> Nếu thiếu Turnstile key, widget không render và bước verify bị bỏ qua — checkout vẫn hoạt động bình thường.

---

## Lệnh thường dùng

```bash
npm run dev          # Dev server tại localhost:3000
npm run build        # Production build
npm run start        # Chạy bản build production
npm run lint         # ESLint
npm run build:cf     # Build cho Cloudflare Pages (OpenNext)
npm run deploy:cf    # Build + deploy lên Cloudflare Pages
npm run preview:cf   # Build + preview Cloudflare runtime local
```

---

## Stack

| Lớp | Công nghệ |
|-----|-----------|
| Framework | Next.js 16 (App Router, SSR/ISR) |
| Styling | Tailwind CSS v4 + shadcn/ui + @base-ui/react |
| Backend / DB | PocketBase 0.26.8 |
| State | Zustand 5 (cart, persist localStorage) |
| Form | React Hook Form + Zod |
| Carousel | Embla Carousel |
| Image CDN | Cloudflare Image Resizing |
| Font | Baloo 2 (Google Fonts, Vietnamese subset) |
| Deploy | Cloudflare Pages (OpenNext) |

---

## Routing

```
/                          Trang chủ (ISR 3600s) — banner, best sellers, danh mục
/[slug]                    Trang danh mục (ISR 3600s) — lọc, phân trang, sắp xếp
/san-pham                  Tất cả sản phẩm (ISR 3600s)
/san-pham/[slug]           Chi tiết sản phẩm (ISR 3600s) — gallery, thêm giỏ hàng
/tim-kiem                  Tìm kiếm (force-dynamic, SSR)
/gio-hang                  Giỏ hàng (client, noindex)
/dat-hoa                   Checkout (client, noindex)
/dat-hoa/cam-on            Xác nhận đơn hàng
/gioi-thieu                Giới thiệu
/lien-he                   Liên hệ
/chinh-sach-bao-mat        Chính sách bảo mật

API Routes:
/api/navigation            Navigation tree từ PocketBase categories (GET)
/api/settings              Cài đặt công khai từ PocketBase (GET)
/api/shipping-zones        Danh sách zone + phí ship từ PocketBase (GET)
/api/revalidate            Purge ISR cache theo path (POST)
/api/notify/order          Gửi thông báo Discord + Lark khi có đơn mới (POST)
/api/verify-turnstile      Verify Cloudflare Turnstile token (POST)
/api/alert-error           Forward lỗi client-side về Discord error channel (POST)
```

---

## Cấu trúc dự án

```
src/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout: Header, Footer, ZaloFloat, ToastProvider
│   ├── page.tsx                # Trang chủ
│   ├── (shop)/[slug]/          # Trang danh mục (route group, kế thừa root layout)
│   ├── san-pham/               # Listing + chi tiết sản phẩm
│   ├── gio-hang/               # Giỏ hàng (layout noindex)
│   ├── dat-hoa/                # Checkout + trang cảm ơn (layout noindex)
│   ├── tim-kiem/               # Tìm kiếm
│   ├── sitemap.ts              # Dynamic sitemap từ PocketBase
│   ├── robots.ts               # robots.txt
│   └── api/                    # API Routes
├── components/
│   ├── home/                   # HeroBanner, CategoryGrid, ProductSection
│   ├── product/                # ProductCard, ProductGrid, ProductGallery, PriceDisplay, AddToCartButton
│   ├── checkout/               # ProgressSteps, CustomerForms, DeliveryTime, ShippingZones, OrderSummary
│   ├── category/               # Pagination, SortSelect, FilterSidebar
│   ├── layout/                 # Header, Footer, SearchDialog, ZaloFloat
│   └── ui/                     # Button, Badge, Toast, Dialog, Skeleton, Carousel...
├── services/
│   ├── pocketbase.ts           # PocketBase singleton
│   ├── navigation.ts           # Navigation tree (React cache)
│   ├── settings.ts             # Site settings (React cache)
│   ├── shipping.ts             # Shipping zones (React cache, fallback FALLBACK_ZONES)
│   └── seo.ts                  # JSON-LD: LocalBusiness, Product, Breadcrumb, CategoryItemList
├── stores/
│   └── cart-store.ts           # Zustand cart (persist key: vuonhoatuoi-cart)
├── config/
│   ├── constants.ts            # SITE_NAME, CONTACT, NAV_ITEMS
│   ├── shipping.ts             # FALLBACK_ZONES, buildDistrictMap()
│   └── third-party.ts          # PB_URL, PHOTO_BASE, SITE_URL...
├── hooks/
│   ├── use-provinces.ts        # Danh sách tỉnh/huyện từ Vietnam Provinces API
│   └── use-settings.ts         # Fetch /api/settings từ client
├── lib/
│   ├── media.ts                # getThumbUrl, getImageUrl (Cloudflare Image Resizing)
│   ├── utils.ts                # formatPrice, cn
│   ├── date-utils.ts           # todayISO, isoToDisplay, shortDateISO
│   ├── notify-error.ts         # Gửi alert về Discord error channel (fire-and-forget)
│   └── sanitize.ts             # sanitizeHtml, stripHtml
└── schema/
    ├── pocketbase.ts           # TypeScript interfaces: Product, Category, Order, Banner, Settings
    ├── checkout.ts             # Zod schema cho checkout form
    └── app.ts                  # App-level types (CartItem, CartStore, SiteContact...)
```

---

## PocketBase Collections

| Collection | Fields chính |
|------------|-------------|
| `products` | `name`, `slug`, `price`, `sale_price`, `thumbnail`, `images[]`, `short_description`, `description`, `occasions[]`, `categories[]`, `is_active`, `is_featured`, `is_best_seller` |
| `categories` | `name`, `slug`, `parent` (self-relation), `image`, `sort_order`, `is_active` |
| `orders` | `order_code`, `customer_name/phone`, `recipient_name/phone/address`, `delivery_date/time`, `items` (JSON), `subtotal`, `total`, `note`, `status` (`pending`/`confirmed`/`cancelled`), `payment_method` |
| `banners` | `image`, `link`, `sort_order`, `is_active` |
| `settings` | `key` / `value` — phone, địa chỉ, giờ mở cửa, link Zalo, link nhóm Zalo báo giá |
| `shipping_zones` | `name`, `districts[]`, `fee` — quản lý phí ship động từ admin |
| `media` | `file` — ảnh upload từ rich editor trong admin |

### Occasions hợp lệ (field `occasions[]` trong products)
```
Sinh nhật, Khai trương, Tốt nghiệp, Tình yêu, Chia buồn,
Sự kiện, Chúc mừng, Valentine, 8/3, 20/10, 20/11
```

---

## Luồng Checkout

1. Giỏ hàng lưu trong Zustand (persist localStorage, key `vuonhoatuoi-cart`)
2. Trang `/dat-hoa` là một client component duy nhất (không có step routing)
3. Khi mount: fetch `GET /api/shipping-zones` để lấy danh sách zone + phí ship động từ PocketBase, fallback về `FALLBACK_ZONES` nếu PocketBase không phản hồi
4. Form tự động lưu vào `sessionStorage` mỗi 500ms (tránh mất dữ liệu khi back)
5. Chọn tỉnh → quận: `buildDistrictMap(zones)` tự map quận vào zone index, tính phí ship tự động
6. **Turnstile verify** (nếu có key): gọi `POST /api/verify-turnstile { token }` — nếu fail thì dừng, không tạo đơn
7. Submit: tạo record `orders` trực tiếp qua PocketBase SDK
8. Fire-and-forget `POST /api/notify/order` → gửi thông báo song song tới Discord + Lark
9. Redirect đến `/dat-hoa/cam-on?code=<orderCode>`, xoá giỏ hàng

### Phí giao hàng (mặc định, có thể cấu hình trong admin)

| Khu vực | Phí |
|---------|-----|
| Quận 1, 3, 5, 10 | 20.000đ |
| Quận 4, Phú Nhuận | 30.000đ |
| Quận 6, 7, 8, 11, Bình Thạnh | 40.000đ |
| Tân Bình, Bình Tân, Tân Phú, Gò Vấp | 60.000đ |
| Quận 2 | 50.000đ |
| Quận 9, 12, Nhà Bè, Bình Chánh, Hóc Môn, Thủ Đức | 80.000đ |
| Lấy tại cửa hàng | Miễn phí |

---

## Thông Báo Đơn Hàng

Khi có đơn mới, `POST /api/notify/order` gửi song song tới Discord và Lark (nếu được cấu hình). Checkout không bị ảnh hưởng nếu webhook fail.

### Discord

Mỗi đơn gửi thành một embed chính (thông tin đơn) + các embed phụ (một embed per sản phẩm, có thumbnail).

- Retry tối đa 3 lần với exponential backoff (1s, 2s)
- Tôn trọng header `Retry-After` khi bị rate limit 429
- Nếu fail hoàn toàn: gửi alert về `DISCORD_ERROR_WEBHOOK_URL`

**Setup:**
1. Discord → server → channel → Edit Channel → Integrations → Webhooks → New Webhook → Copy URL
2. Thêm vào env: `DISCORD_WEBHOOK_URL=<url>`

### Lark

Gửi Interactive Card với header đỏ, thông tin đơn in đậm, và ảnh thumbnail của mỗi sản phẩm nằm cạnh tên.

Luồng gửi ảnh:
1. Dùng `LARK_APP_ID` + `LARK_APP_SECRET` để lấy `tenant_access_token`
2. Với mỗi sản phẩm: download ảnh từ CDN → upload lên Lark → nhận `img_key`
3. Nhúng `img_key` vào card message, gửi qua webhook URL

Nếu không có `LARK_APP_ID`/`LARK_APP_SECRET`, vẫn gửi được tin nhắn nhưng không có ảnh.

**Setup Lark (từng bước):**

**Bước 1 — Tạo Custom Bot (lấy webhook URL)**
1. Mở Lark → vào group chat muốn nhận thông báo
2. Settings → Bots → Add Bot → Custom Bot
3. Đặt tên, upload icon → copy **Webhook URL**
4. Thêm vào env: `LARK_WEBHOOK_URL=<url>`

**Bước 2 — Tạo Lark App (để gửi ảnh)**
1. Vào [open.larksuite.com](https://open.larksuite.com) → Developer Console → Create App → Custom App
2. Credentials & Basic Info → copy **App ID** và **App Secret**
3. Thêm vào env: `LARK_APP_ID=<id>` và `LARK_APP_SECRET=<secret>`

**Bước 3 — Cấu hình app**
1. **Add Features** → bật **Bot**
2. **Permissions & Scopes** → thêm `im:resource` (Read and upload images or other files)
3. **Version Management & Release** → Create Version → Submit for release → approve

**Bước 4 — Cấp quyền cho tổ chức**
1. Vào Lark Admin Console (admin.larksuite.com) → Apps → tìm app → Enable

---

## Chống Spam — Cloudflare Turnstile

Widget Turnstile nhúng vào form `/dat-hoa`, Managed mode (tự động hoặc challenge tùy rủi ro).

1. Widget load ngầm, Cloudflare phân tích browser fingerprint
2. User pass (tự động hoặc click challenge) → Turnstile trả token
3. Submit form: `POST /api/verify-turnstile { token }` → server verify với Cloudflare
4. Pass → tạo đơn; Fail → báo lỗi, không tạo đơn

| Môi trường | Key |
|---|---|
| Dev (luôn pass) | `1x00000000000000000000AA` |
| Dev (luôn fail) | `2x00000000000000000000AB` |
| Prod | Tạo tại Cloudflare Dashboard → Turnstile → chọn **Invisible** mode |

---

## Giám Sát Lỗi

`src/lib/notify-error.ts` gửi embed đỏ về `DISCORD_ERROR_WEBHOOK_URL` khi có lỗi hệ thống. No-op nếu không set env var.

| Trigger | Lỗi |
|---|---|
| `POST /api/notify/order` | Discord webhook fail sau 3 retry |
| `POST /api/alert-error` | PocketBase không tạo được đơn hàng (từ client) |

---

## Media & Ảnh

`src/lib/media.ts`:
- **Dev**: `PHOTO_BASE/{collectionId}/{recordId}/{filename}`
- **Prod**: `/cdn-cgi/image/format=auto,width=N/{url}` — Cloudflare Image Resizing
- `getThumbUrl(...)` — thumbnail, fallback về ảnh hoa Unsplash nếu không có thumbnail (deterministic từ `recordId`)
- `getImageUrl(...)` — ảnh full size

`PHOTO_BASE = https://photo.fitchy.shop` — CDN proxy cho PocketBase files.

---

## SEO

- Mỗi trang server có `export const metadata` riêng (title, description, canonical, OG, Twitter)
- JSON-LD trong RSC: `LocalBusiness` (trang chủ), `Product` (chi tiết SP), `BreadcrumbList`, `ItemList` (danh mục)
- `src/app/sitemap.ts` — dynamic sitemap từ PocketBase (sản phẩm + danh mục active)
- `/gio-hang` và `/dat-hoa` có `layout.tsx` với `robots: { index: false }`

---

## Cache & Revalidation

- Các trang ISR dùng `export const revalidate = 3600` (1 tiếng)
- Admin SPA gọi `POST /api/revalidate { path }` sau mỗi mutation để purge Cloudflare edge cache ngay lập tức
- `public/_headers` set `Cache-Control: s-maxage=...` cho static assets

---

## Tuỳ chỉnh

| Muốn đổi | File | Chỗ cụ thể |
|---|---|---|
| Màu sắc chủ đạo | `src/app/globals.css` | `:root` CSS variables (`--primary`, `--background`...) |
| Font chữ | `src/app/layout.tsx` | Thay `Baloo_2` bằng font khác từ `next/font/google` |
| Tên shop, liên hệ | `src/config/constants.ts` | `SITE_NAME`, `CONTACT` |
| Menu điều hướng | `src/config/constants.ts` | `NAV_ITEMS` |
| Phí ship mặc định | `src/config/shipping.ts` | `FALLBACK_ZONES` |
| Phí ship động | Admin → Settings | Quản lý `shipping_zones` trong PocketBase qua admin |

---

## Deploy lên Cloudflare Pages

```bash
# Lần đầu
npx wrangler login
npm run deploy:cf

# Các lần sau
npm run deploy:cf
```

**Env vars trên Cloudflare** (Settings → Environment variables):

| Biến | Bắt buộc |
|---|---|
| `NEXT_PUBLIC_POCKETBASE_URL` | ✅ |
| `DISCORD_WEBHOOK_URL` | Tuỳ chọn |
| `DISCORD_ERROR_WEBHOOK_URL` | Tuỳ chọn |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Tuỳ chọn |
| `TURNSTILE_SECRET_KEY` | Tuỳ chọn |
| `LARK_WEBHOOK_URL` | Tuỳ chọn |
| `LARK_APP_ID` | Tuỳ chọn |
| `LARK_APP_SECRET` | Tuỳ chọn |

**Ghi chú kỹ thuật:**
- Dùng `@opennextjs/cloudflare` (OpenNext) để chạy Next.js trên Cloudflare Workers
- `open-next.config.ts`: `incrementalCache: "dummy"` — không dùng KV, dựa vào Cloudflare edge cache
- `wrangler.toml`: project `shophoa`, `compatibility_flags: ["nodejs_compat"]`
- `public/_routes.json` loại trừ static paths khỏi Worker để tăng hiệu suất
