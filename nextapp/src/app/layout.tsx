import type { Metadata } from "next";
import "./globals.css";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/config";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ZaloFloat from "@/components/layout/zalo-float";
import { ToastProvider } from "@/components/ui/toast";

import { Baloo_2 } from "next/font/google";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} – Shop Hoa Tươi TPHCM & Đặt Hoa Online Uy Tín`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} – Shop Hoa Tươi TPHCM`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} – Shop Hoa Tươi TPHCM`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
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
      className={`${baloo.variable} h-full antialiased`}
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
