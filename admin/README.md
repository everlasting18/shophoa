# Shophoa Admin

Trang quản trị cho cửa hàng hoa **Vườn Hoa Tươi**. Xây dựng bằng Vite + React + TypeScript, kết nối PocketBase, deploy lên Cloudflare Pages.

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

Tạo file `.env` ở thư mục gốc:

```env
VITE_POCKETBASE_URL=https://your-pocketbase-url.com
VITE_SHOP_URL=https://vuonhoatuoi.vn   # tuỳ chọn, dùng để revalidate cache
```

---

## Lệnh thường dùng

```bash
npm run dev          # Dev server tại localhost:5173
npm run build        # Type-check + build production → dist/
npm run preview      # Xem thử bản build production
npm run deploy:cf    # Build + deploy lên Cloudflare Pages
npx tsc --noEmit     # Chỉ kiểm tra TypeScript, không build
```

---

## Tài khoản đăng nhập

Hệ thống thử đăng nhập theo thứ tự:

1. **`_superusers`** (PocketBase superadmin) → role `owner`
2. **`users`** collection → role lấy từ trường `users.role` (`owner` | `staff`)

| Role | Quyền truy cập |
|------|----------------|
| `owner` | Toàn bộ (Dashboard, Đơn hàng, Sản phẩm, Danh mục, Banners, Cài đặt) |
| `staff` | Chỉ Dashboard, Đơn hàng, Sản phẩm |

Auth token được lưu vào `localStorage` với key `vht-admin-auth`.

---

## Cấu trúc dự án

```
src/
├── routes/                 # File-based routing (TanStack Router)
│   ├── __root.tsx          # Root layout + QueryClient
│   ├── login.tsx           # Trang đăng nhập
│   ├── _auth.tsx           # Auth guard + AdminLayout
│   └── _auth/
│       ├── index.tsx       # Dashboard (doanh thu, đơn hàng gần đây)
│       ├── orders/
│       │   ├── index.tsx   # Danh sách đơn hàng (lọc theo status, ngày, tìm kiếm)
│       │   └── $id.tsx     # Chi tiết đơn hàng
│       ├── products/
│       │   ├── index.tsx   # Danh sách sản phẩm
│       │   └── $id.tsx     # Form thêm/sửa sản phẩm
│       ├── categories.tsx  # Quản lý danh mục (owner only)
│       ├── banners.tsx     # Quản lý banner (owner only)
│       └── settings.tsx    # Cài đặt chung (owner only)
├── features/               # Logic nghiệp vụ, mỗi feature có api.ts
│   ├── orders/
│   ├── products/
│   ├── categories/
│   ├── banners/
│   └── settings/
├── components/
│   ├── layout/             # AdminLayout, sidebar, mobile nav
│   └── ui/                 # RichEditor (TipTap), shared components
├── stores/
│   └── auth.ts             # Zustand auth store
├── lib/
│   ├── pb.ts               # PocketBase singleton
│   ├── config.ts           # PHOTO_BASE, SHOP_URL, zaloLink
│   ├── media.ts            # Helper lấy URL ảnh từ PocketBase
│   └── utils.ts            # formatPrice, generateSlug, cn, useDebounce
└── schema/
    └── pocketbase.ts       # TypeScript interfaces cho các collection
```

---

## PocketBase Collections

| Collection | Mô tả |
|------------|-------|
| `orders` | Đơn hàng — `order_code`, `customer_*`, `recipient_*`, `items` (JSON), `subtotal`, `total`, `status`, `payment_method`, `delivery_date`, `delivery_time`, `note` |
| `products` | Sản phẩm — `name`, `slug`, `price`, `sale_price`, `thumbnail`, `images[]`, `short_description`, `description`, `categories[]`, `occasions[]`, `is_active`, `is_featured`, `is_best_seller` |
| `categories` | Danh mục — `name`, `slug`, `parent`, `sort_order`, `is_active` |
| `banners` | Banner trang chủ — `image`, `link`, `sort_order`, `is_active` |
| `settings` | Cài đặt key-value — `key`, `value` |
| `media` | File ảnh upload từ editor — `file` (type: File) |

---

## Tính năng chính

### Đơn hàng
- Danh sách phân trang (10/trang), lọc theo trạng thái / ngày / tìm kiếm
- Chi tiết đơn: thông tin người đặt, người nhận, sản phẩm, giá, thanh toán
- Xác nhận hoặc huỷ đơn trực tiếp
- Nút nhắn Zalo nhanh cho người đặt / người nhận
- Realtime: tự động cập nhật khi có đơn mới (PocketBase subscribe), hiển thị toast thông báo

### Sản phẩm
- Form thêm/sửa: thumbnail + tối đa 4 ảnh phụ, mô tả ngắn (max 150 ký tự), mô tả chi tiết (TipTap rich editor)
- Toggle hiển thị/ẩn trực tiếp từ danh sách
- Slug tự tạo khi thêm mới, giữ nguyên khi chỉnh sửa

### Danh mục
- Cấu trúc cây 2 cấp (cha / con)
- Kéo thả để sắp xếp trong cùng cấp (dùng @dnd-kit, hoạt động trên cả mobile touch)
- Đổi danh mục cha qua dialog chỉnh sửa

### Banners
- Upload ảnh, gắn link tuỳ chọn
- Kéo thả để sắp xếp thứ tự hiển thị

### Rich Editor (TipTap)
- Toolbar: H2, H3, Bold, Italic, Bullet list, Numbered list, Chèn ảnh, Undo/Redo
- Upload ảnh trực tiếp lên PocketBase collection `media`
- Bundle ~380KB (gzip ~119KB), lazy-loaded

---

## Cache Revalidation

Mỗi khi thay đổi sản phẩm / danh mục, admin tự động gọi `POST ${SHOP_URL}/api/revalidate` để purge Cloudflare cache cho các path liên quan:

- Sản phẩm: `/san-pham/{slug}`, `/san-pham`, `/`
- Danh mục: `/{slug}`, `/`

---

## Deploy lên Cloudflare Pages

```bash
npm run deploy:cf
```

Yêu cầu:
- Đã đăng nhập wrangler: `wrangler login`
- Project `shophoa-admin` tồn tại trên Cloudflare Pages
- Env var `VITE_POCKETBASE_URL` được set trong Cloudflare Pages → Settings → Environment variables

File `public/_redirects` xử lý client-side routing:

```
/* /index.html 200
```
