/**
 * Script: Seed data mẫu cho Shop Hoa Tươi
 * Chạy: node scripts/seed-data.mjs <admin-email> <admin-password>
 */

import PocketBase from "pocketbase";

const PB_URL = "https://rfmzqjlurgw0s6i.fbjc.pocketbasecloud.com";
const [, , adminEmail, adminPassword] = process.argv;

if (!adminEmail || !adminPassword) {
  console.error("Usage: node scripts/seed-data.mjs <admin-email> <admin-password>");
  process.exit(1);
}

const pb = new PocketBase(PB_URL);

const CATEGORIES = [
  { name: "Hoa Sinh Nhật", slug: "hoa-sinh-nhat", sort_order: 1, is_active: true, description: "Bó hoa sinh nhật tươi thắm. Giao hỏa tốc 60 phút tại TPHCM." },
  { name: "Bó Hoa Sinh Nhật", slug: "bo-hoa-sinh-nhat", sort_order: 2, is_active: true, description: "Bó hoa sinh nhật đa dạng mẫu mã." },
  { name: "Lẵng Hoa Sinh Nhật", slug: "lang-hoa-sinh-nhat", sort_order: 3, is_active: true, description: "Lẵng hoa sinh nhật sang trọng." },
  { name: "Hoa Khai Trương", slug: "hoa-khai-truong", sort_order: 4, is_active: true, description: "Kệ hoa, lẵng hoa khai trương." },
  { name: "Kệ Hoa Khai Trương", slug: "ke-hoa-khai-truong", sort_order: 5, is_active: true, description: "Kệ hoa khai trương sang trọng." },
  { name: "Lẵng Hoa Khai Trương", slug: "lang-hoa-khai-truong", sort_order: 6, is_active: true, description: "Lẵng hoa khai trương đẹp." },
  { name: "Hoa Tốt Nghiệp", slug: "hoa-tot-nghiep", sort_order: 7, is_active: true, description: "Hoa tốt nghiệp xinh xắn, ý nghĩa." },
  { name: "Bó Hoa Tươi", slug: "bo-hoa-tuoi", sort_order: 8, is_active: true, description: "Bó hoa tươi Garden Mix hiện đại." },
  { name: "Hộp Hoa Mica", slug: "hop-hoa-mica", sort_order: 9, is_active: true, description: "Hộp hoa mica sang trọng." },
  { name: "Hoa Tình Yêu", slug: "hoa-tinh-yeu", sort_order: 10, is_active: true, description: "Hoa tình yêu lãng mạn." },
  { name: "Bó Hoa Tulip", slug: "bo-hoa-tulip", sort_order: 11, is_active: true, description: "Hoa tulip Hà Lan tươi thắm." },
  { name: "Bó Hoa Hồng", slug: "bo-hoa-hong", sort_order: 12, is_active: true, description: "Bó hoa hồng đẹp các loại." },
];

const PRODUCT_TEMPLATES = [
  {
    name: "Bó Hoa Tulip Hà Lan Mix Màu",
    slug: "bo-hoa-tulip-ha-lan-mix-mau",
    price: 680000, sale_price: null,
    short_description: "Size 35x50cm • 20 cành tulip Hà Lan mix 5 màu • Lá xanh tươi",
    description: "<p>Bó hoa tulip Hà Lan mix màu sắc tươi sáng, được chăm chút tỉ mỉ. Hoa nhập mới mỗi ngày, đảm bảo tươi thắm.</p>",
    occasions: ["Sinh nhật", "Tình yêu", "Chúc mừng"],
    is_featured: true, is_best_seller: true, is_active: true,
    category_slugs: ["bo-hoa-tuoi", "bo-hoa-tulip"],
  },
  {
    name: "Bó Hoa Hồng Đỏ Sophia 50 Cành",
    slug: "bo-hoa-hong-do-sophia-50-canh",
    price: 1200000, sale_price: 980000,
    short_description: "Size 40x60cm • 50 cành hồng đỏ Sophia nhập khẩu",
    description: "<p>50 cành hồng đỏ Sophia – biểu tượng tình yêu nồng cháy. Mỗi cành đều chọn lọc kỹ, tươi lâu 5-7 ngày.</p>",
    occasions: ["Tình yêu", "Sinh nhật", "Valentine"],
    is_featured: true, is_best_seller: true, is_active: true,
    category_slugs: ["hoa-tinh-yeu", "bo-hoa-tuoi", "bo-hoa-hong"],
  },
  {
    name: "Lẵng Hoa Khai Trương Sang Trọng",
    slug: "lang-hoa-khai-truong-sang-trong",
    price: 850000, sale_price: null,
    short_description: "Ngang 60cm • Hoa hồng, cúc, lily mix • Lẵng mây cao cấp",
    description: "<p>Lẵng hoa khai trương sang trọng kết hợp hồng, cúc, lily. Kèm băng chúc mừng theo yêu cầu.</p>",
    occasions: ["Khai trương", "Chúc mừng"],
    is_featured: true, is_best_seller: false, is_active: true,
    category_slugs: ["hoa-khai-truong", "lang-hoa-khai-truong"],
  },
  {
    name: "Bó Hoa Hướng Dương Tốt Nghiệp",
    slug: "bo-hoa-huong-duong-tot-nghiep",
    price: 450000, sale_price: null,
    short_description: "Size 30x45cm • 10 cành hướng dương vàng tươi • Lá xanh",
    description: "<p>Bó hướng dương rực rỡ – biểu tượng thành công. Quà ý nghĩa cho tân cử nhân.</p>",
    occasions: ["Tốt nghiệp", "Chúc mừng"],
    is_featured: false, is_best_seller: true, is_active: true,
    category_slugs: ["hoa-tot-nghiep", "bo-hoa-tuoi"],
  },
  {
    name: "Hộp Hoa Mica Tulip Pastel",
    slug: "hop-hoa-mica-tulip-pastel",
    price: 580000, sale_price: 520000,
    short_description: "Hộp mica 25x25cm • 15 cành tulip pastel • Cỏ bông trang trí",
    description: "<p>Hộp hoa mica tulip pastel dịu dàng, sang trọng. 15 cành tulip màu pastel trong hộp mica trong suốt.</p>",
    occasions: ["Sinh nhật", "Tình yêu", "Chúc mừng"],
    is_featured: true, is_best_seller: true, is_active: true,
    category_slugs: ["hop-hoa-mica", "bo-hoa-tulip"],
  },
  {
    name: "Kệ Hoa Khai Trương 2 Tầng Premium",
    slug: "ke-hoa-khai-truong-2-tang-premium",
    price: 1500000, sale_price: null,
    short_description: "Cao 160cm • 2 tầng • Hoa hồng, cúc, lily cao cấp",
    description: "<p>Kệ hoa khai trương 2 tầng premium. Cao 160cm, hồng Ecuador, lily trắng, cúc vàng. Kèm băng in tên.</p>",
    occasions: ["Khai trương", "Chúc mừng", "Sự kiện"],
    is_featured: true, is_best_seller: false, is_active: true,
    category_slugs: ["hoa-khai-truong", "ke-hoa-khai-truong"],
  },
  {
    name: "Bó Hoa Garden Mix Vintage",
    slug: "bo-hoa-garden-mix-vintage",
    price: 520000, sale_price: null,
    short_description: "Size 32x48cm • Mix 15+ loại hoa tươi • Phong cách Vintage",
    description: "<p>Bó hoa garden mix vintage tự nhiên, tinh tế. 15+ loại hoa: hồng spray, cúc dại, baby breath, lá bạch đàn.</p>",
    occasions: ["Sinh nhật", "Tình yêu", "Chúc mừng"],
    is_featured: true, is_best_seller: true, is_active: true,
    category_slugs: ["bo-hoa-tuoi"],
  },
  {
    name: "Bó Hoa Sinh Nhật Ngọt Ngào",
    slug: "bo-hoa-sinh-nhat-ngot-ngao",
    price: 380000, sale_price: 320000,
    short_description: "Size 28x42cm • Hoa hồng pastel + cúc trắng + baby breath",
    description: "<p>Bó hoa sinh nhật pastel dịu dàng. Hồng pastel, cúc trắng, baby breath. Quà sinh nhật bạn gái.</p>",
    occasions: ["Sinh nhật", "Tình yêu"],
    is_featured: false, is_best_seller: true, is_active: true,
    category_slugs: ["hoa-sinh-nhat", "bo-hoa-tuoi", "bo-hoa-sinh-nhat"],
  },
  {
    name: "Hộp Hoa Mica Hồng Đỏ Valentine",
    slug: "hop-hoa-mica-hong-do-valentine",
    price: 720000, sale_price: null,
    short_description: "Hộp mica trái tim • 20 cành hồng đỏ Ecuador • Ribbon đỏ",
    description: "<p>Hộp hoa mica hình trái tim. 20 hồng đỏ Ecuador, hộp trong suốt, ribbon đỏ lãng mạn.</p>",
    occasions: ["Tình yêu", "Valentine", "Sinh nhật"],
    is_featured: false, is_best_seller: false, is_active: true,
    category_slugs: ["hop-hoa-mica", "hoa-tinh-yeu"],
  },
  {
    name: "Bó Hoa Tulip Trắng Tốt Nghiệp",
    slug: "bo-hoa-tulip-trang-tot-nghiep",
    price: 560000, sale_price: null,
    short_description: "Size 32x50cm • 15 cành tulip trắng • Lá bạch đàn xanh",
    description: "<p>Bó tulip trắng thanh khiết – khởi đầu tinh khôi. Quà tốt nghiệp ý nghĩa cho cả nam lẫn nữ.</p>",
    occasions: ["Tốt nghiệp", "Chúc mừng"],
    is_featured: false, is_best_seller: true, is_active: true,
    category_slugs: ["hoa-tot-nghiep", "bo-hoa-tulip"],
  },
  {
    name: "Bó Hoa Hồng Hàn Quốc Mix Màu",
    slug: "bo-hoa-hong-han-quoc-mix-mau",
    price: 420000, sale_price: null,
    short_description: "Size 30x45cm • 20 cành hồng Hàn Quốc • Mix pastel 4 màu",
    description: "<p>Bó hồng Hàn Quốc mix pastel 4 màu: hồng phấn, hồng đào, trắng kem, tím lilac. Cánh dày, bền lâu.</p>",
    occasions: ["Sinh nhật", "Tình yêu", "Chúc mừng"],
    is_featured: true, is_best_seller: true, is_active: true,
    category_slugs: ["bo-hoa-tuoi", "hoa-sinh-nhat", "bo-hoa-hong"],
  },
  {
    name: "Lẵng Hoa Sinh Nhật Sang Trọng",
    slug: "lang-hoa-sinh-nhat-sang-trong",
    price: 680000, sale_price: 580000,
    short_description: "Ngang 50cm • Hoa hồng + lily + phong lan • Lẵng tre sang",
    description: "<p>Lẵng hoa sinh nhật sang trọng: hồng Ecuador, lily trắng, phong lan vàng. Lẵng tre cao cấp.</p>",
    occasions: ["Sinh nhật", "Chúc mừng"],
    is_featured: false, is_best_seller: false, is_active: true,
    category_slugs: ["hoa-sinh-nhat", "lang-hoa-sinh-nhat"],
  },
];

const SETTINGS = [
  { key: "phone", value: "0976491322" },
  { key: "zalo", value: "https://zalo.me/0976491322" },
  { key: "email", value: "cskh@vuonhoatuoi.vn" },
  { key: "address_1", value: "183/37 Đường 3 Tháng 2, Phường Vườn Lài, TPHCM" },
  { key: "address_2", value: "704/19 Nguyễn Đình Chiểu, Phường 1, Quận 3, TPHCM" },
  { key: "opening_hours", value: "08:00 – 21:00 hàng ngày" },
  { key: "free_shipping_note", value: "Miễn phí giao hàng nội thành TPHCM" },
  { key: "hotline_display", value: "0976.491.322" },
];

async function main() {
  console.log("🔐 Đăng nhập...");
  await pb.admins.authWithPassword(adminEmail, adminPassword);
  console.log("✅ OK\n");

  // 1. Seed categories
  console.log("📂 Tạo categories...");
  const catMap = {};
  for (const cat of CATEGORIES) {
    try {
      const existing = await pb.collection("categories").getFirstListItem(`slug="${cat.slug}"`).catch(() => null);
      if (existing) { catMap[cat.slug] = existing.id; console.log(`  ⏭  ${cat.name}`); continue; }
      const record = await pb.collection("categories").create(cat);
      catMap[cat.slug] = record.id;
      console.log(`  ✅  ${cat.name}`);
    } catch (e) { console.error(`  ❌  ${cat.name}:`, e?.message); }
  }

  // Set parent for sub-categories
  const parentMap = {
    "bo-hoa-sinh-nhat": "hoa-sinh-nhat",
    "lang-hoa-sinh-nhat": "hoa-sinh-nhat",
    "ke-hoa-khai-truong": "hoa-khai-truong",
    "lang-hoa-khai-truong": "hoa-khai-truong",
    "bo-hoa-tulip": "bo-hoa-tuoi",
    "bo-hoa-hong": "bo-hoa-tuoi",
  };
  console.log("\n🔗 Set parent...");
  for (const [child, parent] of Object.entries(parentMap)) {
    if (catMap[child] && catMap[parent]) {
      await pb.collection("categories").update(catMap[child], { parent: catMap[parent] });
      console.log(`  ✅  ${child} → ${parent}`);
    }
  }

  // 2. Seed products
  console.log("\n🌸 Tạo products...");
  for (const tpl of PRODUCT_TEMPLATES) {
    try {
      const existing = await pb.collection("products").getFirstListItem(`slug="${tpl.slug}"`).catch(() => null);
      if (existing) { console.log(`  ⏭  ${tpl.name}`); continue; }
      const { category_slugs, ...productData } = tpl;
      const categoryIds = (category_slugs || []).map((s) => catMap[s]).filter(Boolean);
      await pb.collection("products").create({ ...productData, categories: categoryIds });
      console.log(`  ✅  ${tpl.name}`);
    } catch (e) { console.error(`  ❌  ${tpl.name}:`, e?.message); }
  }

  // 3. Seed settings
  console.log("\n⚙️  Tạo settings...");
  for (const s of SETTINGS) {
    try {
      const existing = await pb.collection("settings").getFirstListItem(`key="${s.key}"`).catch(() => null);
      if (existing) {
        await pb.collection("settings").update(existing.id, { value: s.value });
        console.log(`  🔄  ${s.key}`);
      } else {
        await pb.collection("settings").create(s);
        console.log(`  ✅  ${s.key}`);
      }
    } catch (e) { console.error(`  ❌  ${s.key}:`, e?.message); }
  }

  console.log(`\n🎉 Seed hoàn tất! ${CATEGORIES.length} categories · ${PRODUCT_TEMPLATES.length} products · ${SETTINGS.length} settings`);
}

main().catch(console.error);
