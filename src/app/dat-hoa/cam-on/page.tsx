"use client";

import Link from "next/link";
import { CheckCircle2, MessageCircle, Home, Package, Clock, Phone } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useSettings } from "@/hooks/use-settings";

function ThanksContent() {
  const contact = useSettings();
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const orderCode = id ? `VHT${id.slice(-6).toUpperCase()}` : "";

  return (
    <div className="container mx-auto px-4 py-16 max-w-lg">
      {/* Success card */}
      <div className="bg-white rounded-3xl border border-border/60 p-8 sm:p-10 shadow-xl shadow-primary/5 text-center mb-6">
        <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>

        <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-3">
          Đặt hoa thành công!
        </h1>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          Cảm ơn bạn đã tin tưởng Vườn Hoa Tươi! Chúng mình sẽ liên hệ xác nhận đơn hàng sớm nhất.
        </p>

        {orderCode && (
          <div className="bg-muted/40 rounded-2xl p-5 mb-6 border border-border/40">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Mã đơn hàng</p>
            <p className="text-2xl font-bold text-primary font-mono tracking-wider">{orderCode}</p>
          </div>
        )}

        {/* Next steps */}
        <div className="space-y-3 text-left mb-6">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
            <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">Xác nhận đơn hàng</p>
              <p className="text-xs text-emerald-700/80">Chúng mình sẽ gọi điện hoặc nhắn Zalo trong 15 phút.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100">
            <MessageCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-800">Gửi hình thành phẩm</p>
              <p className="text-xs text-blue-700/80">Trước khi giao, bạn sẽ nhận được hình ảnh hoa thực tế.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/50 border border-amber-100">
            <Package className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Giao hoa tận nơi</p>
              <p className="text-xs text-amber-700/80">Hoa được giao đúng khung giờ đã chọn. Miễn phí nội thành.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={contact.zalo}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#0068FF] text-white font-semibold hover:bg-[#0068FF]/90 transition-colors shadow-lg shadow-blue-500/15"
          >
            <MessageCircle className="w-4 h-4" />
            Theo dõi qua Zalo
          </a>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-border font-semibold hover:bg-muted transition-colors"
          >
            <Home className="w-4 h-4" />
            Về trang chủ
          </Link>
        </div>
      </div>

      {/* Help */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground mb-2">Cần hỗ trợ ngay?</p>
        <a
          href={`tel:${contact.phone}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          <Phone className="w-3.5 h-3.5" />
          {contact.phoneDisplay}
        </a>
      </div>
    </div>
  );
}

export default function ThanksPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Đang xử lý...</p>
        </div>
      }
    >
      <ThanksContent />
    </Suspense>
  );
}
