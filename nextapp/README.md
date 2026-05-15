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

# Tuỳ chọn — thông báo đơn mới qua Discord
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

> Nếu thiếu `DISCORD_WEBHOOK_URL`, khi có đơn mới: dev sẽ log ra terminal, production trả về 503 nhưng checkout vẫn hoạt động bình thường (fire-and-forget).

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
| Styling | Tailwind CSS v4 + shadcn/ui |
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
/api/revalidate            Purge ISR cache theo path (POST)
/api/notify/order          Gửi thông báo Discord khi có đơn mới (POST)
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
│   ├── category/               # Pagination, SortSelect
│   ├── layout/                 # Header, Footer, SearchDialog, ZaloFloat
│   └── ui/                     # Button, Badge, Toast, Dialog, Skeleton, Carousel...
├── services/
│   ├── pocketbase.ts           # PocketBase singleton
│   ├── navigation.ts           # Navigation tree (React cache)
│   ├── settings.ts             # Site settings (React cache)
│   └── seo.ts                  # JSON-LD: LocalBusiness, Product, Breadcrumb, CategoryItemList
├── stores/
│   └── cart-store.ts           # Zustand cart (persist key: vuonhoatuoi-cart)
├── config/
│   ├── constants.ts            # SITE_NAME, CONTACT, NAV_ITEMS
│   ├── shipping.ts             # SHIPPING_ZONES, DISTRICT_ZONE_MAP
│   └── third-party.ts          # PB_URL, PHOTO_BASE, ZALO_PHONE, SITE_URL...
├── hooks/
│   ├── use-provinces.ts        # Lấy danh sách tỉnh/huyện từ Vietnam Provinces API
│   └── use-settings.ts        # Fetch /api/settings từ client
├── lib/
│   ├── media.ts                # getThumbUrl, getImageUrl (Cloudflare Image Resizing)
│   ├── utils.ts                # formatPrice, cn
│   └── date-utils.ts           # todayISO, isoToDisplay, shortDateISO
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
| `settings` | `key` / `value` — lưu phone, địa chỉ, giờ mở cửa, ghi chú free shipping |
| `media` | `file` — ảnh upload từ rich editor trong admin |

### Occasions hợp lệ (field `occasions[]` trong products)
```
Sinh nhật, Khai trương, Tốt nghiệp, Tình yêu, Chia buồn,
Sự kiện, Chúc mừng, Valentine, 8/3, 20/10, 20/11
```

---

## Luồng Checkout

1. Giỏ hàng lưu trong Zustand (persist localStorage)
2. Trang `/dat-hoa` là một client component duy nhất (không có step routing)
3. Form tự động lưu vào `sessionStorage` mỗi 500ms (tránh mất dữ liệu khi back)
4. Chọn tỉnh → quận: `DISTRICT_ZONE_MAP` tự tính phí ship theo zone
5. Submit: tạo record `orders` trực tiếp qua PocketBase SDK, sau đó fire-and-forget `POST /api/notify/order` để gửi Discord
6. Redirect đến `/dat-hoa/cam-on?code=<orderCode>`

### Phí giao hàng theo khu vực (TPHCM)

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

## Media & Ảnh

`src/lib/media.ts` xử lý URL ảnh tự động:
- **Dev**: `PHOTO_BASE/{collectionId}/{recordId}/{filename}`
- **Prod**: `/cdn-cgi/image/format=auto,width=N/{url}` — Cloudflare Image Resizing resize tự động
- `getThumbUrl(...)` — thumbnail nhỏ, fallback về ảnh hoa Unsplash nếu không có thumbnail
- `getImageUrl(...)` — ảnh full size

`PHOTO_BASE = https://photo.fitchy.shop` — CDN proxy cho file PocketBase.

---

## SEO

- Mỗi trang server có `export const metadata` riêng (title, description, canonical, OG, Twitter)
- JSON-LD được inject trực tiếp trong RSC: `LocalBusiness` (trang chủ), `Product` (chi tiết SP), `BreadcrumbList`, `ItemList` (danh mục)
- `src/app/sitemap.ts` — dynamic sitemap lấy từ PocketBase (tất cả sản phẩm + danh mục active)
- `/gio-hang` và `/dat-hoa` có `layout.tsx` riêng với `robots: { index: false }`

---

## Cache & Revalidation

- Các trang dùng `export const revalidate = 3600` (ISR 1 tiếng)
- Khi admin thay đổi sản phẩm/danh mục, admin SPA gọi `POST /api/revalidate { path }` để purge ngay
- Cloudflare edge cache: `public/_headers` set `Cache-Control: s-maxage=...` cho static assets

---

## Tuỳ chỉnh giao diện

| Thứ muốn đổi | Chỗ chỉnh |
|---|---|
| Màu sắc chủ đạo | `src/app/globals.css` → `:root` CSS variables (`--primary`, `--background`...) |
| Font chữ | `src/app/layout.tsx` → thay `Baloo_2` bằng font khác từ `next/font/google` |
| Tên shop, liên hệ | `src/config/constants.ts` → `SITE_NAME`, `CONTACT` |
| Menu điều hướng | `src/config/constants.ts` → `NAV_ITEMS` |
| Phí ship / khu vực | `src/config/shipping.ts` → `SHIPPING_ZONES`, `DISTRICT_ZONE_MAP` |

---

## Deploy lên Cloudflare Pages

### Lần đầu

```bash
npx wrangler login
npm run deploy:cf
```

### Các lần sau

```bash
npm run deploy:cf
```

### Env vars trên Cloudflare

Vào **Cloudflare Dashboard → Pages → shophoa → Settings → Environment variables**, thêm:
- `NEXT_PUBLIC_POCKETBASE_URL` — bắt buộc
- `DISCORD_WEBHOOK_URL` — tuỳ chọn

### Ghi chú kỹ thuật

- Dùng `@opennextjs/cloudflare` (OpenNext) để wrap Next.js chạy trên Cloudflare Workers
- `open-next.config.ts`: `incrementalCache: "dummy"` — không dùng KV, dựa hoàn toàn vào Cloudflare edge cache + ISR revalidate theo request
- `wrangler.toml`: project `shophoa`, `compatibility_flags: ["nodejs_compat"]`
