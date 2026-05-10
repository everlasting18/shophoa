# Vườn Hoa Tươi

Shop hoa tươi online tại TPHCM. Next.js 16 + PocketBase + Tailwind v4 + shadcn/ui.

## Cấu Trúc Thư Mục

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout: metadata, fonts, Header, Footer, ZaloFloat, Toast
│   ├── page.tsx                  # Trang chủ: hero banner, sản phẩm nổi bật, JSON‑LD, ISR 3600s
│   ├── loading.tsx / error.tsx / not-found.tsx
│   ├── sitemap.ts                # Sitemap động (categories + products từ PocketBase)
│   ├── robots.ts                 # robots.txt
│   │
│   ├── (shop)/[slug]/            # Dynamic category page (VD: /hoa-sinh-nhat)
│   │   └── page.tsx              # SSR: subcategories, product grid, filter, sort, pagination
│   │
│   ├── san-pham/
│   │   ├── page.tsx              # Tất cả sản phẩm (listing)
│   │   └── [slug]/page.tsx       # Chi tiết sản phẩm: gallery, info, SEO, related products, JSON‑LD
│   │
│   ├── gio-hang/page.tsx         # Giỏ hàng (client)
│   ├── tim-kiem/page.tsx         # Kết quả tìm kiếm (SSR, force‑dynamic)
│   ├── dat-hoa/
│   │   ├── page.tsx              # Checkout đa bước: thông tin người gửi/nhận, ngày/giờ giao, phí ship
│   │   └── cam-on/page.tsx       # Xác nhận đơn hàng thành công
│   ├── lien-he/ / gioi-thieu/ / chinh-sach-bao-mat/
│   │
│   ├── admin/                    # Admin panel (all client‑side)
│   │   ├── layout.tsx            # Auth guard + sidebar
│   │   ├── login/page.tsx        # Đăng nhập admin (PocketBase)
│   │   ├── page.tsx              # Dashboard: thống kê đơn hàng, doanh thu
│   │   ├── products/             # CRUD sản phẩm + upload ảnh
│   │   ├── orders/               # Quản lý đơn hàng, cập nhật trạng thái
│   │   ├── categories/           # CRUD danh mục (tree view, drag‑and‑drop)
│   │   ├── banners/              # CRUD banner
│   │   └── settings/             # Cài đặt: phone, Zalo, email, địa chỉ
│   │
│   └── api/                      # API routes
│       ├── auth/admin/login/     # POST: auth PocketBase admin, set httpOnly cookie
│       ├── auth/admin/logout/    # POST: clear cookie
│       ├── settings/             # GET: trả contact info cho client‑side
│       ├── navigation/           # GET: trả nav tree cho header
│       └── upload/               # POST: upload ảnh (tạo temp record → lấy URL → xoá temp)
│
├── config/                       # ⚙️ Tất cả hằng số, URL, config
│   ├── index.ts                  # Barrel export
│   ├── third-party.ts            # PB_URL, CF_IMAGE_BASE, ZALO_PHONE, SOCIAL, googleMapsLink...
│   ├── shipping.ts               # TIME_GROUPS, SHIPPING_ZONES, DAY_NAMES
│   └── constants.ts              # SITE_NAME, CONTACT, NAV_ITEMS
│
├── schema/                       # 📐 Types + Zod validation
│   ├── index.ts                  # Barrel export
│   ├── pocketbase.ts             # Category, Product, Order, OrderItem, Banner, Settings
│   ├── app.ts                    # CartItem, CartStore, AdminStore, SiteContact, NavItem...
│   └── checkout.ts               # checkoutSchema (zod) + CheckoutForm
│
├── services/                     # 🔌 Data access (phụ thuộc PocketBase)
│   ├── pocketbase.ts             # PocketBase client singleton
│   ├── settings.ts               # getSiteSettings() — site contact info (có fallback)
│   ├── navigation.ts             # getNavItems() — nav tree từ categories (có fallback)
│   └── seo.ts                    # JSON‑LD generators: Organization, Product, Breadcrumb...
│
├── lib/                          # 🛠 Pure utilities (không phụ thuộc service nào)
│   ├── utils.ts                  # cn(), formatPrice() (VND locale)
│   ├── media.ts                  # cfImage(), getThumbUrl(), getImageUrl() (Cloudflare CDN)
│   ├── date-utils.ts             # todayISO(), isoToDisplay(), addDaysToISO()
│   └── product-utils.ts          # hasSale(), getDisplayPrice()
│
├── hooks/                        # React hooks (client‑only)
│   ├── use-settings.ts           # Contact info cho client components (ZaloFloat, Header…)
│   └── use-provinces.ts          # Fetch quận/huyện TPHCM từ provinces.open-api.vn
│
├── stores/                       # Zustand state
│   ├── cart-store.ts             # Giỏ hàng (persist localStorage, key: vuonhoatuoi-cart)
│   └── admin-store.ts            # Admin auth state (persist localStorage)
│
└── components/
    ├── layout/                   # Header, Footer, ZaloFloat, SearchDialog, SocialIcons
    ├── home/                     # HeroBanner (Embla), ProductSection, WhyChooseUs
    ├── product/                  # ProductCard, ProductGrid, ProductGallery, AddToCartButton, PriceDisplay
    ├── category/                 # SortSelect, Pagination
    ├── checkout/                 # CustomerForms, AddressFields, OrderSummary, DeliveryTime, ShippingZones, ProgressSteps
    └── ui/                       # shadcn/ui: Button, Dialog, Sheet, Skeleton, Badge, Carousel, Toast…
```

---

## Luồng Hoạt Động Chính

### 1. Trang chủ → Xem sản phẩm → Chi tiết

```
Trang chủ (ISR 3600s)
  │  SSR: fetch banners + featured products + best sellers từ PocketBase
  │  JSON‑LD: Organization + Florist schema
  │
  ├─→ Click danh mục → /{slug} (SSR)
  │     fetch category + subcategories + products (paginated, sorted, filtered)
  │     hiển thị grid + sidebar
  │
  └─→ Click sản phẩm → /san-pham/{slug} (SSR)
        fetch product detail + related products
        JSON‑LD: Product + Breadcrumb
        Cloudflare CDN ảnh: cfImage(width, format=auto)
```

### 2. Giỏ hàng → Checkout → Đơn hàng

```
Add to Cart (Zustand + localStorage)
  │  lưu cả Product object (ảnh, giá gốc, giá sale)
  │
  └─→ /gio-hang
        hiển thị danh sách, +/- quantity, tổng tiền
        nút "Tiến hành đặt hoa"
        │
        └─→ /dat-hoa (client)
              form 4 bước:
              1. Chọn ngày/giờ giao (today/tomorrow/custom + time slots)
              2. Thông tin người gửi + người nhận (sameAsBuyer toggle)
              3. Chọn khu vực giao (SHIPPING_ZONES) + địa chỉ (ward/district/street)
              4. Ghi chú + tổng tiền (subtotal + shippingFee)
              │
              validate bằng Zod (checkoutSchema):
                - SĐT regex /^0[0-9]{9}$/
                - Tên người nhận bắt buộc nếu != người gửi
                - Địa chỉ bắt buộc nếu không phải pickup
                - shippingIdx phải trong range
              │
              submit → PocketBase:
                tạo record orders collection
                order_code: VHT + random
                items: [{product_id, name, price, quantity}]
                status: "pending", payment: "bank_transfer"
              │
              clearCart() → redirect /dat-hoa/cam-on?code={orderCode}
              │
              └─→ /dat-hoa/cam-on
                    hiển thị mã đơn hàng thật
                    nút Zalo để theo dõi
                    link về trang chủ
```

### 3. Tìm kiếm

```
Header SearchDialog → nhập query → encodeURIComponent → navigate /tim-kiem?q={query}
  │
  └─→ /tim-kiem (SSR force‑dynamic)
        PocketBase filter: name~"query" || short_description~"query"
        escape ký tự " để tránh lỗi filter
        hiển thị kết quả dạng grid (tối đa 48)
```

### 4. Quản Trị (Admin)

```
/admin → check auth (zustand + localStorage)
  │  chưa login → redirect /admin/login
  │
  └─→ /admin/login
        POST email + password → PocketBase admins.authWithPassword()
        server set httpOnly cookie "vht_admin_token"
        client lưu token vào zustand + PB authStore
        │
        ├─→ Dashboard: thống kê đơn/doanh thu hôm nay, đơn chờ xác nhận
        ├─→ Products: CRUD + upload ảnh + rich editor (Tiptap)
        ├─→ Orders: lọc theo status/ngày/tìm kiếm, cập nhật trạng thái
        │     Zalo link trực tiếp đến khách hàng
        ├─→ Categories: tree view cha‑con, sort kéo thả
        ├─→ Banners: upload ảnh, toggle active
        └─→ Settings: chỉnh sửa phone, Zalo, email, địa chỉ cửa hàng
```

### 5. Xử Lý Ảnh

```
PocketBase → getThumbUrl / getImageUrl
  │  raw URL: {PB_URL}/api/files/{collectionId}/{recordId}/{filename}
  │
  └─→ cfImage() Cloudflare Image Resizing
        dev: trả raw URL (không optimize)
        prod: https://fitchy.shop/cdn-cgi/image/width=...,format=auto/{rawURL}
        params: width, height, format (auto/webp/avif), quality, fit

Upload (admin):
  POST /api/upload → tạo temp product → upload file → lấy URL → xoá temp record
  giới hạn file: max 10MB
```

---

## Tech Stack

| Lớp | Công nghệ |
|-----|-----------|
| Frontend | Next.js 16 (App Router, SSR/ISR) |
| Styling | TailwindCSS v4 + shadcn/ui (base‑nova) |
| Font | Inter (body) + Playfair Display (headings) |
| Icons | Lucide React |
| Backend/DB | PocketBase (self‑hosted cloud) |
| State | Zustand (persist localStorage) |
| Form | react‑hook‑form + Zod |
| Editor | Tiptap (rich text) |
| Carousel | Embla Carousel |
| Image CDN | Cloudflare Image Resizing |
| Deploy | Vercel (frontend) + PocketBase Cloud |

---

## Biến Môi Trường

```bash
# .env.local
NEXT_PUBLIC_POCKETBASE_URL=https://your-pocketbase-instance.com

# Scripts (optional)
PB_ADMIN_EMAIL=admin@example.com
PB_ADMIN_PASSWORD=your-password
```

---

## Chạy Local

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run start      # chạy production
```

## PocketBase Schema

Cần tạo các collections sau trong PocketBase Admin UI (hoặc chạy `node scripts/setup-pb.mjs <email> <password>`):

| Collection | Fields chính |
|------------|-------------|
| `categories` | name, slug, parent (relation), category_type, sort_order, image, is_active |
| `products` | name, slug, price, sale_price, images[], thumbnail, short_description, description, occasions[], categories[], is_featured, is_best_seller, is_active |
| `orders` | order_code, customer_name/phone, recipient_name/phone/address, delivery_date/time, items (JSON), subtotal, total, note, status, payment_method |
| `banners` | title, image, link, sort_order, is_active, position (hero/promo/category) |
| `settings` | key/value pairs: phone, hotline_display, zalo, email, address_1, address_2, opening_hours |

---

## SEO

- **SSR/ISR** cho tất cả product + category pages (revalidate: 3600s)
- **Dynamic sitemap** tự động từ PocketBase categories + products
- **JSON‑LD**: Organization, Florist, Product, BreadcrumbList, ItemList
- **Canonical URLs** cho mỗi page
- **Alt text** cho tất cả ảnh sản phẩm
- **robots.txt**: chặn index /gio-hang, /dat-hoa
