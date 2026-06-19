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

        {/* WhatsApp */}
        <div className="rounded-2xl border border-border/60 p-6 bg-white hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#25D366]" aria-hidden="true">
                <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.515 5.26l-.999 3.648 3.973-1.042zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.078 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
            </div>
            <h2 className="font-heading font-semibold">WhatsApp</h2>
          </div>
          <a
            href={contact.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl font-bold text-[#25D366] hover:underline block mb-1"
          >
            {contact.phoneDisplay}
          </a>
          <p className="text-sm text-muted-foreground">Nhắn WhatsApp để đặt hàng & tư vấn (khách quốc tế)</p>
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

      {/* Google Maps */}
      <div className="rounded-2xl border border-border/60 overflow-hidden mb-10">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4439.747086508634!2d106.6973445!3d10.794070800000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317529d72eb55cef%3A0x2a3b739b07b18400!2zVGnhu4dtIEhvYSBOaMOgIFTDrG5oIC0gQ-G7rWEgSMOhbmcgSG9hIDI0LzI0!5e1!3m2!1svi!2s!4v1779620327478!5m2!1svi!2s"
          width="100%"
          height="400"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Bản đồ Tiệm Hoa Nhà Tình"
        />
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
