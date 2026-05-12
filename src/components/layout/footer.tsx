import Link from "next/link";
import { SITE_NAME } from "@/config";
import { getSiteSettings } from "@/services/settings";

const LINKS = [
  { label: "ABOUT", href: "/gioi-thieu" },
  { label: "CONTACT", href: "/lien-he" },
  { label: "PRIVACY", href: "/chinh-sach-bao-mat" },
];

export default async function Footer() {
  const contact = await getSiteSettings();

  return (
    <footer className="bg-accent/30 border-t border-border/40">
      <div className="container mx-auto px-6 max-w-4xl py-12">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="font-heading text-xl tracking-[0.25em] font-medium text-foreground">
              {SITE_NAME}
            </span>
          </Link>
        </div>

        <nav className="flex justify-center gap-8 mb-8 flex-wrap">
          {LINKS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-[11px] tracking-[0.15em] text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="text-center space-y-1">
          <p className="text-[11px] tracking-[0.15em] text-muted-foreground">
            <a href={`tel:${contact.phone}`} className="hover:text-foreground transition-colors">{contact.phoneDisplay}</a>
            <span className="mx-2 opacity-30">|</span>
            <a href={`mailto:${contact.email}`} className="hover:text-foreground transition-colors">{contact.email}</a>
          </p>
          <p className="text-[10px] text-muted-foreground/50">
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
