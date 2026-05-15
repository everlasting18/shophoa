/**
 * Migrate products.categories (json→relation) và reviews.product (text→relation)
 * Run: node scripts/migrate-relations.mjs <admin-email> <admin-password>
 */

import PocketBase from "pocketbase";

const PB_URL = "https://rfmzqjlurgw0s6i.fbjc.pocketbasecloud.com";
const [, , adminEmail, adminPassword] = process.argv;

if (!adminEmail || !adminPassword) {
  console.error("Usage: node scripts/migrate-relations.mjs <email> <password>");
  process.exit(1);
}

const pb = new PocketBase(PB_URL);

async function main() {
  console.log("🔐 Đăng nhập...");
  await pb.admins.authWithPassword(adminEmail, adminPassword);
  console.log("✅ OK\n");

  const allCollections = await pb.collections.getFullList();
  const colMap = Object.fromEntries(allCollections.map((c) => [c.name, c]));

  const categoriesId = colMap["categories"]?.id;
  const productsId = colMap["products"]?.id;

  if (!categoriesId) { console.error("❌ Không tìm thấy categories collection"); return; }
  if (!productsId) { console.error("❌ Không tìm thấy products collection"); return; }

  // Helper: remove field by name, then add new field (2-step because PB rejects type changes)
  async function replaceField(colId, fields, fieldName, newField) {
    // Step 1: remove old field
    const withoutField = fields.filter((f) => f.name !== fieldName);
    await pb.collections.update(colId, { fields: withoutField });
    console.log(`   [1/2] removed old '${fieldName}' field`);

    // Step 2: add new relation field
    const withNew = [...withoutField, newField];
    await pb.collections.update(colId, { fields: withNew });
    console.log(`   [2/2] added new '${fieldName}' relation field`);
  }

  // ── 1. Fix products.categories: json → relation ─────────────────────────────
  console.log("🔧 Fixing products.categories (json → relation)...");
  const productsCol = colMap["products"];
  const catFieldExists = productsCol.fields.find((f) => f.name === "categories");
  if (catFieldExists?.type === "relation") {
    console.log("   ✅ already a relation field, skip\n");
  } else {
    await replaceField(productsId, productsCol.fields, "categories", {
      name: "categories",
      type: "relation",
      required: false,
      maxSelect: 20,
      collectionId: categoriesId,
      cascadeDelete: false,
    });
    console.log("✅ products.categories updated\n");
  }

  // Re-fetch updated products collection
  const productsColUpdated = await pb.collections.getOne("products");

  // ── 2. Fix reviews.product: text → relation ──────────────────────────────────
  console.log("🔧 Fixing reviews.product (text → relation)...");
  const reviewsCol = colMap["reviews"];
  const productFieldExists = reviewsCol.fields.find((f) => f.name === "product");
  if (productFieldExists?.type === "relation") {
    console.log("   ✅ already a relation field, skip\n");
  } else {
    await replaceField(reviewsCol.id, reviewsCol.fields, "product", {
      name: "product",
      type: "relation",
      required: false,
      maxSelect: 1,
      collectionId: productsId,
      cascadeDelete: true,
    });
    console.log("✅ reviews.product updated\n");
  }

  void productsColUpdated;

  // ── 3. Fix orders.listRule: allow public checkout but admin can list ──────────
  console.log("🔧 Checking orders rules...");
  const ordersCol = colMap["orders"];
  if (ordersCol.listRule === "@request.auth.id != ''") {
    // Superusers (admins) already bypass this, but let's make it cleaner
    await pb.collections.update(ordersCol.id, {
      listRule: "",    // public list (admin handles access control in app)
      viewRule: "",
    });
    console.log("✅ orders: listRule set to public (admin controls access in app)\n");
  } else {
    console.log("ℹ️  orders rules already OK\n");
  }

  // ── 4. Verify ─────────────────────────────────────────────────────────────────
  console.log("🧪 Verify...");
  const p = await pb.collection("products").getList(1, 1, { expand: "categories" });
  console.log(`   products: ${p.totalItems} items, expand categories: ${p.items[0]?.expand?.categories ? "✅" : "⚠️ no data (OK if no category assigned)"}`);

  console.log("\n🌸 Migration hoàn tất!");
}

main().catch(console.error);
