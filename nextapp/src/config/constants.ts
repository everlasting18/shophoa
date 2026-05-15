import { ZALO_PHONE, zaloLink } from "./third-party";

export const SITE_NAME = "Tiệm hoa nhà tình";
export const SITE_DESCRIPTION =
  "Tiệm hoa nhà tình - Shop hoa tươi TPHCM phong cách hiện đại. Chuyên đặt hoa tươi sinh nhật, khai trương. Dịch vụ điện hoa hỏa tốc 60p.";

export const CONTACT = {
  phone: ZALO_PHONE,
  phoneDisplay: "0976.491.322",
  zalo: zaloLink(ZALO_PHONE),
  email: "cskh@vuonhoatuoi.vn",
  addresses: [
    "183/37 Đường 3 Tháng 2, Phường Vườn Lài, TPHCM",
    "704/19 Nguyễn Đình Chiểu, Phường 1, Quận 3, TPHCM",
  ],
};

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
];
