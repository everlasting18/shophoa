import Link from "next/link";
import pb from "@/services/pocketbase";
import type { Product, Banner } from "@/schema";
import HeroBanner from "@/components/home/hero-banner";
import ProductSection from "@/components/home/product-section";
import { ArrowRight, Flower2, Award, Heart } from "lucide-react";

export const revalidate = 3600;

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await pb.collection("products").getList<Product>(1, 8, {
      filter: "is_featured=true && is_active=true",
      sort: "-created",
    });
    return res.items;
  } catch { return []; }
}

async function getBestSellers(): Promise<Product[]> {
  try {
    const res = await pb.collection("products").getList<Product>(1, 8, {
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
        <div className="bg-white">
          <ProductSection
            title="Featured"
            subtitle="Curated for you"
            href="/san-pham-noi-bat"
            products={featured}
          />
        </div>
      )}

      {/* About snippet */}
      <section className="py-16 sm:py-20 bg-accent/50">
        <div className="container mx-auto px-6 max-w-2xl text-center">
          <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase mb-4">Our story</p>
          <p className="text-foreground/80 leading-relaxed text-sm sm:text-base mb-8 max-w-xl mx-auto">
            We are a small, family-owned botanical boutique. We help people spread love through our
            handcrafted flower arrangements, plants, and curated gifts.
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

    </>
  );
}
