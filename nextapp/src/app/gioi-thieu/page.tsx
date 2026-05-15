import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone, Mail, Clock, Award, Truck, Heart, Home, ChevronRight, Flower2 } from "lucide-react";
import { SITE_NAME } from "@/config";
import { getSiteSettings } from "@/services/settings";

export const metadata: Metadata = {
  title: `Giới Thiệu | ${SITE_NAME}`,
  description: "Vườn Hoa Tươi – Shop hoa tươi uy tín tại TPHCM. Chuyên hoa sinh nhật, khai trương, tình yêu. Giao hỏa tốc 60 phút trong nội thành.",
  alternates: { canonical: "/gioi-thieu" },
};

export default async function AboutPage() {
  const contact = await getSiteSettings();
  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-1 flex-wrap">
        <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          Trang chủ
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">Giới thiệu</span>
      </nav>

      {/* Hero */}
      <div className="text-center mb-14">
        <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-5">
          <Flower2 className="w-8 h-8 text-primary" />
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-3 tracking-tight">Vườn Hoa Tươi</h1>
        <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Chuyên cung cấp hoa tươi cao cấp, phong cách <em>Garden Mix Vintage</em> hiện đại tại TPHCM.
          Mỗi bó hoa là một tác phẩm nghệ thuật được chăm chút tỉ mỉ.
        </p>
      </div>

      {/* Values */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-14">
        {[
          { icon: <Truck className="w-5 h-5" />, title: "Giao Hỏa Tốc", desc: "60 phút tới tay bạn trong nội thành TPHCM" },
          { icon: <Award className="w-5 h-5" />, title: "Hoa Giống Mẫu 100%", desc: "Cam kết hoa y chang ảnh, hoàn tiền nếu không đúng" },
          { icon: <Heart className="w-5 h-5" />, title: "Thiệp Miễn Phí", desc: "Kèm thiệp tay viết theo yêu cầu, không tính phí" },
        ].map((item) => (
          <div key={item.title} className="text-center p-6 rounded-2xl bg-white border border-border/60 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-accent mb-4">
              <span className="text-primary">{item.icon}</span>
            </div>
            <h3 className="font-heading font-semibold mb-1.5 text-[15px]">{item.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Story */}
      <div className="prose prose-sm max-w-none mb-14">
        <h2 className="font-heading text-2xl font-bold mb-5 tracking-tight">Câu Chuyện Của Chúng Mình</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Vườn Hoa Tươi được thành lập với tình yêu dành cho những loài hoa tươi và nghệ thuật cắm hoa.
          Chúng mình mang đến những bó hoa mang phong cách <strong className="text-foreground">Garden Mix Vintage</strong> — sự kết hợp
          tinh tế giữa các loài hoa nhập khẩu và hoa nội địa được chăm chọn kỹ lưỡng.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Đội ngũ của chúng mình gồm những nghệ nhân cắm hoa với nhiều năm kinh nghiệm, luôn theo dõi
          xu hướng hoa mới nhất để mang đến những mẫu hoa đẹp nhất cho khách hàng.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Với 2 cửa hàng tại Quận 3 và khu vực Vườn Lài, chúng mình phục vụ giao hoa toàn TPHCM
          với dịch vụ hỏa tốc 60 phút, đảm bảo hoa luôn tươi tắn khi đến tay ngườinhận.
        </p>
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-border/60 mb-10">
        <h2 className="font-heading text-xl font-bold mb-6">Thông Tin Liên Hệ</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4 text-primary" />
            </div>
            <a href={`tel:${contact.phone}`} className="hover:text-primary transition-colors font-medium">
              {contact.phoneDisplay}
            </a>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-primary" />
            </div>
            <a href={`mailto:${contact.email}`} className="hover:text-primary transition-colors">
              {contact.email}
            </a>
          </div>
          {contact.addresses.map((addr, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <span className="text-muted-foreground">{addr}</span>
            </div>
          ))}
          <div className="flex items-center gap-3 text-sm">
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <span className="text-muted-foreground">7:00 – 21:00 · Tất cả các ngày trong tuần</span>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/15"
        >
          Xem Sản Phẩm Ngay
        </Link>
      </div>
    </div>
  );
}
