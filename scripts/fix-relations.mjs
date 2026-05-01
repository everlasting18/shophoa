/**
 * Fix broken relation fields in PocketBase collections
 * Run: node scripts/fix-relations.mjs <admin-email> <admin-password>
 */

import PocketBase from "pocketbase";

const PB_URL = "https://rfmzqjlurgw0s6i.fbjc.pocketbasecloud.com";
const [, , adminEmail, adminPassword] = process.argv;

if (!adminEmail || !adminPassword) {
  console.error("Usage: node scripts/fix-relations.mjs <email> <password>");
  process.exit(1);
}

const pb = new PocketBase(PB_URL);

async function main() {
  console.log("🔐 Đăng nhập...");
  await pb.admins.authWithPassword(adminEmail, adminPassword);
  console.log("✅ OK\n");

  // 1. Lấy tất cả collections
  const allCollections = await pb.collections.getFullList();
  const colMap = Object.fromEntries(allCollections.map((c) => [c.name, c.id]));

  console.log("📋 Collections hiện có:");
  allCollections.forEach((c) => console.log(`   ${c.name} → ${c.id}`));
  console.log();

  // 2. Fix products → categories relation
  const productsCol = allCollections.find((c) => c.name === "products");
  if (!productsCol) { console.error("❌ Không tìm thấy collection 'products'"); return; }

  let needsUpdate = false;
  const fixedFields = productsCol.fields.map((field) => {
    if (field.type === "relation" && field.name === "categories") {
      const expectedId = colMap["categories"];
      if (!expectedId) { console.warn("⚠️  categories collection không tồn tại"); return field; }
      if (field.collectionId !== expectedId) {
        console.log(`🔧  Fixing products.categories: ${field.collectionId || "(empty)"} → ${expectedId}`);
        needsUpdate = true;
        return { ...field, collectionId: expectedId };
      } else {
        console.log(`✅  products.categories đã đúng (${expectedId})`);
      }
    }
    return field;
  });

  if (needsUpdate) {
    await pb.collections.update(productsCol.id, { fields: fixedFields });
    console.log("✅  Đã cập nhật products collection\n");
  } else {
    console.log("ℹ️   Không cần cập nhật products collection\n");
  }

  // 3. Fix reviews → products relation
  const reviewsCol = allCollections.find((c) => c.name === "reviews");
  if (reviewsCol) {
    let reviewsNeedUpdate = false;
    const fixedReviewFields = reviewsCol.fields.map((field) => {
      if (field.type === "relation" && field.name === "product") {
        const expectedId = colMap["products"];
        if (expectedId && field.collectionId !== expectedId) {
          console.log(`🔧  Fixing reviews.product: ${field.collectionId || "(empty)"} → ${expectedId}`);
          reviewsNeedUpdate = true;
          return { ...field, collectionId: expectedId };
        }
      }
      return field;
    });
    if (reviewsNeedUpdate) {
      await pb.collections.update(reviewsCol.id, { fields: fixedReviewFields });
      console.log("✅  Đã cập nhật reviews collection\n");
    }
  }

  // 4. Test lại bằng cách fetch products
  console.log("🧪 Test fetch products...");
  try {
    const result = await pb.collection("products").getList(1, 1);
    console.log(`✅  Fetch OK! ${result.totalItems} sản phẩm\n`);
  } catch (e) {
    console.error("❌  Vẫn còn lỗi:", e?.message);
    console.log("\n💡 Thử xoá và tạo lại products collection bằng cách chạy:");
    console.log("   node scripts/setup-pb.mjs (sau khi xoá products trong PocketBase Admin)");
  }

  console.log("🏁 Xong!");
}

main().catch(console.error);
