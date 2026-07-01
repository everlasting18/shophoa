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

  // ── Drop existing (reverse dependency order) ──────────────────────────
  console.log("🗑  Xoá collections cũ...\n");
  for (const name of ["orders", "banners", "settings", "products", "categories"]) {
    await dropCollection(name);
  }
  console.log();

  console.log("📦 Tạo collections...\n");

  // ── 1. categories ─────────────────────────────────────────────────────
  await createCollection({
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
      { name: "sort_order",      type: "number", min: 0 },
      { name: "is_active",       type: "bool",   required: true },
      // Parent field added below after we have the collection ID
    ],
    indexes: ["CREATE UNIQUE INDEX idx_categories_slug ON categories (slug)"],
  });

  const categoriesCol = await pb.collections.getOne("categories");
  const CATEGORIES_ID = categoriesCol.id;
  console.log(`   → categories ID: ${CATEGORIES_ID}`);

  // Add parent field (self-reference, needs collection ID)
  await pb.collections.update(CATEGORIES_ID, {
    fields: [
      ...categoriesCol.fields,
      {
        name: "parent",
        type: "relation",
        required: false,
        maxSelect: 1,
        collectionId: CATEGORIES_ID,
        cascadeDelete: false,
      },
    ],
  });
  console.log(`   → parent field added\n`);

  // ── 2. products (→ categories) ─────────────────────────────────────────
  await createCollection({
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
      { name: "images",            type: "file",     maxSelect: 4, mimeTypes: ["image/jpeg","image/png","image/webp"] },
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
    ],
    indexes: ["CREATE UNIQUE INDEX idx_products_slug ON products (slug)"],
  });

  const productsCol = await pb.collections.getOne("products");
  const PRODUCTS_ID = productsCol.id;
  console.log(`   → products ID: ${PRODUCTS_ID}\n`);

  // ── 3. orders ──────────────────────────────────────────────────────────
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
      { name: "qr_token",          type: "text",   max: 60 },
      { name: "customer_name",     type: "text",   required: true },
      { name: "customer_phone",    type: "text",   required: true },
      { name: "recipient_name",    type: "text" },
      { name: "recipient_phone",   type: "text" },
      { name: "recipient_address", type: "text" },
      { name: "delivery_date",     type: "date",   required: true },
      { name: "delivery_time",     type: "text",   required: true },
      { name: "items",             type: "json" },
      { name: "subtotal",          type: "number", min: 0 },
      { name: "total",             type: "number", min: 0 },
      { name: "note",              type: "text" },
      { name: "status",            type: "select", required: true, maxSelect: 1, values: ["pending","confirmed","cancelled"] },
      { name: "payment_method",    type: "select", required: true, maxSelect: 1, values: ["bank_transfer"] },
    ],
  });
  console.log();

  // ── 4. banners ─────────────────────────────────────────────────────────
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

  // ── 5. settings ────────────────────────────────────────────────────────
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

  console.log("\n🌸 Hoàn tất! Truy cập để kiểm tra:");
  console.log(`   ${PB_URL}/_/\n`);
}

main().catch(console.error);
