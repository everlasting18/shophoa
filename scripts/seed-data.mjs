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

// ─── Categories ────────────────────────────────────────────────
const CATEGORIES = [
  { name: "Hoa Sinh Nhật", slug: "hoa-sinh-nhat", category_type: "occasion", sort_order: 1, is_active: true, description: "Bó hoa sinh nhật tươi thắm, đẹp mắt. Giao hỏa tốc 60 phút tại TPHCM.", seo_title: "Hoa Sinh Nhật Đẹp TPHCM – Đặt Online Giao Tận Nơi | Vườn Hoa Tươi", seo_description: "Shop hoa sinh nhật TPHCM uy tín. Đặt hoa tươi online, giao hỏa tốc 60 phút. Mẫu đa dạng, giá hợp lý." },
  { name: "Hoa Khai Trương", slug: "hoa-khai-truong", category_type: "occasion", sort_order: 2, is_active: true, description: "Kệ hoa, lẵng hoa khai trương sang trọng. Chúc mừng khai trương thành công.", seo_title: "Hoa Khai Trương TPHCM – Kệ Hoa, Lẵng Hoa Đẹp | Vườn Hoa Tươi", seo_description: "Đặt hoa khai trương TPHCM. Kệ hoa, lẵng hoa, giỏ hoa khai trương sang trọng. Giao tận nơi." },
  { name: "Hoa Tốt Nghiệp", slug: "hoa-tot-nghiep", category_type: "occasion", sort_order: 3, is_active: true, description: "Hoa tốt nghiệp xinh xắn, ý nghĩa. Chúc mừng tân cử nhân.", seo_title: "Hoa Tốt Nghiệp TPHCM – Bó Hoa Đẹp Chúc Mừng | Vườn Hoa Tươi", seo_description: "Hoa tốt nghiệp đẹp TPHCM. Bó hoa tulip, hướng dương, hoa hồng chúc mừng tốt nghiệp." },
  { name: "Bó Hoa Tươi", slug: "bo-hoa-tuoi", category_type: "style", sort_order: 4, is_active: true, description: "Bó hoa tươi đa dạng mẫu mã, phong cách Garden Mix hiện đại.", seo_title: "Bó Hoa Tươi Đẹp TPHCM – Garden Mix Vintage | Vườn Hoa Tươi", seo_description: "Bó hoa tươi TPHCM đẹp, đa dạng. Tulip, hướng dương, hoa hồng, garden mix. Đặt online giao tận nơi." },
  { name: "Hộp Hoa Mica", slug: "hop-hoa-mica", category_type: "style", sort_order: 5, is_active: true, description: "Hộp hoa mica sang trọng, xinh xắn – món quà hoàn hảo mọi dịp.", seo_title: "Hộp Hoa Mica Đẹp TPHCM – Quà Tặng Sang Trọng | Vườn Hoa Tươi", seo_description: "Hộp hoa mica đẹp TPHCM. Thiết kế sang trọng, quà tặng ý nghĩa. Đặt online giao trong 60 phút." },
  { name: "Hoa Tình Yêu", slug: "hoa-tinh-yeu", category_type: "occasion", sort_order: 6, is_active: true, description: "Hoa tình yêu lãng mạn – gửi trọn yêu thương đến người thương.", seo_title: "Hoa Tình Yêu TPHCM – Bó Hoa Hồng Lãng Mạn | Vườn Hoa Tươi", seo_description: "Hoa tình yêu TPHCM. Bó hoa hồng, tulip lãng mạn. Tặng người yêu nhân dịp Valentine, kỷ niệm." },
  { name: "Kệ Hoa Khai Trương", slug: "ke-hoa-khai-truong", category_type: "style", sort_order: 7, is_active: true, description: "Kệ hoa khai trương sang trọng, ấn tượng. Phù hợp mọi không gian.", seo_title: "Kệ Hoa Khai Trương TPHCM – Sang Trọng Ấn Tượng | Vườn Hoa Tươi", seo_description: "Kệ hoa khai trương đẹp TPHCM. Thiết kế sang trọng, kích thước đa dạng. Giao lắp đặt tận nơi." },
  { name: "Bó Hoa Tulip", slug: "bo-hoa-tulip", category_type: "flower_type", sort_order: 8, is_active: true, description: "Hoa tulip Hà Lan tươi thắm. Màu sắc phong phú, hương thơm dịu nhẹ.", seo_title: "Bó Hoa Tulip Hà Lan Tươi TPHCM – Đặt Online | Vườn Hoa Tươi", seo_description: "Hoa tulip Hà Lan tươi TPHCM. Đa màu sắc, hương thơm nhẹ. Đặt bó hoa tulip online, giao tận nơi." },
];

// ─── Products ──────────────────────────────────────────────────
// Note: categories field = array JSON IDs (sẽ fill sau khi tạo categories)
const PRODUCT_TEMPLATES = [
  {
    name: "Bó Hoa Tulip Hà Lan Mix Màu",
    slug: "bo-hoa-tulip-ha-lan-mix-mau",
    price: 680000,
    sale_price: null,
    short_description: "Size 35x50cm • 20 cành tulip Hà Lan mix 5 màu • Lá xanh tươi",
    description: "<p>Bó hoa tulip Hà Lan mix màu sắc tươi sáng, được chăm chút tỉ mỉ bởi đội ngũ nghệ nhân Vườn Hoa Tươi. Phù hợp tặng sinh nhật, người yêu, bạn bè. Hoa nhập mới mỗi ngày, đảm bảo tươi thắm.</p>",
    occasions: ["Sinh nhật", "Tình yêu", "Chúc mừng"],
    is_featured: true,
    is_best_seller: true,
    is_active: true,
    view_count: 1250,
    seo_title: "Bó Hoa Tulip Hà Lan Mix Màu – Đặt Online TPHCM | Vườn Hoa Tươi",
    seo_description: "Bó 20 cành tulip Hà Lan mix màu sắc tươi. Giao hỏa tốc TPHCM. Đặt online ngay!",
    category_slugs: ["bo-hoa-tuoi", "bo-hoa-tulip"],
  },
  {
    name: "Bó Hoa Hồng Đỏ Sophia 50 Cành",
    slug: "bo-hoa-hong-do-sophia-50-canh",
    price: 1200000,
    sale_price: 980000,
    short_description: "Size 40x60cm • 50 cành hồng đỏ Sophia nhập khẩu • Ruy băng lụa",
    description: "<p>50 cành hồng đỏ Sophia – biểu tượng tình yêu nồng cháy. Được cuộn tròn tinh tế trong giấy craft vintage, buộc ruy băng lụa sang trọng. Mỗi cành hoa đều được chọn lọc kỹ càng, đảm bảo độ tươi lâu tới 5-7 ngày.</p>",
    occasions: ["Tình yêu", "Sinh nhật", "Valentine"],
    is_featured: true,
    is_best_seller: true,
    is_active: true,
    view_count: 2100,
    seo_title: "Bó 50 Hoa Hồng Đỏ Sophia – Quà Tặng Tình Yêu | Vườn Hoa Tươi",
    seo_description: "50 cành hồng đỏ Sophia nhập khẩu. Biểu tượng tình yêu. Giao TPHCM trong 60 phút.",
    category_slugs: ["hoa-tinh-yeu", "bo-hoa-tuoi"],
  },
  {
    name: "Lẵng Hoa Khai Trương Sang Trọng",
    slug: "lang-hoa-khai-truong-sang-trong",
    price: 850000,
    sale_price: null,
    short_description: "Size ngang 60cm • Hoa hồng, cúc, lily mix • Lẵng mây cao cấp",
    description: "<p>Lẵng hoa khai trương được thiết kế sang trọng, kết hợp hài hòa hoa hồng, cúc vạn thọ và lily tươi. Phù hợp khai trương văn phòng, cửa hàng, nhà hàng. Kèm băng chúc mừng theo yêu cầu.</p>",
    occasions: ["Khai trương", "Chúc mừng"],
    is_featured: true,
    is_best_seller: false,
    is_active: true,
    view_count: 780,
    seo_title: "Lẵng Hoa Khai Trương Sang Trọng TPHCM | Vườn Hoa Tươi",
    seo_description: "Lẵng hoa khai trương sang trọng TPHCM. Hoa hồng, lily, cúc mix. Giao lắp đặt tận nơi.",
    category_slugs: ["hoa-khai-truong"],
  },
  {
    name: "Bó Hoa Hướng Dương Tốt Nghiệp",
    slug: "bo-hoa-huong-duong-tot-nghiep",
    price: 450000,
    sale_price: null,
    short_description: "Size 30x45cm • 10 cành hướng dương vàng tươi • Lá xanh trang trí",
    description: "<p>Bó hoa hướng dương rực rỡ – biểu tượng của sự thành công và tương lai tươi sáng. Quà tặng ý nghĩa cho tân cử nhân. Hoa hướng dương nhập mới, to tròn, cánh vàng rực rỡ.</p>",
    occasions: ["Tốt nghiệp", "Chúc mừng"],
    is_featured: false,
    is_best_seller: true,
    is_active: true,
    view_count: 930,
    seo_title: "Bó Hoa Hướng Dương Tốt Nghiệp TPHCM | Vườn Hoa Tươi",
    seo_description: "Bó hoa hướng dương chúc mừng tốt nghiệp. 10 cành vàng tươi. Giao TPHCM.",
    category_slugs: ["hoa-tot-nghiep", "bo-hoa-tuoi"],
  },
  {
    name: "Hộp Hoa Mica Tulip Pastel",
    slug: "hop-hoa-mica-tulip-pastel",
    price: 580000,
    sale_price: 520000,
    short_description: "Hộp mica vuông 25x25cm • 15 cành tulip pastel • Cỏ bông trang trí",
    description: "<p>Hộp hoa mica tulip pastel – món quà tinh tế cho những ai yêu thích sự nhẹ nhàng. Hộp mica trong suốt sang trọng, bên trong là 15 cành tulip màu pastel dịu dàng, điểm xuyết cỏ bông xinh xắn.</p>",
    occasions: ["Sinh nhật", "Tình yêu", "Chúc mừng"],
    is_featured: true,
    is_best_seller: true,
    is_active: true,
    view_count: 1680,
    seo_title: "Hộp Hoa Mica Tulip Pastel – Quà Tặng Xinh TPHCM | Vườn Hoa Tươi",
    seo_description: "Hộp hoa mica tulip pastel dịu dàng. 15 cành tulip trong hộp mica sang trọng. Đặt online.",
    category_slugs: ["hop-hoa-mica", "bo-hoa-tulip"],
  },
  {
    name: "Kệ Hoa Khai Trương 2 Tầng Premium",
    slug: "ke-hoa-khai-truong-2-tang-premium",
    price: 1500000,
    sale_price: null,
    short_description: "Cao 160cm • 2 tầng • Hoa hồng, cúc, lily cao cấp • Băng chúc mừng",
    description: "<p>Kệ hoa khai trương 2 tầng premium – sự lựa chọn hoàn hảo cho các buổi lễ khai trương quan trọng. Cao 160cm, thiết kế 2 tầng sang trọng với hoa hồng Ecuador, lily trắng và cúc vàng cao cấp. Kèm băng chúc mừng in tên theo yêu cầu.</p>",
    occasions: ["Khai trương", "Chúc mừng", "Sự kiện"],
    is_featured: true,
    is_best_seller: false,
    is_active: true,
    view_count: 450,
    seo_title: "Kệ Hoa Khai Trương 2 Tầng Premium TPHCM | Vườn Hoa Tươi",
    seo_description: "Kệ hoa khai trương 2 tầng cao cấp. Cao 160cm, hoa nhập khẩu. Giao lắp đặt TPHCM.",
    category_slugs: ["hoa-khai-truong", "ke-hoa-khai-truong"],
  },
  {
    name: "Bó Hoa Garden Mix Vintage",
    slug: "bo-hoa-garden-mix-vintage",
    price: 520000,
    sale_price: null,
    short_description: "Size 32x48cm • Mix 15+ loại hoa tươi • Phong cách vườn Vintage",
    description: "<p>Bó hoa garden mix vintage – phong cách tự nhiên, phóng khoáng nhưng đầy tinh tế. Kết hợp hơn 15 loại hoa tươi theo phong cách vườn hoa Anh Quốc cổ điển: hoa hồng spray, cúc dại, baby breath, lá bạch đàn...</p>",
    occasions: ["Sinh nhật", "Tình yêu", "Chúc mừng"],
    is_featured: true,
    is_best_seller: true,
    is_active: true,
    view_count: 1890,
    seo_title: "Bó Hoa Garden Mix Vintage TPHCM – Phong Cách Vườn Hoa | Vườn Hoa Tươi",
    seo_description: "Bó hoa garden mix vintage tự nhiên, tinh tế. Mix 15+ loại hoa tươi. Giao TPHCM 60 phút.",
    category_slugs: ["bo-hoa-tuoi"],
  },
  {
    name: "Bó Hoa Sinh Nhật Ngọt Ngào",
    slug: "bo-hoa-sinh-nhat-ngot-ngao",
    price: 380000,
    sale_price: 320000,
    short_description: "Size 28x42cm • Hoa hồng pastel + cúc trắng + baby breath",
    description: "<p>Bó hoa sinh nhật ngọt ngào – sắc hồng pastel dịu dàng, điểm xuyết hoa cúc trắng tinh khôi và baby breath nhẹ nhàng. Màu sắc pastel trendy 2024, phù hợp tặng sinh nhật bạn gái, chị em.</p>",
    occasions: ["Sinh nhật", "Tình yêu"],
    is_featured: false,
    is_best_seller: true,
    is_active: true,
    view_count: 2340,
    seo_title: "Bó Hoa Sinh Nhật Ngọt Ngào TPHCM – Pastel Đẹp | Vườn Hoa Tươi",
    seo_description: "Bó hoa sinh nhật pastel ngọt ngào TPHCM. Hồng pastel + cúc trắng. Giao hỏa tốc.",
    category_slugs: ["hoa-sinh-nhat", "bo-hoa-tuoi"],
  },
  {
    name: "Hộp Hoa Mica Hồng Đỏ Valentine",
    slug: "hop-hoa-mica-hong-do-valentine",
    price: 720000,
    sale_price: null,
    short_description: "Hộp mica trái tim 30x30cm • 20 cành hồng đỏ • Ribbon đỏ",
    description: "<p>Hộp hoa mica hình trái tim đặc biệt cho ngày Valentine. 20 cành hoa hồng đỏ Ecuador tươi thắm, xếp tỉ mỉ trong hộp mica trong suốt, buộc ribbon đỏ lãng mạn. Giao trước 14/2 để tránh quá tải.</p>",
    occasions: ["Tình yêu", "Valentine", "Sinh nhật"],
    is_featured: false,
    is_best_seller: false,
    is_active: true,
    view_count: 560,
    seo_title: "Hộp Hoa Mica Hồng Đỏ Valentine TPHCM | Vườn Hoa Tươi",
    seo_description: "Hộp hoa mica Valentine hình trái tim. 20 hồng đỏ Ecuador. Quà tình yêu ý nghĩa.",
    category_slugs: ["hop-hoa-mica", "hoa-tinh-yeu"],
  },
  {
    name: "Bó Hoa Tulip Trắng Tốt Nghiệp",
    slug: "bo-hoa-tulip-trang-tot-nghiep",
    price: 560000,
    sale_price: null,
    short_description: "Size 32x50cm • 15 cành tulip trắng tinh • Lá bạch đàn xanh",
    description: "<p>Bó tulip trắng thanh khiết – biểu tượng của sự khởi đầu mới tinh khôi. Quà tặng tốt nghiệp ý nghĩa và sang trọng, phù hợp tặng cả nam lẫn nữ. Hoa tulip Hà Lan nhập trực tiếp.</p>",
    occasions: ["Tốt nghiệp", "Chúc mừng"],
    is_featured: false,
    is_best_seller: true,
    is_active: true,
    view_count: 870,
    seo_title: "Bó Hoa Tulip Trắng Tốt Nghiệp TPHCM | Vườn Hoa Tươi",
    seo_description: "Bó tulip trắng tốt nghiệp thanh khiết. 15 cành tulip Hà Lan. Giao TPHCM.",
    category_slugs: ["hoa-tot-nghiep", "bo-hoa-tulip"],
  },
  {
    name: "Bó Hoa Hồng Hàn Quốc Mix Màu",
    slug: "bo-hoa-hong-han-quoc-mix-mau",
    price: 420000,
    sale_price: null,
    short_description: "Size 30x45cm • 20 cành hồng Hàn Quốc • Mix pastel 4 màu",
    description: "<p>Bó hoa hồng Hàn Quốc mix pastel – xu hướng hot 2024 với 4 màu hồng nhẹ nhàng: hồng phấn, hồng đào, trắng kem và tím lilac. Hoa hồng Hàn cánh dày, bền lâu, hương thơm dịu.</p>",
    occasions: ["Sinh nhật", "Tình yêu", "Chúc mừng"],
    is_featured: true,
    is_best_seller: true,
    is_active: true,
    view_count: 1450,
    seo_title: "Bó Hoa Hồng Hàn Quốc Mix Màu TPHCM | Vườn Hoa Tươi",
    seo_description: "Bó hồng Hàn Quốc mix pastel 4 màu. Hot trend 2024. Đặt online giao TPHCM.",
    category_slugs: ["bo-hoa-tuoi", "hoa-sinh-nhat"],
  },
  {
    name: "Lẵng Hoa Sinh Nhật Sang Trọng",
    slug: "lang-hoa-sinh-nhat-sang-trong",
    price: 680000,
    sale_price: 580000,
    short_description: "Ngang 50cm • Hoa hồng + lily + phong lan mix • Lẵng tre sang",
    description: "<p>Lẵng hoa sinh nhật sang trọng kết hợp hoa hồng Ecuador đỏ, lily trắng và phong lan vàng. Thiết kế tinh tế trong lẵng tre tự nhiên cao cấp. Quà tặng sinh nhật ấn tượng cho người thân, đối tác.</p>",
    occasions: ["Sinh nhật", "Chúc mừng"],
    is_featured: false,
    is_best_seller: false,
    is_active: true,
    view_count: 390,
    seo_title: "Lẵng Hoa Sinh Nhật Sang Trọng TPHCM | Vườn Hoa Tươi",
    seo_description: "Lẵng hoa sinh nhật sang trọng. Hồng + lily + phong lan. Giao TPHCM 60 phút.",
    category_slugs: ["hoa-sinh-nhat"],
  },
];

// ─── Banners ───────────────────────────────────────────────────
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

// ─── Main ──────────────────────────────────────────────────────
async function main() {
  console.log("🔐 Đăng nhập...");
  await pb.admins.authWithPassword(adminEmail, adminPassword);
  console.log("✅ OK\n");

  // 1. Seed categories
  console.log("📂 Tạo categories...");
  const catMap = {}; // slug → id
  for (const cat of CATEGORIES) {
    try {
      const existing = await pb.collection("categories")
        .getFirstListItem(`slug="${cat.slug}"`)
        .catch(() => null);
      if (existing) {
        catMap[cat.slug] = existing.id;
        console.log(`  ⏭  ${cat.name}`);
        continue;
      }
      const record = await pb.collection("categories").create(cat);
      catMap[cat.slug] = record.id;
      console.log(`  ✅  ${cat.name}`);
    } catch (e) {
      console.error(`  ❌  ${cat.name}:`, e?.message);
    }
  }

  // 2. Seed products
  console.log("\n🌸 Tạo products...");
  for (const tpl of PRODUCT_TEMPLATES) {
    try {
      const existing = await pb.collection("products")
        .getFirstListItem(`slug="${tpl.slug}"`)
        .catch(() => null);
      if (existing) {
        console.log(`  ⏭  ${tpl.name}`);
        continue;
      }
      const { category_slugs, ...productData } = tpl;
      const categoryIds = (category_slugs || [])
        .map((s) => catMap[s])
        .filter(Boolean);

      await pb.collection("products").create({
        ...productData,
        categories: categoryIds,
        occasions: productData.occasions,
      });
      console.log(`  ✅  ${tpl.name}`);
    } catch (e) {
      console.error(`  ❌  ${tpl.name}:`, e?.message);
    }
  }

  // 3. Seed settings
  console.log("\n⚙️  Tạo settings...");
  for (const s of SETTINGS) {
    try {
      const existing = await pb.collection("settings")
        .getFirstListItem(`key="${s.key}"`)
        .catch(() => null);
      if (existing) {
        await pb.collection("settings").update(existing.id, { value: s.value });
        console.log(`  🔄  ${s.key}`);
      } else {
        await pb.collection("settings").create(s);
        console.log(`  ✅  ${s.key}`);
      }
    } catch (e) {
      console.error(`  ❌  ${s.key}:`, e?.message);
    }
  }

  console.log("\n🎉 Seed data hoàn tất!");
  console.log(`   📦 ${CATEGORIES.length} categories`);
  console.log(`   🌸 ${PRODUCT_TEMPLATES.length} products`);
  console.log(`   ⚙️  ${SETTINGS.length} settings`);
  console.log(`\n   Xem tại: ${PB_URL}/_/`);
}

main().catch(console.error);
