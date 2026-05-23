import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone, Mail, Clock, Award, Truck, Heart, Home, ChevronRight, Flower2, ShoppingBag } from "lucide-react";
import { SITE_NAME } from "@/config";
import { getSiteSettings } from "@/services/settings";

export const metadata: Metadata = {
  title: "Giới Thiệu",
  description: `${SITE_NAME} – Shop hoa tươi uy tín tại TPHCM. Chuyên hoa sinh nhật, khai trương, tình yêu. Giao hỏa tốc 60 phút trong nội thành.`,
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
        <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-3 tracking-tight">{SITE_NAME}</h1>
        <p className="text-xs font-semibold text-primary/70 uppercase tracking-widest mb-5">
          Cửa hàng hoa hoạt động 24/24
        </p>
        <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed mb-6">
          Mỗi bó hoa đều được chăm chút kỹ từ màu sắc, kiểu dáng đến cách gói —
          để khi nhận được, ai cũng sẽ mím cười thật xinh 🌷
        </p>
        <div className="inline-flex flex-col gap-2 text-left mb-7 text-sm text-muted-foreground">
          {["Hoa tươi mỗi ngày", "Thiết kế theo yêu cầu", "Giao hoa nhanh – hình thật như mẫu", "Nhận cắm hoa sự kiện, hoa quà tặng, hoa decor"].map((item) => (
            <span key={item} className="flex items-center gap-2">
              <span className="w-5 shrink-0 text-center text-base leading-none">✨</span>
              <span>{item}</span>
            </span>
          ))}
        </div>
        <blockquote className="inline-block max-w-sm text-center italic text-muted-foreground text-sm leading-relaxed border-t border-b border-primary/20 py-3 px-4">
          "Có những điều khó nói thành lời… hãy để hoa thay bạn gửi gắm." 💐
        </blockquote>
      </div>

      {/* Values */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-14">
        {[
          { icon: <Truck className="w-5 h-5" />, title: "Giao Hỏa Tốc", desc: "Giao tận nơi trong 2h nội thành TP.HCM" },
          { icon: <Award className="w-5 h-5" />, title: "Hoa Thiết Kế Theo Yêu Cầu", desc: "Nhận cover theo yêu cầu.<br/>Trang trí hoa sinh nhật, gia tiên" },
          { icon: <Heart className="w-5 h-5" />, title: "Thiệp Miễn Phí", desc: "Kèm thiệp tay viết theo yêu cầu, không tính phí" },
        ].map((item) => (
          <div key={item.title} className="text-center p-6 rounded-2xl bg-white border border-border/60 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-accent mb-4">
              <span className="text-primary">{item.icon}</span>
            </div>
            <h3 className="font-heading font-semibold mb-1.5 text-[15px]">{item.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: item.desc }} />
          </div>
        ))}
      </div>
      {/* GrabMart callout */}
      <div className="flex items-center gap-4 bg-[#00B14F]/10 border border-[#00B14F]/20 rounded-2xl px-5 py-4 mb-14">
        <div className="w-10 h-10 rounded-xl bg-[#00B14F] flex items-center justify-center shrink-0">
          <ShoppingBag className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Có mặt trên GrabMart</p>
          <p className="text-xs text-muted-foreground">Đặt hoa ngay trên ứng dụng Grab — giao nhanh tận nơi</p>
        </div>
        <a
          href="https://app.grab.com/s/3mI7RZnm?sourceID=20260523_162334_526E7D43F340453EAD0063A2CDC0723C_MEXMPS"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-4 py-2 rounded-full bg-[#00B14F] text-white text-xs font-semibold hover:bg-[#009940] transition-colors"
        >
          Mở Grab
        </a>
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

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/15"
        >
          Xem Sản Phẩm Ngay
        </Link>
        <a
          href="https://app.grab.com/s/3mI7RZnm?sourceID=20260523_162334_526E7D43F340453EAD0063A2CDC0723C_MEXMPS"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#00B14F] text-white font-semibold text-sm hover:bg-[#009940] transition-colors shadow-lg shadow-[#00B14F]/20"
        >
          <ShoppingBag className="w-4 h-4" />
          Đặt trên GrabMart
        </a>
      </div>
    </div>
  );
}
