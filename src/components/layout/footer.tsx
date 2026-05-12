import Link from "next/link";
import { MapPin, Phone, Mail, Clock, Flower2, Heart } from "lucide-react";
import { SITE_NAME } from "@/config";
import { getNavItems } from "@/services/navigation";
import { socialLinks } from "./social-icons";
import { getSiteSettings } from "@/services/settings";

export default async function Footer() {
  const [navItems, contact] = await Promise.all([getNavItems(), getSiteSettings()]);

  return (
    <footer className="relative bg-gradient-to-b from-[#4d5c43] to-[#2e3d27] text-white/80 overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
      <div className="container relative mx-auto px-4 pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 mb-12">
          {/* Brand col */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block mb-6 group">
              <img
                src="/images/LOGO2.png"
                alt={SITE_NAME}
                className="h-12 w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity"
              />
            </Link>
            <p className="text-sm leading-relaxed text-white/60 mb-6 max-w-sm">
              Shop hoa tươi TPHCM, giao hoa nhanh trong ngày, mẫu mã đa dạng, giá cả phải chăng.
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
          <div className="lg:col-span-3">
            <h3 className="font-heading font-semibold text-white mb-5 text-sm uppercase tracking-wider">
              Danh Mục
            </h3>
            <ul className="space-y-2.5">
              {navItems.slice(0, 6).map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/55 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Chính sách */}
          <div className="lg:col-span-2">
            <h3 className="font-heading font-semibold text-white mb-5 text-sm uppercase tracking-wider">
              Hỗ Trợ
            </h3>
            <ul className="space-y-2.5">
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

          {/* Liên hệ */}
          <div className="lg:col-span-3">
            <h3 className="font-heading font-semibold text-white mb-5 text-sm uppercase tracking-wider">
              Liên Hệ
            </h3>
            <ul className="space-y-3.5">
              {contact.addresses.map((addr, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-white/60">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-[#abb487]" />
                  <span>{addr}</span>
                </li>
              ))}
              <li>
                <a
                  href={`tel:${contact.phone}`}
                  className="flex gap-2.5 text-sm text-white/60 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 shrink-0 text-[#abb487]" />
                  {contact.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="flex gap-2.5 text-sm text-white/60 hover:text-white transition-colors"
                >
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
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
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
