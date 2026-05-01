import Link from "next/link";
import pb from "@/lib/pocketbase";
import type { Product, Banner } from "@/lib/types";
import ProductSection from "@/components/home/product-section";
import WhyChooseUs from "@/components/home/why-choose-us";
import OccasionTabs from "@/components/home/occasion-tabs";
import HeroBanner from "@/components/home/hero-banner";
import { localBusinessSchema, organizationSchema } from "@/lib/seo";
import { CONTACT } from "@/lib/constants";

export const revalidate = 3600;

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await pb.collection("products").getList<Product>(1, 8, {
      filter: "is_featured=true && is_active=true",
      sort: "-created",
    });
    return res.items;
  } catch {
    return [];
  }
}

async function getBestSellers(): Promise<Product[]> {
  try {
    const res = await pb.collection("products").getList<Product>(1, 8, {
      filter: "is_best_seller=true && is_active=true",
      sort: "-view_count",
    });
    return res.items;
  } catch {
    return [];
  }
}

async function getBanners(): Promise<Banner[]> {
  try {
    const res = await pb.collection("banners").getList<Banner>(1, 5, {
      filter: "is_active=true && position='hero'",
      sort: "sort_order",
    });
    return res.items;
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [featured, bestSellers, banners] = await Promise.all([
    getFeaturedProducts(),
    getBestSellers(),
    getBanners(),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema()) }}
      />

      {/* Hero */}
      <HeroBanner banners={banners} />

      {/* Occasion Tabs */}
      <OccasionTabs />

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <ProductSection
          title="Bán Chạy Nhất"
          href="/bo-hoa-tuoi"
          products={bestSellers}
        />
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <div className="bg-muted/30">
          <ProductSection
            title="Sản Phẩm Nổi Bật"
            href="/san-pham-noi-bat"
            products={featured}
          />
        </div>
      )}

      {/* Why choose us */}
      <WhyChooseUs />

      {/* CTA Banner */}
      <section className="py-14 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-3">
            Đặt Hoa Ngay – Giao Trong 60 Phút!
          </h2>
          <p className="text-white/80 mb-6 text-sm sm:text-base max-w-lg mx-auto">
            Liên hệ ngay qua Zalo hoặc gọi hotline để được tư vấn và đặt hoa nhanh nhất.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={CONTACT.zalo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-primary font-semibold hover:bg-white/90 transition-colors"
            >
              Nhắn Zalo
            </a>
            <a
              href={`tel:${CONTACT.phone}`}
              className="inline-flex items-center justify-center px-6 py-3 rounded-full border-2 border-white text-white font-semibold hover:bg-white/10 transition-colors"
            >
              {CONTACT.phoneDisplay}
            </a>
          </div>
        </div>
      </section>

      {/* SEO content */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-heading text-xl sm:text-2xl font-bold mb-4">
            Vườn Hoa Tươi – Shop Hoa Tươi TPHCM & Đặt Hoa Online Uy Tín
          </h2>
          <div className="prose prose-sm max-w-none text-muted-foreground space-y-3 text-sm leading-relaxed">
            <p>
              Chào mừng bạn đến với <strong>Vườn Hoa Tươi</strong> – tiệm hoa tươi TPHCM phong
              cách hiện đại toạ lạc tại Phường Vườn Lài và Quận 3. Với hơn 10 năm kinh nghiệm
              và niềm đam mê bất tận với hoa lá, chúng mình tự hào là shop hoa tươi TPHCM được
              khách hàng tin chọn để gửi gắm yêu thương.
            </p>
            <p>
              Dịch vụ đặt hoa online tại Vườn Hoa Tươi mang đến sự tiện lợi tối đa: chỉ với vài
              thao tác, bó hoa tươi thắm sẽ được giao tận tay người nhận trong vòng 60 phút tại
              tất cả các quận nội thành TPHCM.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link href="/hoa-sinh-nhat" className="text-primary hover:underline font-medium">Hoa Sinh Nhật</Link>
              <Link href="/hoa-khai-truong" className="text-primary hover:underline font-medium">Hoa Khai Trương</Link>
              <Link href="/hoa-tot-nghiep" className="text-primary hover:underline font-medium">Hoa Tốt Nghiệp</Link>
              <Link href="/hoa-tinh-yeu" className="text-primary hover:underline font-medium">Hoa Tình Yêu</Link>
              <Link href="/bo-hoa-tulip" className="text-primary hover:underline font-medium">Bó Hoa Tulip</Link>
              <Link href="/hop-hoa-mica" className="text-primary hover:underline font-medium">Hộp Hoa Mica</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
