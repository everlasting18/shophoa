"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CONTACT } from "@/lib/constants";

function ThanksContent() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const orderCode = id ? `VHT${id.slice(-6).toUpperCase()}` : "";

  return (
    <div className="container mx-auto px-4 py-20 max-w-lg text-center">
      <CheckCircle className="w-16 h-16 text-primary mx-auto mb-5" />
      <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-3">
        Đặt hoa thành công! 🌸
      </h1>
      {orderCode && (
        <p className="text-muted-foreground mb-2">
          Mã đơn hàng: <span className="font-semibold text-foreground">{orderCode}</span>
        </p>
      )}
      <p className="text-muted-foreground mb-8 leading-relaxed">
        Cảm ơn bạn đã tin tưởng Vườn Hoa Tươi! Chúng mình sẽ liên hệ xác nhận đơn hàng sớm nhất.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href={CONTACT.zalo}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 rounded-full bg-[#0068FF] text-white font-semibold hover:bg-[#0068FF]/90 transition-colors"
        >
          Theo dõi qua Zalo
        </a>
        <Link
          href="/"
          className="px-6 py-3 rounded-full border border-border font-semibold hover:bg-muted transition-colors"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}

export default function ThanksPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center">Đang tải...</div>}>
      <ThanksContent />
    </Suspense>
  );
}
