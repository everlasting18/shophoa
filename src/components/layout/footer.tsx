import Link from "next/link";
import { MapPin, Phone, Mail, Clock, Flower2, Heart } from "lucide-react";
import { SITE_NAME } from "@/config";
import { getNavItems } from "@/services/navigation";
import { socialLinks } from "./social-icons";
import { getSiteSettings } from "@/services/settings";

export default async function Footer() {
  const [navItems, contact] = await Promise.all([getNavItems(), getSiteSettings()]);

  return (
    <footer className="bg-stone-950 text-stone-300">
      <div className="container mx-auto px-4 pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 mb-12">
          {/* Brand col */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2 mb-5">
              <Flower2 className="w-6 h-6 text-primary" />
              <span className="text-xl font-heading font-bold text-white">
                {SITE_NAME}
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-stone-400 mb-6 max-w-sm">
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
                className="w-9 h-9 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400 hover:text-white hover:border-primary/40 hover:bg-stone-800 transition-all"
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
                    className="text-sm text-stone-400 hover:text-white transition-colors"
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
                { label: "Về Vườn Hoa Tươi", href: "/gioi-thieu" },
                { label: "Chính sách bảo mật", href: "/chinh-sach-bao-mat" },
                { label: "Chính sách giao hàng", href: "/chinh-sach-giao-hang" },
                { label: "Chính sách đổi trả", href: "/chinh-sach-doi-tra" },
                { label: "Liên hệ", href: "/lien-he" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-stone-400 hover:text-white transition-colors">
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
                <li key={i} className="flex gap-2.5 text-sm text-stone-400">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                  <span>{addr}</span>
                </li>
              ))}
              <li>
                <a
                  href={`tel:${contact.phone}`}
                  className="flex gap-2.5 text-sm text-stone-400 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 shrink-0 text-primary" />
                  {contact.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="flex gap-2.5 text-sm text-stone-400 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4 shrink-0 text-primary" />
                  {contact.email}
                </a>
              </li>
              <li className="flex gap-2.5 text-sm text-stone-400">
                <Clock className="w-4 h-4 shrink-0 text-primary" />
                <span>{contact.openingHours}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-stone-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} {SITE_NAME}. MST: 031541764</p>
          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3 text-primary" />
            <span>Công ty TNHH Thương Mại Dịch Vụ Vườn Hoa Tươi</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
