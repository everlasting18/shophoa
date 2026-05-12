import Link from "next/link";
import pb from "@/services/pocketbase";
import type { Product, Banner } from "@/schema";
import HeroBanner from "@/components/home/hero-banner";
import CategorySlider from "@/components/home/category-slider";
import { localBusinessSchema, organizationSchema } from "@/services/seo";
import { getSiteSettings } from "@/services/settings";
import { ArrowRight, Flower2 } from "lucide-react";

export const revalidate = 3600;

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await pb.collection("products").getList<Product>(1, 12, {
      filter: "is_featured=true && is_active=true",
      sort: "-created",
    });
    return res.items;
  } catch { return []; }
}

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

const HIGHLIGHTS = [
  { icon: Flower2, title: "Hand-picked for you", desc: "Each stem is carefully selected for freshness and beauty." },
  { icon: Award, title: "Unique arrangements", desc: "Designed by our florists with creativity and love." },
  { icon: Heart, title: "Best way to say you care", desc: "The most thoughtful gift for every occasion." },
];

export default async function HomePage() {
  const [featured, bestSellers, banners] = await Promise.all([
    getFeaturedProducts(),
    getBestSellers(),
    getBanners(),
  ]);

  return (
    <>
      {/* Hero */}
      <HeroBanner banners={banners} />
      <CategorySlider />

      {/* Highlights */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-12">
            <p className="text-[11px] tracking-[0.25em] text-muted-foreground uppercase mb-3">Why choose us</p>
            <h2 className="font-heading text-2xl sm:text-3xl font-medium tracking-tight text-foreground">
              Handcrafted with care
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {HIGHLIGHTS.map((h) => (
              <div key={h.title} className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-accent inline-flex items-center justify-center mb-1">
                  <h.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-heading font-medium text-foreground text-sm">{h.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px] mx-auto">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <ProductSection
          title="Best Sellers"
          subtitle="Most loved this week"
          href="/bo-hoa-tuoi"
          products={bestSellers}
        />
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <div>
          <ProductSection
            title="Featured"
            subtitle="Curated for you"
            href="/san-pham-noi-bat"
            products={featured}
          />
        </div>
      )}

      {/* Why choose us */}
      <WhyChooseUs />

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
