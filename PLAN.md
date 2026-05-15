# Shop Hoa Tươi - Thiết Kế Lại với Next.js + PocketBase + Tailwind + shadcn/ui

## 1. Phân Tích Website Gốc (vuonhoatuoi.vn)

### Tổng quan
- **Loại hình**: Shop hoa tươi online tại TPHCM (Quận 3 & Quận 10)
- **Thương hiệu**: Vườn Hoa Tươi - Công ty TNHH Thương Mại Dịch Vụ Vườn Hoa Tươi
- **MST**: 031541764
- **Liên hệ**: 0976.491.322 | cskh@vuonhoatuoi.vn
- **Địa chỉ**: 183/37 Đường 3 Tháng 2, Phường Vườn Lài & 704/19 Nguyễn Đình Chiểu, Q3
- **Nền tảng hiện tại**: WordPress + WooCommerce

### Cấu trúc danh mục sản phẩm

#### Theo dịp (Occasion-based)
| Danh mục | URL slug |
|---|---|
| Hoa Sinh Nhật | `/hoa-sinh-nhat/` |
| Hoa Khai Trương | `/hoa-khai-truong/` |
| Hoa Tốt Nghiệp | `/hoa-tot-nghiep/` |
| Hoa Tình Yêu | `/hoa-tinh-yeu/` |
| Hoa Chia Buồn | `/tong-hop-hoa-chia-buon/` |
| Hoa Valentine | `/hoa-valentine-14-02/` |
| Hoa 8/3 | `/hoa-8-thang-3/` |
| Hoa 20/10 | `/hoa-20-thang-10/` |
| Hoa 20/11 | `/hoa-20-thang-11/` |
| Hoa Sự Kiện | `/hoa-su-kien/` |
| Hoa Để Bàn | `/hoa-de-ban/` |
| Hoa Cưới | `/hoa-cam-tay-co-dau/` |
| Hoa Hẹn Hò | `/hoa-hen-ho/` |
| Hoa Xin Lỗi | `/hoa-xin-loi/` |

#### Theo kiểu dáng (Style-based)
| Danh mục | Sub-categories |
|---|---|
| Bó Hoa | Best Seller, Garden Mix, Tulip, Hướng Dương, Cẩm Tú Cầu, Cúc Mẫu Đơn, Đồng Tiền, Cao Cấp, Baby, Sen |
| Bó Hoa Hồng | Ohara, Sophia, Chiết Xạ, Đỏ, Cam, Tím, Trắng |
| Hộp Hoa Mica | (collection riêng) |
| Lẵng Hoa | Sinh Nhật, Khai Trương, Chúc Mừng |
| Giỏ Hoa | Sinh Nhật, Khai Trương, Chúc Mừng |
| Kệ Hoa | Khai Trương, Mini, Sinh Nhật |
| Hoa Sáp | (collection riêng) |
| Hoa Gấu Bông | (collection riêng) |

#### Theo đối tượng (Recipient-based)
| Danh mục | URL slug |
|---|---|
| Hoa Sinh Viên | `/hoa-sinh-vien/` |
| Hoa Tặng Mẹ | `/hoa-sinh-nhat-tang-me/` |
| Hoa Tặng Người Yêu | `/hoa-tang-sinh-nhat-nguoi-yeu/` |
| Hoa Tặng Vợ | `/hoa-sinh-nhat-tang-vo/` |
| Hoa Tặng Nam | `/hoa-sinh-nhat-cho-nam/` |

### Cấu trúc sản phẩm (Product Schema)
Mỗi sản phẩm bao gồm:
- Tên sản phẩm (VD: "Muse Tulip Rose Pink")
- Giá gốc + Giá khuyến mãi (VD: 750,000₫ → 680,000₫)
- Hình ảnh (nhiều ảnh gallery)
- Mô tả dịp phù hợp: Sinh nhật, Kỷ Niệm, Hẹn Hò, Tỏ Tình...
- Size: Ngang x Cao
- Thành phần hoa chi tiết (loại hoa + số lượng)
- Bài viết SEO mô tả dài
- Sản phẩm liên quan
- Nút "Đặt Qua Zalo"

### Tính năng hiện tại
- Tìm kiếm sản phẩm
- Đăng nhập / Tài khoản khách hàng
- Đặt hoa online (chủ yếu qua Zalo + WooCommerce cart)
- Hotline + Zalo floating buttons
- Newsletter
- Breadcrumb navigation

---

## 2. Tech Stack

| Layer | Technology | Lý do |
|---|---|---|
| **Frontend** | Next.js 15 (App Router) | SSR/SSG chuẩn SEO, ISR cho content động |
| **Styling** | TailwindCSS 4 | Utility-first, responsive nhanh |
| **UI Components** | shadcn/ui | Accessible, customizable, modern |
| **Icons** | Lucide React | Đi kèm shadcn/ui |
| **Backend/DB** | PocketBase | Self-hosted BaaS, REST API, admin UI, auth, file storage |
| **Image Optimization** | Next.js Image + PocketBase file storage | Lazy load, WebP auto-convert |
| **Deployment** | Vercel (Frontend) + VPS (PocketBase) | Edge caching, fast TTFB |
| **SEO** | next-sitemap + JSON-LD structured data | Google-friendly |

---

## 3. Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────┐
│                   Vercel                     │
│  ┌───────────────────────────────────────┐  │
│  │         Next.js 15 (App Router)       │  │
│  │  ┌─────────┐ ┌──────────┐ ┌────────┐ │  │
│  │  │  Pages   │ │ API      │ │ Static │ │  │
│  │  │  (SSR/   │ │ Routes   │ │ Assets │ │  │
│  │  │   ISR)   │ │          │ │        │ │  │
│  │  └─────────┘ └──────────┘ └────────┘ │  │
│  └───────────────────────────────────────┘  │
│                      │                       │
│                      ▼                       │
│              PocketBase SDK                  │
└──────────────────────┬──────────────────────┘
                       │ REST API
                       ▼
┌──────────────────────────────────────────────┐
│              VPS (PocketBase)                │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐ │
│  │ SQLite   │ │  Auth    │ │ File Storage│ │
│  │ Database │ │  System  │ │  (Images)   │ │
│  └──────────┘ └──────────┘ └─────────────┘ │
│  ┌──────────────────────────────────────┐   │
│  │         Admin Dashboard UI           │   │
│  └──────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

---

## 4. PocketBase Collections (Database Schema)

### `categories`
| Field | Type | Description |
|---|---|---|
| id | auto | PK |
| name | text | Tên danh mục (VD: "Hoa Sinh Nhật") |
| slug | text | URL-friendly slug |
| description | text | Mô tả SEO |
| parent | relation → categories | Danh mục cha (nullable) |
| image | file | Ảnh đại diện |
| type | select | `occasion` / `style` / `recipient` / `flower_type` |
| sort_order | number | Thứ tự hiển thị |
| seo_title | text | Meta title |
| seo_description | text | Meta description |
| is_active | bool | Hiển thị/ẩn |

### `products`
| Field | Type | Description |
|---|---|---|
| id | auto | PK |
| name | text | Tên sản phẩm |
| slug | text | URL slug |
| price | number | Giá gốc (VND) |
| sale_price | number | Giá khuyến mãi (nullable) |
| images | file[] | Gallery ảnh (multi-file) |
| thumbnail | file | Ảnh chính |
| short_description | text | Mô tả ngắn (bao gồm size, thành phần hoa) |
| description | editor | Mô tả chi tiết (rich text) |
| occasions | text[] | Phù hợp: ["Sinh nhật", "Hẹn Hò"...] |
| categories | relation[] → categories | Đa danh mục |
| is_featured | bool | Sản phẩm nổi bật |
| is_best_seller | bool | Best seller |
| is_active | bool | Hiển thị/ẩn |
| seo_title | text | Meta title |
| seo_description | text | Meta description |
| view_count | number | Lượt xem |
| created | auto | Ngày tạo |

### `orders`
| Field | Type | Description |
|---|---|---|
| id | auto | PK |
| order_code | text | Mã đơn hàng (auto-gen) |
| customer_name | text | Tên khách |
| customer_phone | text | SĐT |
| customer_email | text | Email (optional) |
| recipient_name | text | Tên người nhận |
| recipient_phone | text | SĐT người nhận |
| recipient_address | text | Địa chỉ giao |
| delivery_date | date | Ngày giao |
| delivery_time | text | Khung giờ giao |
| items | json | `[{product_id, name, price, quantity}]` |
| subtotal | number | Tổng tiền hàng |
| total | number | Tổng thanh toán |
| note | text | Ghi chú (thiệp, lời nhắn) |
| status | select | `pending` / `confirmed` / `delivering` / `completed` / `cancelled` |
| payment_method | select | `cod` / `bank_transfer` / `momo` |

### `banners`
| Field | Type | Description |
|---|---|---|
| id | auto | PK |
| title | text | Tiêu đề |
| image | file | Ảnh banner |
| link | url | Link đến |
| sort_order | number | Thứ tự |
| is_active | bool | Hiển thị/ẩn |
| position | select | `hero` / `promo` / `category` |

### `reviews`
| Field | Type | Description |
|---|---|---|
| id | auto | PK |
| product | relation → products | Sản phẩm |
| customer_name | text | Tên khách |
| rating | number | 1-5 sao |
| comment | text | Nội dung đánh giá |
| images | file[] | Ảnh review |
| is_approved | bool | Đã duyệt |

### `settings`
| Field | Type | Description |
|---|---|---|
| id | auto | PK |
| key | text | VD: "phone", "zalo", "address" |
| value | text | Giá trị |

---

## 5. Cấu Trúc Thư Mục Next.js

```
shophoa/
├── app/
│   ├── layout.tsx                    # Root layout (Header, Footer, Zalo button)
│   ├── page.tsx                      # Trang chủ
│   ├── loading.tsx                   # Loading skeleton
│   ├── not-found.tsx                 # 404
│   │
│   ├── (shop)/                       # Route group cho shop
│   │   ├── [slug]/                   # Dynamic: danh mục hoặc sản phẩm
│   │   │   └── page.tsx              # Category listing / Product detail
│   │   ├── san-pham/
│   │   │   └── [slug]/
│   │   │       └── page.tsx          # Product detail page
│   │   └── tim-kiem/
│   │       └── page.tsx              # Search results
│   │
│   ├── dat-hoa/
│   │   └── page.tsx                  # Checkout / Đặt hoa
│   │
│   ├── gio-hang/
│   │   └── page.tsx                  # Cart page
│   │
│   ├── my-account/
│   │   ├── page.tsx                  # Account dashboard
│   │   └── don-hang/
│   │       └── page.tsx              # Order history
│   │
│   ├── gioi-thieu/
│   │   └── page.tsx                  # About us
│   │
│   ├── lien-he/
│   │   └── page.tsx                  # Contact
│   │
│   ├── chinh-sach-bao-mat/
│   │   └── page.tsx                  # Privacy policy
│   │
│   └── api/                          # API routes (proxy to PocketBase if needed)
│       └── revalidate/
│           └── route.ts              # On-demand ISR revalidation
│
├── components/
│   ├── ui/                           # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── skeleton.tsx
│   │   ├── badge.tsx
│   │   ├── carousel.tsx
│   │   ├── sheet.tsx
│   │   ├── breadcrumb.tsx
│   │   ├── accordion.tsx
│   │   └── ...
│   │
│   ├── layout/
│   │   ├── header.tsx                # Mega menu navigation
│   │   ├── footer.tsx                # Footer with links, contact info
│   │   ├── mobile-nav.tsx            # Mobile hamburger menu
│   │   ├── search-dialog.tsx         # Search overlay
│   │   └── zalo-float.tsx            # Floating Zalo + Hotline buttons
│   │
│   ├── home/
│   │   ├── hero-banner.tsx           # Hero carousel (Tulip, Hồng, Mica Box)
│   │   ├── occasion-tabs.tsx         # Tabs: Sinh Nhật, Tốt Nghiệp, Khai Trương...
│   │   ├── product-section.tsx       # Section hiển thị sản phẩm theo collection
│   │   ├── flower-type-filter.tsx    # Filter theo loại hoa
│   │   ├── testimonials.tsx          # Đánh giá khách hàng
│   │   ├── why-choose-us.tsx         # 3 cam kết
│   │   └── cta-banner.tsx            # Call-to-action banner
│   │
│   ├── product/
│   │   ├── product-card.tsx          # Card sản phẩm (ảnh, tên, giá gốc, giá sale)
│   │   ├── product-grid.tsx          # Grid responsive
│   │   ├── product-gallery.tsx       # Image gallery + zoom
│   │   ├── product-info.tsx          # Thông tin chi tiết (size, thành phần)
│   │   ├── product-description.tsx   # Bài viết SEO
│   │   ├── related-products.tsx      # Sản phẩm liên quan
│   │   ├── price-display.tsx         # Hiển thị giá gốc/sale
│   │   └── add-to-cart-button.tsx    # Nút thêm vào giỏ / đặt qua Zalo
│   │
│   ├── category/
│   │   ├── category-header.tsx       # Banner + title danh mục
│   │   ├── filter-sidebar.tsx        # Bộ lọc (giá, loại hoa, kiểu dáng)
│   │   ├── sort-select.tsx           # Sắp xếp (mới nhất, giá, bán chạy)
│   │   └── pagination.tsx            # Phân trang
│   │
│   ├── cart/
│   │   ├── cart-item.tsx
│   │   └── cart-summary.tsx
│   │
│   ├── checkout/
│   │   ├── checkout-form.tsx         # Form đặt hoa
│   │   ├── delivery-info.tsx         # Thông tin giao hàng
│   │   └── order-summary.tsx         # Tóm tắt đơn hàng
│   │
├── lib/
│   ├── pocketbase.ts                 # PocketBase client singleton
│   ├── types.ts                      # TypeScript interfaces
│   ├── utils.ts                      # Utility functions (format price, etc.)
│   ├── constants.ts                  # Constants (site info, nav items)
│   └── seo.ts                        # SEO helpers (JSON-LD generators)
│
├── hooks/
│   ├── use-cart.ts                    # Cart state (zustand/context)
│   ├── use-search.ts                 # Search hook
│   └── use-media-query.ts            # Responsive hook
│
├── stores/
│   └── cart-store.ts                 # Zustand store cho giỏ hàng
│
├── public/
│   ├── images/
│   ├── favicon.ico
│   └── robots.txt
│
├── styles/
│   └── globals.css                   # Tailwind directives + custom CSS
│
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── components.json                   # shadcn/ui config
└── next-sitemap.config.js            # Sitemap generator
```

---

## 6. Chiến Lược SEO

### Technical SEO
- **SSR/ISR** cho tất cả product pages & category pages (revalidate: 3600s)
- **Static Generation** cho policy pages
- **Metadata API** (Next.js 15) cho dynamic meta tags mỗi page
- **Sitemap** tự động generate qua `next-sitemap`
- **robots.txt** cấu hình đúng
- **Canonical URLs** cho mỗi page

### Structured Data (JSON-LD)
- **Organization** schema (trang chủ)
- **Product** schema (trang sản phẩm - giá, availability, review)
- **BreadcrumbList** schema (mọi trang)
- **LocalBusiness** schema (2 cửa hàng)
- **FAQPage** schema (nếu có FAQ)
- **ItemList** schema (category pages)

### On-page SEO
- URL slugs tiếng Việt không dấu, SEO-friendly
- H1 duy nhất mỗi trang
- Alt text cho tất cả hình ảnh
- Internal linking giữa sản phẩm → danh mục
- Breadcrumb navigation
- Open Graph + Twitter Card meta tags

### Performance
- **Next/Image** với lazy loading, WebP, responsive sizes
- **Font optimization** (next/font)
- **Code splitting** tự động
- **Prefetching** cho navigation links
- Target: **Core Web Vitals** xanh (LCP < 2.5s, FID < 100ms, CLS < 0.1)

---

## 7. Tính Năng Chính

### MVP (Phase 1)
1. Trang chủ với hero banner, collections, sản phẩm nổi bật
2. Danh mục sản phẩm (filter, sort, pagination)
3. Chi tiết sản phẩm (gallery, info, SEO content, related)
4. Giỏ hàng + Checkout form
5. Tìm kiếm sản phẩm
6. Responsive mobile-first
7. Zalo + Hotline floating buttons
8. SEO hoàn chỉnh (metadata, JSON-LD, sitemap)
9. PocketBase Admin để quản lý content

### Phase 2
1. Authentication (đăng ký/đăng nhập)
2. Lịch sử đơn hàng
3. Hệ thống đánh giá sản phẩm
4. Thông báo Zalo/Email khi có đơn mới
6. Wishlist / Yêu thích
7. So sánh sản phẩm

### Phase 3
1. Tích hợp thanh toán (VNPay, MoMo, ZaloPay)
2. Tracking đơn hàng realtime
3. Analytics dashboard
4. PWA (Progressive Web App)
5. Multi-language (nếu cần)

---

## 8. UI/UX Design Direction

### Color Palette
- **Primary**: Rose/Pink (#E11D48 → rose-600) - Tone chủ đạo hoa hồng
- **Secondary**: Warm Cream (#FFF7ED → orange-50) - Nền ấm
- **Accent**: Sage Green (#6B8E6B) - Cành lá, thiên nhiên
- **Neutral**: Warm Gray tones
- **Text**: Dark charcoal (#1C1917 → stone-950)

### Typography
- **Heading**: Playfair Display (serif, sang trọng)
- **Body**: Inter (clean, readable)

### Design Principles
- Phong cách **Garden Mix Vintage** (theo xu hướng 2026 của shop)
- Layout thoáng, nhiều whitespace
- Ảnh sản phẩm lớn, chất lượng cao
- Hover effects mượt mà
- Mobile-first responsive
- Mega menu cho navigation phức tạp
- Quick view product modal

---

## 9. Thứ Tự Triển Khai

### Step 1: Setup Project
- Init Next.js 15 + TypeScript
- Setup TailwindCSS 4
- Install & config shadcn/ui
- Setup PocketBase client
- Cấu trúc thư mục

### Step 2: PocketBase Schema
- Tạo tất cả collections
- Seed data mẫu
- Config API rules & auth

### Step 3: Layout & Navigation
- Header (mega menu, search, cart icon)
- Footer
- Mobile navigation
- Floating buttons (Zalo, Hotline)

### Step 4: Trang Chủ
- Hero banner carousel
- Product sections by collection
- Occasion tabs
- Why choose us
- Testimonials

### Step 5: Products
- Category listing page (filter, sort, pagination)
- Product detail page (gallery, info, SEO content)
- Related products
- Search results page

### Step 6: Cart & Checkout
- Cart state management (Zustand)
- Cart page
- Checkout form
- Order submission to PocketBase

### Step 7: SEO & Polish
- All metadata
- JSON-LD schemas
- Sitemap generation
- Performance optimization
- Testing & QA

---

## 10. Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "pocketbase": "^0.25.0",
    "zustand": "^5.0.0",
    "lucide-react": "latest",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest",
    "embla-carousel-react": "latest",
    "next-sitemap": "latest",
    "zod": "latest",
    "react-hook-form": "latest",
    "@hookform/resolvers": "latest"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "latest",
    "@types/react": "latest",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "latest",
    "postcss": "latest",
    "eslint": "latest",
    "eslint-config-next": "latest"
  }
}
```
