import Link from "next/link";
import { MapPin, Phone, Mail, Clock, Heart } from "lucide-react";
import { SITE_NAME, NAV_ITEMS, SOCIAL } from "@/config";
import { getSiteSettings } from "@/services/settings";

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
  const contact = await getSiteSettings();

  return (
    <footer className="relative bg-gradient-to-b from-[#4d5c43] to-[#2e3d27] text-white/80 overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />

      <div className="container relative mx-auto px-4 pt-10 pb-6">

        {/* Mobile: logo + tagline + social */}
        <div className="flex flex-col items-center text-center mb-8 lg:hidden">
          <Link href="/" className="inline-block mb-3">
            <img src="/images/LOGO2.png" alt={SITE_NAME} className="h-10 w-auto object-contain opacity-90" />
          </Link>
          <p className="text-xs text-white/50 mb-4 max-w-xs leading-relaxed">
            Shop hoa tươi TPHCM – giao hoa nhanh trong ngày, mẫu đa dạng.
          </p>
          <div className="flex gap-2.5 mb-6">
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

          {/* Mobile contact pills */}
          <div className="flex flex-wrap justify-center gap-2 w-full">
            <a href={`tel:${contact.phone}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-xs text-white/80 hover:bg-white/20 transition-all">
              <Phone className="w-3.5 h-3.5 text-[#abb487]" />
              {contact.phoneDisplay}
            </a>
            <a href={contact.zalo} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-xs text-white/80 hover:bg-white/20 transition-all">
              <span className="text-[#abb487] text-xs font-bold">Z</span>
              Zalo
            </a>
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-xs text-white/60">
              <Clock className="w-3.5 h-3.5 text-[#abb487]" />
              {contact.openingHours}
            </span>
          </div>
        </div>

        {/* Mobile: 2-col links */}
        <div className="grid grid-cols-2 gap-6 mb-8 lg:hidden">
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Danh Mục</h3>
            <ul className="space-y-2">
              {NAV_ITEMS.slice(0, 6).map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-xs text-white/55 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Hỗ Trợ</h3>
            <ul className="space-y-2">
              {[
                { label: `Về ${SITE_NAME}`, href: "/gioi-thieu" },
                { label: "Chính sách bảo mật", href: "/chinh-sach-bao-mat" },
                { label: "Chính sách giao hàng", href: "/chinh-sach-giao-hang" },
                { label: "Chính sách đổi trả", href: "/chinh-sach-doi-tra" },
                { label: "Liên hệ", href: "/lien-he" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-xs text-white/55 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Desktop layout */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-10 mb-12">
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block mb-5">
              <img src="/images/LOGO2.png" alt={SITE_NAME} className="h-12 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity" />
            </Link>
            <p className="text-sm leading-relaxed text-white/60 mb-5 max-w-sm">
              Shop hoa tươi TPHCM, giao hoa nhanh trong ngày, mẫu mã đa dạng, giá cả phải chăng.
            </p>
            <div className="flex gap-2.5">
              {socialLinks.map((s) => (
                <a key={s.label} href={s.label === "Zalo" ? contact.zalo : s.href}
                  target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
          <div className="lg:col-span-3">
            <h3 className="font-heading font-semibold text-white mb-5 text-sm uppercase tracking-wider">Danh Mục</h3>
            <ul className="space-y-2.5">
              {NAV_ITEMS.slice(0, 6).map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-white/55 hover:text-white transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-2">
            <h3 className="font-heading font-semibold text-white mb-5 text-sm uppercase tracking-wider">Hỗ Trợ</h3>
            <ul className="space-y-2.5">
              {[
                { label: `Về ${SITE_NAME}`, href: "/gioi-thieu" },
                { label: "Chính sách bảo mật", href: "/chinh-sach-bao-mat" },
                { label: "Chính sách giao hàng", href: "/chinh-sach-giao-hang" },
                { label: "Chính sách đổi trả", href: "/chinh-sach-doi-tra" },
                { label: "Liên hệ", href: "/lien-he" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/55 hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-3">
            <h3 className="font-heading font-semibold text-white mb-5 text-sm uppercase tracking-wider">Liên Hệ</h3>
            <ul className="space-y-3.5">
              {contact.addresses.map((addr, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-white/60">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-[#abb487]" />
                  <span>{addr}</span>
                </li>
              ))}
              <li>
                <a href={`tel:${contact.phone}`} className="flex gap-2.5 text-sm text-white/60 hover:text-white transition-colors">
                  <Phone className="w-4 h-4 shrink-0 text-[#abb487]" />
                  {contact.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.email}`} className="flex gap-2.5 text-sm text-white/60 hover:text-white transition-colors">
                  <Mail className="w-4 h-4 shrink-0 text-[#abb487]" />
                  {contact.email}
                </a>
              </li>
              <li className="flex gap-2.5 text-sm text-white/60">
                <Clock className="w-4 h-4 shrink-0 text-[#abb487]" />
                <span>{contact.openingHours}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/40">
          <p>© {new Date().getFullYear()} {SITE_NAME}. MST: 031541764</p>
          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3 text-[#abb487]" />
            <span>Công ty TNHH Thương Mại Dịch Vụ {SITE_NAME}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
