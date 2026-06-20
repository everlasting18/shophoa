import type { Metadata } from "next";
import "./globals.css";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/config";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ZaloFloat from "@/components/layout/zalo-float";
import { ToastProvider } from "@/components/ui/toast";

import { Merriweather } from "next/font/google";

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "700", "900"],
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} – Shop Hoa Tươi TPHCM 24/24`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  keywords: [
    "tiệm hoa nhà tình", "shop hoa tươi TPHCM", "đặt hoa online TPHCM",
    "hoa sinh nhật TPHCM", "hoa khai trương", "hoa tốt nghiệp",
    "điện hoa hỏa tốc", "giao hoa tận nơi TPHCM", "tiemhoanhatinh.com",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} – Shop Hoa Tươi TPHCM`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/images/banner1.jpg",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} – Shop Hoa Tươi TPHCM`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} – Shop Hoa Tươi TPHCM`,
    description: SITE_DESCRIPTION,
    images: ["/images/banner1.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${merriweather.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <head>
        <script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "c9a662408b17445bbafb65e8f20ba153"}'
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ToastProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <ZaloFloat />
        </ToastProvider>
      </body>
    </html>
  );
}
