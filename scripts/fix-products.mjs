import PocketBase from "pocketbase";

const PB_URL = "https://rfmzqjlurgw0s6i.fbjc.pocketbasecloud.com";
const pb = new PocketBase(PB_URL);

async function main() {
  await pb.admins.authWithPassword("trantanphat2002@gmail.com", "MayB_@wsxBac");
  console.log("✅ Auth OK\n");

  const allCols = await pb.collections.getFullList();
  const colMap = Object.fromEntries(allCols.map(c => [c.name, c]));

  // ── Diagnose ──────────────────────────────────────────────────
  console.log("🔍 Diagnosis:");
  for (const name of ["categories", "products", "orders"]) {
    try {
      const r = await pb.collection(name).getList(1, 1);
      console.log(`  ✅ ${name}: OK (${r.totalItems} records)`);
    } catch(e) {
      console.log(`  ❌ ${name}: ${e.status} – ${e.message}`);
    }
  }
  console.log();

  const CATEGORIES_ID = colMap["categories"]?.id;
  if (!CATEGORIES_ID) { console.error("categories not found"); return; }

  // ── Delete + recreate products ─────────────────────────────────
  if (colMap["products"]) {
    // First delete reviews that depend on products
    if (colMap["reviews"]) {
      console.log("🗑  Deleting reviews...");
      await pb.collections.delete(colMap["reviews"].id);
    }
    console.log("🗑  Deleting products...");
    await pb.collections.delete(colMap["products"].id);
  }

  console.log("🏗  Creating products (description=text, not editor)...");
  const created = await pb.collections.create({
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
      { name: "description",       type: "text" },
      { name: "occasions",         type: "json" },
      { name: "categories",        type: "relation", required: false, maxSelect: 10, collectionId: CATEGORIES_ID, cascadeDelete: false },
      { name: "is_featured",       type: "bool" },
      { name: "is_best_seller",    type: "bool" },
      { name: "is_active",         type: "bool",     required: true },
      { name: "seo_title",         type: "text" },
      { name: "seo_description",   type: "text" },
      { name: "view_count",        type: "number",   min: 0 },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_products_slug ON products (slug)"],
  });
  console.log(`✅ products created → ID: ${created.id}\n`);

  // ── Recreate reviews ───────────────────────────────────────────
  console.log("🏗  Recreating reviews...");
  await pb.collections.create({
    name: "reviews",
    type: "base",
    listRule: "is_approved = true",
    viewRule: "is_approved = true",
    createRule: "",
    updateRule: "@request.auth.id != ''",
    deleteRule: "@request.auth.id != ''",
    fields: [
      { name: "product",       type: "relation", required: false, maxSelect: 1, collectionId: created.id, cascadeDelete: true },
      { name: "customer_name", type: "text",     required: true },
      { name: "rating",        type: "number",   required: true, min: 1, max: 5 },
      { name: "comment",       type: "text" },
      { name: "images",        type: "file",     maxSelect: 5, mimeTypes: ["image/jpeg","image/png","image/webp"] },
      { name: "is_approved",   type: "bool" },
    ],
  });
  console.log("✅ reviews created\n");

  // ── Verify fetch ───────────────────────────────────────────────
  try {
    const r = await pb.collection("products").getList(1, 1, { sort: "-id" });
    console.log("🧪 products fetch:", r.totalItems, "records (0 = OK, need seed)\n");
  } catch(e) {
    console.error("❌ still failing:", e.status, e.message);
    return;
  }

  console.log("🌸 Done! Run seed: node scripts/seed-data.mjs ...");
}

main().catch(console.error);
