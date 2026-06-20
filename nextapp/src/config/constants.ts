import { ZALO_PHONE, zaloLink } from "./third-party";

export const SITE_NAME = "Tiệm Hoa Nhà Tình";
export const SITE_DESCRIPTION =
  "Tiệm Hoa Nhà Tình – Shop hoa tươi TPHCM uy tín. Đặt hoa sinh nhật, khai trương, tốt nghiệp. Giao hỏa tốc 60 phút nội thành, hoa giống mẫu 100%.";

export const CONTACT = {
  phone: ZALO_PHONE,
  phoneDisplay: "089.990.90.06",
  zalo: zaloLink(ZALO_PHONE),
  email: "cskh@tiemhoanhatinh.com",
  addresses: [
    "152 Trường Sa, Phường 1 , Quận Bình Thạnh, TPHCM",
   
  ],
};

// Toạ độ cơ sở chính (Google Business Profile "Cửa Hàng Hoa 24/24")
export const GEO = { lat: 10.7940708, lng: 106.6973445 };

// Các quận nội thành giao hỏa tốc 60 phút — dùng cho schema.org areaServed & llms.txt
export const SERVICE_DISTRICTS = [
  "Quận 1",
  "Quận 3",
  "Quận 5",
  "Quận 10",
  "Quận 11",
  "Quận Phú Nhuận",
  "Quận Bình Thạnh",
  "Quận Tân Bình",
  "Quận Gò Vấp",
];

export const NAV_ITEMS = [
  {
    label: "Hoa Sinh Nhật",
    href: "/hoa-sinh-nhat",
    children: [
      { label: "Bó Hoa Sinh Nhật", href: "/bo-hoa-sinh-nhat" },
      { label: "Lẵng Hoa Sinh Nhật", href: "/lang-hoa-sinh-nhat" },
      { label: "Giỏ Hoa Sinh Nhật", href: "/gio-hoa-sinh-nhat" },
      { label: "Kệ Hoa Sinh Nhật", href: "/ke-hoa-sinh-nhat" },
    ],
  },
  {
    label: "Hoa Khai Trương",
    href: "/hoa-khai-truong",
    children: [
      { label: "Kệ Hoa Khai Trương", href: "/ke-hoa-khai-truong" },
      { label: "Lẵng Hoa Khai Trương", href: "/lang-hoa-khai-truong" },
      { label: "Giỏ Hoa Khai Trương", href: "/gio-hoa-khai-truong" },
      { label: "Kệ Hoa Mini", href: "/ke-hoa-mini" },
    ],
  },
  {
    label: "Hoa Tốt Nghiệp",
    href: "/hoa-tot-nghiep",
    children: [
      { label: "Hoa Hướng Dương TN", href: "/bo-hoa-huong-duong-tot-nghiep" },
      { label: "Hoa Tốt Nghiệp Nữ", href: "/hoa-tot-nghiep-cho-nu" },
      { label: "Hoa Tốt Nghiệp Nam", href: "/hoa-tot-nghiep-cho-nam" },
    ],
  },
  {
    label: "Hoa Bó",
    href: "/bo-hoa-tuoi",
    children: [
      { label: "Best Seller", href: "/bo-hoa-tuoi" },
      { label: "Garden Mix", href: "/hoa-bo-garden-mix" },
      { label: "Hoa Tulip", href: "/bo-hoa-tulip" },
      { label: "Hoa Hướng Dương", href: "/bo-hoa-huong-duong" },
      { label: "Hoa Hồng", href: "/bo-hoa-hong" },
      { label: "Sophia Collection", href: "/hoa-hong-sophia" },
      { label: "Hoa Cao Cấp", href: "/bo-hoa-cao-cap" },
    ],
  },
  { label: "Hộp Hoa Mica", href: "/hop-hoa-mica" },
  {
    label: "Dịp Tặng",
    href: "/hoa-theo-chu-de",
    children: [
      { label: "Hoa Tình Yêu", href: "/hoa-tinh-yeu" },
      { label: "Hoa Valentine 14/2", href: "/hoa-valentine-14-02" },
      { label: "Hoa 8/3", href: "/hoa-8-thang-3" },
      { label: "Hoa 20/10", href: "/hoa-20-thang-10" },
      { label: "Hoa 20/11", href: "/hoa-20-thang-11" },
      { label: "Hoa Chia Buồn", href: "/tong-hop-hoa-chia-buon" },
      { label: "Hoa Gấu Bông", href: "/bo-hoa-gau-bong" },
    ],
  },
  { label: "Blog", href: "/blog" },
];
