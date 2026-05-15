import type { Metadata } from "next";
import Link from "next/link";
import pb from "@/services/pocketbase";
import type { Product, Banner, Category } from "@/schema";
import HeroBanner from "@/components/home/hero-banner";
import { ArrowRight, Flower2 } from "lucide-react";
import ProductSection from "@/components/home/product-section";
import CategoryGrid from "@/components/home/category-grid";
import { getSiteSettings } from "@/services/settings";
import { localBusinessSchema } from "@/services/seo";

export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  keywords: [
    "đặt hoa tươi TPHCM", "shop hoa tươi TPHCM", "hoa sinh nhật TPHCM",
    "hoa khai trương", "hoa tốt nghiệp", "điện hoa hỏa tốc 60 phút",
    "tiệm hoa nhà tình", "hoa tươi quận 3", "đặt hoa online",
  ],
  openGraph: {
    images: [{ url: "/images/banner1.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    images: ["/images/banner1.jpg"],
  },
};

async function getBestSellers(): Promise<Product[]> {
  try {
    const res = await pb.collection("products").getList<Product>(1, 12, {
      filter: "is_best_seller=true && is_active=true",
      sort: "-is_best_seller,-created",
    });
    return res.items;
  } catch { return []; }
}

async function getBanners(): Promise<Banner[]> {
  try {
    const res = await pb.collection("banners").getList<Banner>(1, 5, {
      filter: "is_active=true",
      sort: "sort_order",
    });
    return res.items;
  } catch { return []; }
}

async function getParentCategories(): Promise<Category[]> {
  try {
    const res = await pb.collection("categories").getFullList<Category>({
      filter: 'parent="" && is_active=true',
      sort: "sort_order",
    });
    return res;
  } catch { return []; }
}

async function getAllProducts(): Promise<Product[]> {
  try {
    const res = await pb.collection("products").getList<Product>(1, 60, {
      filter: "is_active=true",
      sort: "-is_best_seller,-created",
    });
    return res.items;
  } catch { return []; }
}

export default async function HomePage() {
  const [bestSellers, banners, allProducts, parentCategories, contact] = await Promise.all([
    getBestSellers(),
    getBanners(),
    getAllProducts(),
    getParentCategories(),
    getSiteSettings(),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema(contact)) }}
      />

      {/* Hero */}
      <HeroBanner banners={banners} />

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <ProductSection
          title="Bán Chạy Nhất"
          subtitle="Được yêu thích tuần này"
          href="/bo-hoa-tuoi"
          products={bestSellers}
        />
      )}

      {/* Categories + Products */}
      <CategoryGrid categories={parentCategories} products={allProducts} />

      {/* CTA Banner */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#5d714f] to-[#3d4f33]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="container relative mx-auto px-4 py-16 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-white/90 text-xs font-medium mb-5">
            <Flower2 className="w-3.5 h-3.5" />
            Giao hoa hỏa tốc TPHCM
          </div>
          <h2 className="font-heading text-2xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            Đặt Hoa Ngay – Giao Trong 60 Phút!
          </h2>
          <p className="text-white/70 mb-8 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Liên hệ ngay qua Zalo hoặc gọi hotline để được tư vấn và đặt hoa nhanh nhất.
            Hoa tươi nhập mới mỗi ngày.
          </p>
          <Link
            href="/gioi-thieu"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
          >
            Learn more
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      {/* SEO content */}
      <section className="py-14 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-heading text-xl sm:text-2xl font-bold mb-5 tracking-tight">
            Tiệm hoa nhà tình – Shop Hoa Tươi TPHCM & Đặt Hoa Online Uy Tín
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed text-sm">
            <p>
              Chào mừng bạn đến với <strong className="text-foreground">Tiệm hoa nhà tình</strong> – tiệm hoa tươi TPHCM phong
              cách hiện đại, nơi mỗi bó hoa đều là một tác phẩm nghệ thuật truyền tải trọn vẹn cảm
              xúc của người tặng.
            </p>
            <p>
              Dịch vụ đặt hoa online tại Tiệm hoa nhà tình mang đến sự tiện lợi tối đa: chỉ với vài
              thao tác, bó hoa tươi thắm sẽ được giao tận tay ngườithương trong vòng 60 phút tại
              tất cả các quận nội thành TPHCM.
            </p>
            <div className="flex gap-3 flex-wrap pt-1">
              <Link href="/hoa-sinh-nhat" className="text-primary hover:underline font-medium text-sm">Hoa Sinh Nhật</Link>
              <Link href="/hoa-khai-truong" className="text-primary hover:underline font-medium text-sm">Hoa Khai Trương</Link>
              <Link href="/hoa-tot-nghiep" className="text-primary hover:underline font-medium text-sm">Hoa Tốt Nghiệp</Link>
              <Link href="/hoa-tinh-yeu" className="text-primary hover:underline font-medium text-sm">Hoa Tình Yêu</Link>
              <Link href="/bo-hoa-tulip" className="text-primary hover:underline font-medium text-sm">Bó Hoa Tulip</Link>
              <Link href="/hop-hoa-mica" className="text-primary hover:underline font-medium text-sm">Hộp Hoa Mica</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
