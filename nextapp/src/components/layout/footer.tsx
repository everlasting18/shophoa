import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { SITE_NAME, SOCIAL } from "@/config";
import { getSiteSettings } from "@/services/settings";
import { getNavItems } from "@/services/navigation";

const socialLinks = [
  {
    label: "Facebook",
    href: SOCIAL.facebook,
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: SOCIAL.instagram,
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="3" />
        <circle cx="17.5" cy="6.5" r="0" fill="currentColor" strokeWidth="3" />
      </svg>
    ),
  },
  {
    label: "Zalo",
    href: "",
    icon: (
      <svg viewBox="0 0 48 48" className="w-4 h-4 fill-current" aria-hidden>
        <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm8.5 28.5H15.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5h4.25L14 22.5c-.38-.7-.12-1.57.58-1.95.7-.38 1.57-.12 1.95.58L22 29.5V19c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5.75l4.5-7.78c.38-.7 1.25-.95 1.95-.57.7.38.95 1.25.57 1.95L27 27h5.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" />
      </svg>
    ),
  },
];

export default async function Footer() {
  const [contact, navItems] = await Promise.all([getSiteSettings(), getNavItems()]);

  return (
    <footer className="relative bg-gradient-to-b from-[#A8B774] to-[#8A9A61] text-white/80 overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />

      {/* ── Row 1: Brand + Navigation ── */}
      <div className="container relative mx-auto px-4 pt-14 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">

          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1 flex flex-col items-center lg:items-start">
            <Link href="/" className="inline-block mb-5 group">
              <img
                src="/images/LO1.png"
                alt={SITE_NAME}
                className="h-12 w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity"
              />
            </Link>
            <p className="text-sm leading-relaxed text-white/60 mb-6 max-w-xs text-center lg:text-left">
              Shop hoa tươi TPHCM — giao hoa nhanh trong ngày, mẫu mã đa dạng, giá cả phải chăng.
            </p>
            <div className="flex gap-2.5">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.label === "Zalo" ? contact.zalo : s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Danh mục */}
          <div>
            <h3 className="font-heading font-semibold text-white mb-5 text-xs uppercase tracking-widest">
              Danh Mục
            </h3>
            <ul className="space-y-3">
              {navItems.slice(0, 6).map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-white/55 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hỗ trợ */}
          <div>
            <h3 className="font-heading font-semibold text-white mb-5 text-xs uppercase tracking-widest">
              Hỗ Trợ
            </h3>
            <ul className="space-y-3">
              {[
                { label: `Về ${SITE_NAME}`, href: "/gioi-thieu" },
                { label: "Chính sách bảo mật", href: "/chinh-sach-bao-mat" },
                { label: "Chính sách giao hàng", href: "/chinh-sach-giao-hang" },
                { label: "Chính sách đổi trả", href: "/chinh-sach-doi-tra" },
                { label: "Liên hệ", href: "/lien-he" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/55 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* ── Row 2: Map + Liên hệ ── */}
      <div className="relative border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-5">

            {/* Liên hệ — hiện trước trên mobile, phải trên desktop */}
            <div className="order-1 lg:order-2 lg:col-span-2 flex flex-col justify-center gap-5 py-8 lg:px-10 border-b border-white/10 lg:border-b-0">
              <h3 className="font-heading font-semibold text-white text-xs uppercase tracking-widest">
                Liên Hệ
              </h3>
              <ul className="space-y-4">
                {contact.addresses.map((addr, i) => (
                  <li key={i} className="flex gap-3 text-sm text-white/70">
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-[#C8B89A]" />
                    <span className="leading-relaxed">{addr}</span>
                  </li>
                ))}
                <li>
                  <a href={`tel:${contact.phone}`} className="flex gap-3 text-sm text-white/70 hover:text-white transition-colors">
                    <Phone className="w-4 h-4 shrink-0 text-[#C8B89A]" />
                    {contact.phoneDisplay}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${contact.email}`} className="flex gap-3 text-sm text-white/70 hover:text-white transition-colors">
                    <Mail className="w-4 h-4 shrink-0 text-[#C8B89A]" />
                    {contact.email}
                  </a>
                </li>
                <li className="flex gap-3 text-sm text-white/70">
                  <Clock className="w-4 h-4 shrink-0 text-[#C8B89A]" />
                  <span>{contact.openingHours}</span>
                </li>
              </ul>
            </div>

            {/* Map — full-bleed mobile, trái desktop */}
            <div className="order-2 lg:order-1 lg:col-span-3 -mx-4 lg:mx-0 h-[220px] lg:h-auto lg:min-h-[280px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4439.747086508634!2d106.6973445!3d10.794070800000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317529d72eb55cef%3A0x2a3b739b07b18400!2zVGnhu4dtIEhvYSBOaMOgIFTDrG5oIC0gQ-G7rWEgSMOhbmcgSG9hIDI0LzI0!5e1!3m2!1svi!2s!4v1779620327478!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0, display: "block" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Bản đồ Tiệm Hoa Nhà Tình"
              />
            </div>

          </div>
        </div>
      </div>

      {/* ── Copyright ── */}
      <div className="relative border-t border-white/10 bg-black/10">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/35">
          <span>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</span>
          <span>Thiết kế bởi <span className="text-white/55">Tiệm hoa nhà tình</span></span>
        </div>
      </div>

    </footer>
  );
}
