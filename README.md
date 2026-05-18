# Shophoa — Monorepo

Hệ thống bán hoa tươi online cho **Tiệm Hoa Nhà Tình** (TPHCM). Gồm 2 project độc lập trong cùng một repo.

```
shophoa/
├── nextapp/    # Website bán hàng (storefront) — vuonhoatuoi.vn
└── admin/      # Trang quản trị nội bộ
```

---

## Kiến trúc tổng thể

```
                        ┌─────────────────────────────┐
                        │         PocketBase           │
                        │   (Database + File Storage)  │
                        │   Self-hosted on PB Cloud    │
                        └────────────┬────────────────-┘
                                     │  REST API + SDK
                    ┌────────────────┼────────────────┐
                    │                                  │
          ┌─────────▼──────────┐           ┌──────────▼──────────┐
          │      nextapp        │           │        admin         │
          │   Next.js 16        │           │   Vite + React 19   │
          │   SSR / ISR         │           │   SPA               │
          │   Cloudflare Pages  │           │   Cloudflare Pages  │
          └─────────┬──────────┘           └──────────┬──────────┘
                    │                                  │
             Khách hàng                       Owner / Staff nội bộ
```

- **PocketBase** là nguồn dữ liệu duy nhất cho cả 2 app — không có backend riêng
- **nextapp** phục vụ khách hàng: đọc dữ liệu, tạo đơn hàng
- **admin** phục vụ nội bộ: quản lý toàn bộ dữ liệu
- Khi admin thay đổi sản phẩm/danh mục, gọi `POST nextapp/api/revalidate` để purge Cloudflare edge cache ngay lập tức

---

## nextapp — Storefront

**Website:** https://vuonhoatuoi.vn

### Stack
| | |
|---|---|
| Framework | Next.js 16 App Router |
| Styling | Tailwind CSS v4 + shadcn/ui + @base-ui/react |
| Font | Baloo 2 (Google Fonts, Vietnamese subset) |
| State | Zustand 5 — cart, persist `localStorage` key `vuonhoatuoi-cart` |
| Form | React Hook Form + Zod |
| Carousel | Embla Carousel |
| Image CDN | Cloudflare Image Resizing (`/cdn-cgi/image/...`) |
| Notification | Discord + Lark (thông báo đơn mới, song song) |
| Deploy | Cloudflare Pages via `@opennextjs/cloudflare` |

### Các trang
| Route | Mô tả | Render |
|---|---|---|
| `/` | Trang chủ: banner, best sellers, lưới danh mục | ISR 3600s |
| `/[slug]` | Trang danh mục: lọc, sắp xếp, phân trang 24 SP | ISR 3600s |
| `/san-pham` | Tất cả sản phẩm | ISR 3600s |
| `/san-pham/[slug]` | Chi tiết sản phẩm: gallery, thêm giỏ, sản phẩm liên quan | ISR 3600s |
| `/tim-kiem` | Tìm kiếm full-text qua PocketBase | SSR (force-dynamic) |
| `/gio-hang` | Giỏ hàng | Client (noindex) |
| `/dat-hoa` | Checkout: form, tính phí ship, đặt hàng | Client (noindex) |
| `/dat-hoa/cam-on` | Xác nhận đơn hàng thành công | Client |
| `/gioi-thieu` | Giới thiệu | Static |
| `/lien-he` | Liên hệ + Google Maps | Static |
| `/chinh-sach-bao-mat` | Chính sách bảo mật | Static |

### API Routes
| Endpoint | Chức năng |
|---|---|
| `GET /api/navigation` | Navigation tree từ PocketBase categories |
| `GET /api/settings` | Cài đặt công khai (phone, địa chỉ, giờ mở cửa) |
| `POST /api/revalidate` | Purge ISR cache theo `{ path }` — gọi từ admin |
| `POST /api/notify/order` | Gửi thông báo Discord + Lark song song khi có đơn mới |
| `POST /api/verify-turnstile` | Verify Cloudflare Turnstile token chống spam |
| `POST /api/alert-error` | Forward lỗi client-side về Discord error channel |

### Luồng đặt hàng
1. Khách thêm sản phẩm vào giỏ (Zustand, persist localStorage)
2. Vào `/dat-hoa`, chọn tỉnh/quận → hệ thống tự tính phí ship theo zone
3. Form tự lưu `sessionStorage` mỗi 500ms (tránh mất khi back)
4. Turnstile verify ngầm (nếu có key) → xác nhận người thật trước khi submit
5. Submit → tạo record `orders` trực tiếp qua PocketBase SDK
6. Fire-and-forget `POST /api/notify/order` → gửi song song Discord embed + Lark Interactive Card (kèm ảnh sản phẩm)
7. Redirect `/dat-hoa/cam-on?code=<orderCode>`, xoá giỏ hàng

### Phí giao hàng (TPHCM)
| Khu vực | Phí |
|---|---|
| Quận 1, 3, 5, 10 | 20.000đ |
| Quận 4, Phú Nhuận | 30.000đ |
| Quận 6, 7, 8, 11, Bình Thạnh | 40.000đ |
| Tân Bình, Bình Tân, Tân Phú, Gò Vấp | 60.000đ |
| Quận 2 | 50.000đ |
| Quận 9, 12, Nhà Bè, Bình Chánh, Hóc Môn, Thủ Đức | 80.000đ |
| Lấy tại cửa hàng | Miễn phí |

### SEO
- Mỗi trang server có `metadata` riêng (title, description, canonical, OG, Twitter Card)
- JSON-LD: `LocalBusiness` (trang chủ), `Product` (chi tiết SP), `BreadcrumbList`, `ItemList` (danh mục)
- Dynamic sitemap từ PocketBase (`/sitemap.xml`)
- `/gio-hang` và `/dat-hoa` có `robots: noindex`

### Cài đặt & chạy
```bash
cd nextapp
npm install
cp .env.example .env.local   # điền NEXT_PUBLIC_POCKETBASE_URL
npm run dev                  # localhost:3000
npm run deploy:cf            # build + deploy Cloudflare Pages
```

**Biến môi trường:**
```env
NEXT_PUBLIC_POCKETBASE_URL=https://your-pocketbase-url.com   # bắt buộc
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...     # tuỳ chọn — thông báo đơn mới
DISCORD_ERROR_WEBHOOK_URL=https://discord.com/api/webhooks/... # tuỳ chọn — cảnh báo lỗi hệ thống
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA      # tuỳ chọn (test key cho dev)
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA     # tuỳ chọn (test key cho dev)
LARK_WEBHOOK_URL=https://open.larksuite.com/open-apis/bot/v2/hook/... # tuỳ chọn — thông báo đơn mới
LARK_APP_ID=cli_xxx                                          # tuỳ chọn — cần để gửi ảnh qua Lark
LARK_APP_SECRET=xxx                                          # tuỳ chọn — cần để gửi ảnh qua Lark
```

→ Chi tiết: [nextapp/README.md](nextapp/README.md)

---

## admin — Trang quản trị

### Stack
| | |
|---|---|
| Framework | Vite 8 + React 19 + TypeScript |
| Routing | TanStack Router v1 (file-based, type-safe) |
| Data fetching | TanStack Query v5 |
| Styling | Tailwind CSS v4 (stone palette) |
| State | Zustand 5 — auth, persist `localStorage` key `vht-admin-auth` |
| Drag & drop | @dnd-kit (Pointer Events API — hoạt động cả mobile touch) |
| Rich editor | TipTap (StarterKit + Image + Placeholder, ~380KB gzip ~119KB) |
| Deploy | Cloudflare Pages (static SPA) |

### Phân quyền
| Role | Nguồn | Quyền truy cập |
|---|---|---|
| `owner` | PocketBase `_superusers` hoặc `users.role = "owner"` | Toàn bộ |
| `staff` | PocketBase `users.role = "staff"` | Dashboard, Đơn hàng, Sản phẩm |

### Tính năng
**Dashboard** — Doanh thu tháng, số đơn theo trạng thái, danh sách đơn mới nhất

**Đơn hàng**
- Danh sách phân trang (10/trang), lọc theo trạng thái / khoảng ngày / tìm kiếm
- Chi tiết: thông tin người đặt, người nhận, sản phẩm, tổng tiền, ghi chú
- Xác nhận hoặc huỷ đơn trực tiếp
- Nút nhắn Zalo nhanh (người đặt & người nhận)
- Realtime: PocketBase subscribe tự cập nhật + toast thông báo khi có đơn mới

**Sản phẩm**
- Danh sách tìm kiếm + lọc active/inactive, responsive (card mobile / table desktop)
- Form thêm/sửa: thumbnail + tối đa 4 ảnh phụ, mô tả ngắn (max 150 ký tự)
- Rich editor TipTap cho mô tả chi tiết — upload ảnh lên PocketBase `media`
- Slug tự tạo khi thêm mới, giữ nguyên khi chỉnh sửa
- Toggle hiển thị/ẩn trực tiếp từ danh sách

**Danh mục** — Cấu trúc cây 2 cấp, kéo thả sắp xếp trong cùng cấp, đổi cha qua dialog

**Banner** — Upload ảnh, gắn link, kéo thả sắp xếp thứ tự

**Cài đặt** — Key-value settings từ PocketBase (phone, địa chỉ, giờ mở cửa...)

### Cache revalidation
Sau mỗi mutation (sản phẩm/danh mục), admin gọi `POST ${SHOP_URL}/api/revalidate { path }` để purge Cloudflare edge cache ngay lập tức cho các path liên quan.

### Cài đặt & chạy
```bash
cd admin
npm install
cp .env.example .env        # điền VITE_POCKETBASE_URL
npm run dev                 # localhost:5173
npm run deploy:cf           # build + deploy Cloudflare Pages
```

**Biến môi trường:**
```env
VITE_POCKETBASE_URL=https://your-pocketbase-url.com   # bắt buộc
VITE_SHOP_URL=https://vuonhoatuoi.vn                  # tuỳ chọn
```

→ Chi tiết: [admin/README.md](admin/README.md)

---

## PocketBase Collections

| Collection | Ai đọc | Ai ghi | Fields chính |
|---|---|---|---|
| `products` | nextapp, admin | admin | `name`, `slug`, `price`, `sale_price`, `thumbnail`, `images[]`, `description`, `categories[]`, `occasions[]`, `is_active`, `is_featured`, `is_best_seller` |
| `categories` | nextapp, admin | admin | `name`, `slug`, `parent`, `sort_order`, `is_active` |
| `orders` | admin | nextapp (tạo mới) | `order_code`, `customer_*`, `recipient_*`, `delivery_date/time`, `items` (JSON), `subtotal`, `total`, `status`, `payment_method` |
| `banners` | nextapp | admin | `image`, `link`, `sort_order`, `is_active` |
| `settings` | nextapp, admin | admin | `key`, `value` |
| `media` | nextapp (ảnh editor) | admin (upload) | `file` |
| `users` | — | — | Tài khoản staff đăng nhập admin |
| `_superusers` | — | — | Tài khoản owner (PocketBase native) |

---

## Tuỳ chỉnh giao diện (nextapp)

| Muốn đổi | File | Chỗ cụ thể |
|---|---|---|
| Màu sắc chủ đạo | `nextapp/src/app/globals.css` | `:root` CSS variables (`--primary`, `--background`...) |
| Font chữ | `nextapp/src/app/layout.tsx` | Thay `Baloo_2` bằng font khác từ `next/font/google` |
| Tên shop, liên hệ | `nextapp/src/config/constants.ts` | `SITE_NAME`, `CONTACT` |
| Menu điều hướng | `nextapp/src/config/constants.ts` | `NAV_ITEMS` |
| Phí ship / khu vực | `nextapp/src/config/shipping.ts` | `SHIPPING_ZONES`, `DISTRICT_ZONE_MAP` |

---

## Git workflow

```bash
# Từ thư mục gốc /shophoa/
git add .
git commit -m "message"
git push
```

Deploy 2 project hoàn toàn độc lập — thay đổi `admin/` không ảnh hưởng `nextapp/` và ngược lại.
