/**
 * Script: Setup PocketBase collections cho Shop Hoa Tươi
 * Chạy: node scripts/setup-pb.mjs <admin-email> <admin-password>
 */

import PocketBase from "pocketbase";

const PB_URL = "https://rfmzqjlurgw0s6i.fbjc.pocketbasecloud.com";
const [, , adminEmail, adminPassword] = process.argv;

if (!adminEmail || !adminPassword) {
  console.error("Usage: node scripts/setup-pb.mjs <admin-email> <admin-password>");
  process.exit(1);
}

const pb = new PocketBase(PB_URL);

// Explicit autodate fields so sort/filter by created/updated works
const TIMESTAMPS = [
  { name: "created", type: "autodate", onCreate: true,  onUpdate: false },
  { name: "updated", type: "autodate", onCreate: true,  onUpdate: true  },
];

async function dropCollection(name) {
  try {
    const col = await pb.collections.getOne(name).catch(() => null);
    if (col) {
      await pb.collections.delete(col.id);
      console.log(`🗑  '${name}' đã xoá`);
    }
  } catch (e) {
    console.warn(`⚠️   không xoá được '${name}':`, e?.message);
  }
}

async function createCollection(schema) {
  try {
    // Append timestamps to every collection
    const schemaWithTS = { ...schema, fields: [...schema.fields, ...TIMESTAMPS] };
    await pb.collections.create(schemaWithTS);
    console.log(`✅  '${schema.name}' đã tạo`);
  } catch (e) {
    const detail = JSON.stringify(e?.response ?? e?.data ?? e?.message, null, 2);
    console.error(`❌  '${schema.name}' lỗi:\n${detail}`);
    throw e;
  }
}

async function main() {
  console.log("🔐 Đăng nhập PocketBase Admin...");
  await pb.admins.authWithPassword(adminEmail, adminPassword);
  console.log("✅ Đăng nhập thành công\n");

  // ── 0. Drop existing (reverse dep order) ────────────────────────────────
  console.log("🗑  Xoá collections cũ (nếu có)...\n");
  for (const name of ["reviews", "orders", "banners", "settings", "products", "categories"]) {
    await dropCollection(name);
  }
  console.log();

  console.log("📦 Bắt đầu tạo collections...\n");

  // ── 1. categories (no deps) ────────────────────────────────────────────────
  const categoriesSchema = {
    name: "categories",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != ''",
    deleteRule: "@request.auth.id != ''",
    fields: [
      { name: "name",            type: "text",   required: true },
      { name: "slug",            type: "text",   required: true },
      { name: "description",     type: "text" },
      { name: "image",           type: "file",   maxSelect: 1, mimeTypes: ["image/jpeg","image/png","image/webp","image/gif"] },
      { name: "category_type",   type: "select", maxSelect: 1, values: ["occasion","style","recipient","flower_type"] },
      { name: "sort_order",      type: "number", min: 0 },
      { name: "seo_title",       type: "text" },
      { name: "seo_description", type: "text" },
      { name: "is_active",       type: "bool",   required: true },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_categories_slug ON categories (slug)"],
  };
  await createCollection(categoriesSchema);

  // Lấy ID để dùng cho relation
  const categoriesCol = await pb.collections.getOne("categories");
  const CATEGORIES_ID = categoriesCol.id;
  console.log(`   → categories ID: ${CATEGORIES_ID}\n`);

  // ── 2. products (→ categories) ─────────────────────────────────────────────
  const productsSchema = {
    name: "products",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != ''",
    deleteRule: "@request.auth.id != ''",
    fields: [
      { name: "name",              type: "text",     required: true },
      { name: "slug",              type: "text",     required: true },
      { name: "price",             type: "number",   required: true, min: 0 },
      { name: "sale_price",        type: "number",   min: 0 },
      { name: "images",            type: "file",     maxSelect: 10, mimeTypes: ["image/jpeg","image/png","image/webp"] },
      { name: "thumbnail",         type: "file",     maxSelect: 1,  mimeTypes: ["image/jpeg","image/png","image/webp"] },
      { name: "short_description", type: "text" },
      { name: "description",       type: "editor" },
      { name: "occasions",         type: "json" },
      {
        name: "categories",
        type: "relation",
        required: false,
        maxSelect: 20,
        collectionId: CATEGORIES_ID,
        cascadeDelete: false,
      },
      { name: "is_featured",       type: "bool" },
      { name: "is_best_seller",    type: "bool" },
      { name: "is_active",         type: "bool",     required: true },
      { name: "seo_title",         type: "text" },
      { name: "seo_description",   type: "text" },
      { name: "view_count",        type: "number",   min: 0 },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_products_slug ON products (slug)"],
  };
  await createCollection(productsSchema);

  const productsCol = await pb.collections.getOne("products");
  const PRODUCTS_ID = productsCol.id;
  console.log(`   → products ID: ${PRODUCTS_ID}\n`);

  // ── 3. orders (no collection deps) ────────────────────────────────────────
  await createCollection({
    name: "orders",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "@request.auth.id != ''",
    deleteRule: "@request.auth.id != ''",
    fields: [
      { name: "order_code",        type: "text" },
      { name: "customer_name",     type: "text",   required: true },
      { name: "customer_phone",    type: "text",   required: true },
      { name: "customer_email",    type: "text" },
      { name: "recipient_name",    type: "text",   required: true },
      { name: "recipient_phone",   type: "text",   required: true },
      { name: "recipient_address", type: "text",   required: true },
      { name: "delivery_date",     type: "text",   required: true },
      { name: "delivery_time",     type: "text",   required: true },
      { name: "items",             type: "json" },
      { name: "subtotal",          type: "number", min: 0 },
      { name: "total",             type: "number", min: 0 },
      { name: "note",              type: "text" },
      { name: "status",            type: "select", required: true, maxSelect: 1, values: ["pending","confirmed","delivering","completed","cancelled"] },
      { name: "payment_method",    type: "select", required: true, maxSelect: 1, values: ["cod","bank_transfer","momo"] },
    ],
  });

  // ── 4. banners (no collection deps) ───────────────────────────────────────
  await createCollection({
    name: "banners",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != ''",
    deleteRule: "@request.auth.id != ''",
    fields: [
      { name: "title",      type: "text",   required: true },
      { name: "image",      type: "file",   required: true, maxSelect: 1, mimeTypes: ["image/jpeg","image/png","image/webp"] },
      { name: "link",       type: "text" },
      { name: "sort_order", type: "number", min: 0 },
      { name: "is_active",  type: "bool",   required: true },
      { name: "position",   type: "select", maxSelect: 1, values: ["hero","promo","category"] },
    ],
  });

  // ── 5. reviews (→ products) ───────────────────────────────────────────────
  await createCollection({
    name: "reviews",
    type: "base",
    listRule: "is_approved = true",
    viewRule: "is_approved = true",
    createRule: "",
    updateRule: "@request.auth.id != ''",
    deleteRule: "@request.auth.id != ''",
    fields: [
      {
        name: "product",
        type: "relation",
        required: true,
        maxSelect: 1,
        collectionId: PRODUCTS_ID,
        cascadeDelete: true,
      },
      { name: "customer_name", type: "text",   required: true },
      { name: "rating",        type: "number", required: true, min: 1, max: 5 },
      { name: "comment",       type: "text" },
      { name: "images",        type: "file",   maxSelect: 5, mimeTypes: ["image/jpeg","image/png","image/webp"] },
      { name: "is_approved",   type: "bool" },
    ],
  });

  // ── 6. settings (no collection deps) ──────────────────────────────────────
  await createCollection({
    name: "settings",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != ''",
    deleteRule: "@request.auth.id != ''",
    fields: [
      { name: "key",   type: "text", required: true },
      { name: "value", type: "text" },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_settings_key ON settings (key)"],
  });

  console.log("\n🌸 Hoàn tất! Truy cập PocketBase Admin để kiểm tra:");
  console.log(`   ${PB_URL}/_/\n`);
}

main().catch(console.error);
