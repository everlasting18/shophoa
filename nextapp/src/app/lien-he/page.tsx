import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone, Mail, Clock, MessageCircle, Home, ChevronRight } from "lucide-react";
import { SITE_NAME } from "@/config";
import { getSiteSettings } from "@/services/settings";
import { googleMapsLink } from "@/config";

export const metadata: Metadata = {
  title: "Liên Hệ",
  description: `Liên hệ đặt hoa tươi tại ${SITE_NAME} TPHCM. Hotline: 0976.491.322. Zalo, email, 2 cửa hàng tại Quận 3 và Vườn Lài.`,
  alternates: { canonical: "/lien-he" },
};

export default async function ContactPage() {
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
        <span className="text-foreground font-medium">Liên hệ</span>
      </nav>

      <div className="mb-10">
        <h1 className="font-heading text-3xl font-bold mb-2 tracking-tight">Liên Hệ</h1>
        <p className="text-muted-foreground">Chúng mình luôn sẵn sàng hỗ trợ bạn 7 ngày một tuần.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
        {/* Hotline */}
        <div className="rounded-2xl border border-border/60 p-6 bg-white hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-heading font-semibold">Hotline</h2>
          </div>
          <a
            href={`tel:${contact.phone}`}
            className="text-xl font-bold text-primary hover:underline block mb-1"
          >
            {contact.phoneDisplay}
          </a>
          <p className="text-sm text-muted-foreground">Gọi trực tiếp để đặt hoa hoặc tư vấn</p>
        </div>

        {/* Zalo */}
        <div className="rounded-2xl border border-border/60 p-6 bg-white hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-[#0068FF]" />
            </div>
            <h2 className="font-heading font-semibold">Zalo OA</h2>
          </div>
          <a
            href={contact.zalo}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl font-bold text-[#0068FF] hover:underline block mb-1"
          >
            {contact.phoneDisplay}
          </a>
          <p className="text-sm text-muted-foreground">Nhắn Zalo để đặt hàng & nhận tư vấn nhanh nhất</p>
        </div>

        {/* Email */}
        <div className="rounded-2xl border border-border/60 p-6 bg-white hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-heading font-semibold">Email</h2>
          </div>
          <a
            href={`mailto:${contact.email}`}
            className="text-base font-bold text-primary hover:underline block mb-1"
          >
            {contact.email}
          </a>
          <p className="text-sm text-muted-foreground">Phản hồi trong vòng 24 giờ làm việc</p>
        </div>

        {/* Giờ làm việc */}
        <div className="rounded-2xl border border-border/60 p-6 bg-white hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-heading font-semibold">Giờ Làm Việc</h2>
          </div>
          <p className="text-base font-bold mb-1">7:00 – 21:00</p>
          <p className="text-sm text-muted-foreground">Tất cả các ngày trong tuần, kể cả Lễ Tết</p>
        </div>
      </div>

      {/* Addresses */}
      <div className="rounded-2xl border border-border/60 p-6 sm:p-8 bg-white mb-10">
        <h2 className="font-heading font-semibold text-lg mb-5 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Địa Chỉ Cửa Hàng
        </h2>
        <div className="space-y-4">
          {contact.addresses.map((addr, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-7 h-7 rounded-full bg-primary text-white text-xs flex items-center justify-center shrink-0 font-bold mt-0.5">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-medium">{addr}</p>
                <a
                  href={googleMapsLink(addr)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline mt-1 inline-flex items-center gap-1"
                >
                  Xem bản đồ →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <a
          href={contact.zalo}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#0068FF] text-white font-semibold text-sm hover:bg-[#0068FF]/90 transition-colors shadow-lg shadow-blue-500/15"
        >
          <MessageCircle className="w-4 h-4" />
          Nhắn Zalo Ngay
        </a>
      </div>
    </div>
  );
}
