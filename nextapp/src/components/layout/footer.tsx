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
      <div className="container relative mx-auto px-4 pt-14 pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-10 mb-12">
          {/* Brand col */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-4 flex flex-col items-center sm:items-start">
            <Link href="/" className="inline-block mb-6 group">
              <img
                src="/images/LO1.png"
                alt={SITE_NAME}
                className="h-12 w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity"
              />
            </Link>
            <p className="text-sm leading-relaxed text-white/60 mb-6 max-w-sm text-center sm:text-left">
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
          <div className="col-span-2 sm:col-span-1 lg:col-span-3">
            <h3 className="font-heading font-semibold text-white mb-5 text-sm uppercase tracking-wider">
              Liên Hệ
            </h3>
            <ul className="space-y-3.5">
              {contact.addresses.map((addr, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-white/60">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-[#C8B89A]" />
                  <span>{addr}</span>
                </li>
              ))}
              <li>
                <a
                  href={`tel:${contact.phone}`}
                  className="flex gap-2.5 text-sm text-white/60 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 shrink-0 text-[#C8B89A]" />
                  {contact.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="flex gap-2.5 text-sm text-white/60 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4 shrink-0 text-[#C8B89A]" />
                  {contact.email}
                </a>
              </li>
              <li className="flex gap-2.5 text-sm text-white/60">
                <Clock className="w-4 h-4 shrink-0 text-[#C8B89A]" />
                <span>{contact.openingHours}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}