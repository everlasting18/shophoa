/**
 * Re-link product↔categories after migration
 * Run: node scripts/relink-categories.mjs <admin-email> <admin-password>
 */

import PocketBase from "pocketbase";

const PB_URL = "https://rfmzqjlurgw0s6i.fbjc.pocketbasecloud.com";
const [, , adminEmail, adminPassword] = process.argv;

if (!adminEmail || !adminPassword) {
  console.error("Usage: node scripts/relink-categories.mjs <email> <password>");
  process.exit(1);
}

const pb = new PocketBase(PB_URL);

// Map slug → category_slugs (from seed-data.mjs)
const PRODUCT_CATEGORY_MAP = {
  "bo-hoa-tulip-ha-lan-mix-mau":        ["bo-hoa-tuoi", "bo-hoa-tulip"],
  "bo-hoa-hong-do-sophia-50-canh":      ["hoa-tinh-yeu", "bo-hoa-tuoi"],
  "lang-hoa-khai-truong-sang-trong":    ["hoa-khai-truong"],
  "hop-hoa-mica-birthday-pastel":       ["hoa-sinh-nhat", "hop-hoa-mica"],
  "bo-hoa-huong-duong-garden-mix":      ["bo-hoa-tuoi"],
  "ke-hoa-chuc-mung-khai-truong":       ["hoa-khai-truong", "ke-hoa-khai-truong"],
  "bo-hoa-tot-nghiep-chu-nhat-xanh":   ["hoa-tot-nghiep", "bo-hoa-tuoi"],
  "hop-hoa-mica-hong-tuoi":             ["hoa-tinh-yeu", "hop-hoa-mica"],
  "bo-hoa-tulip-trang-tinh-khiet":      ["bo-hoa-tuoi", "bo-hoa-tulip"],
  "lang-hoa-sinh-nhat-rose-dream":      ["hoa-sinh-nhat"],
  "bo-hoa-hong-gradient-mix-mau":       ["hoa-tinh-yeu", "bo-hoa-tuoi"],
  "ke-hoa-khai-truong-luxury":          ["hoa-khai-truong", "ke-hoa-khai-truong"],
};

async function main() {
  console.log("🔐 Đăng nhập...");
  await pb.admins.authWithPassword(adminEmail, adminPassword);
  console.log("✅ OK\n");

  // Lấy tất cả categories
  const categories = await pb.collection("categories").getFullList();
  const catBySlug = Object.fromEntries(categories.map((c) => [c.slug, c.id]));
  console.log(`📂 ${categories.length} categories loaded\n`);

  // Lấy tất cả products
  const products = await pb.collection("products").getFullList();
  console.log(`📦 ${products.length} products loaded\n`);

  let updated = 0;
  let skipped = 0;

  for (const product of products) {
    const catSlugs = PRODUCT_CATEGORY_MAP[product.slug];
    if (!catSlugs) {
      console.log(`⚠️  Không có mapping cho: ${product.slug}`);
      skipped++;
      continue;
    }

    const catIds = catSlugs
      .map((slug) => catBySlug[slug])
      .filter(Boolean);

    if (catIds.length === 0) {
      console.log(`⚠️  Không tìm thấy category IDs cho: ${product.slug}`);
      skipped++;
      continue;
    }

    await pb.collection("products").update(product.id, { categories: catIds });
    console.log(`✅  ${product.name} → [${catSlugs.join(", ")}]`);
    updated++;
  }

  console.log(`\n📊 Kết quả: ${updated} updated, ${skipped} skipped`);

  // Verify
  console.log("\n🧪 Verify expand...");
  const sample = await pb.collection("products").getList(1, 3, {
    expand: "categories",
    filter: "is_active=true",
  });
  sample.items.forEach((p) => {
    const cats = p.expand?.categories?.map((c) => c.name).join(", ") || "(none)";
    console.log(`   ${p.name}: [${cats}]`);
  });

  console.log("\n🌸 Xong!");
}

main().catch(console.error);
