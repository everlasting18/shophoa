import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { SITE_NAME, CONTACT, NAV_ITEMS } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand col */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="text-xl font-heading font-bold text-white">
                🌸 {SITE_NAME}
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-stone-400 mb-4">
              Shop hoa tươi TPHCM phong cách hiện đại. Mỗi cành hoa trao đi là
              một tấm lòng chân thành gửi gắm.
            </p>
            <div className="flex gap-3">
              <a
                href={CONTACT.zalo}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full bg-[#0068FF] text-white text-xs font-semibold hover:bg-[#0068FF]/90 transition-colors"
              >
                Zalo
              </a>
              <a
                href={`tel:${CONTACT.phone}`}
                className="px-4 py-2 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
              >
                Gọi ngay
              </a>
            </div>
          </div>

          {/* Danh mục */}
          <div>
            <h3 className="font-heading font-semibold text-white mb-4 text-sm uppercase tracking-wide">
              Danh Mục
            </h3>
            <ul className="space-y-2">
              {NAV_ITEMS.slice(0, 6).map((item) => (
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
          <div>
            <h3 className="font-heading font-semibold text-white mb-4 text-sm uppercase tracking-wide">
              Hỗ Trợ
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/gioi-thieu" className="text-sm text-stone-400 hover:text-white transition-colors">
                  Về Vườn Hoa Tươi
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach-bao-mat" className="text-sm text-stone-400 hover:text-white transition-colors">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach-giao-hang" className="text-sm text-stone-400 hover:text-white transition-colors">
                  Chính sách giao hàng
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach-doi-tra" className="text-sm text-stone-400 hover:text-white transition-colors">
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link href="/lien-he" className="text-sm text-stone-400 hover:text-white transition-colors">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Liên hệ */}
          <div>
            <h3 className="font-heading font-semibold text-white mb-4 text-sm uppercase tracking-wide">
              Liên Hệ
            </h3>
            <ul className="space-y-3">
              {CONTACT.addresses.map((addr, i) => (
                <li key={i} className="flex gap-2 text-sm text-stone-400">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                  <span>{addr}</span>
                </li>
              ))}
              <li>
                <a
                  href={`tel:${CONTACT.phone}`}
                  className="flex gap-2 text-sm text-stone-400 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 shrink-0 text-primary" />
                  {CONTACT.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="flex gap-2 text-sm text-stone-400 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4 shrink-0 text-primary" />
                  {CONTACT.email}
                </a>
              </li>
              <li className="flex gap-2 text-sm text-stone-400">
                <Clock className="w-4 h-4 shrink-0 text-primary" />
                <span>Mở cửa 08:00 – 21:00 mỗi ngày</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} {SITE_NAME}. MST: 031541764</p>
          <p>Công ty TNHH Thương Mại Dịch Vụ Vườn Hoa Tươi</p>
        </div>
      </div>
    </footer>
  );
}
