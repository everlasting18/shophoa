"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, ImageDown } from "lucide-react";

interface Props {
  orderCode: string;
  qrToken: string;
}

export default function OrderQRCode({ orderCode, qrToken }: Props) {
  const [dataUrl, setDataUrl] = useState<string>("");
  const [sharing, setSharing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    QRCode.toDataURL(qrToken, {
      width: 280,
      margin: 2,
      color: { dark: "#1c1917", light: "#ffffff" },
      errorCorrectionLevel: "M",
    }).then(setDataUrl);
  }, [qrToken]);

  async function handleSave() {
    if (!dataUrl) return;
    setSharing(true);
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `don-hang-${orderCode}.png`, { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Đơn hàng ${orderCode} – Tiệm Hoa Nhà Tình`,
        });
        return;
      }

      // Desktop fallback
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `don-hang-${orderCode}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      // User cancelled share — ignore
    } finally {
      setSharing(false);
    }
  }

  if (!dataUrl) return null;

  return (
    <div className="bg-white rounded-2xl border border-border/60 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-5 py-3 border-b border-border/40 flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
          Mã QR đơn hàng
        </span>
        <span className="text-xs font-mono font-bold text-primary">{orderCode}</span>
      </div>

      {/* QR */}
      <div className="flex flex-col items-center px-5 pt-5 pb-4 gap-4">
        <div className="rounded-xl overflow-hidden border border-border/30 shadow-sm p-2 bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={dataUrl}
            alt={`QR mã đơn ${orderCode}`}
            width={160}
            height={160}
            className="block"
          />
        </div>

        {/* Save prompt */}
        <div className="w-full rounded-xl bg-rose-50 border border-rose-100 px-4 py-3 flex items-start gap-2.5">
          <ImageDown className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-700 leading-relaxed">
            <span className="font-semibold">Chụp màn hình lưu giữ mã QR này.</span>{" "}
            Khi cần tra cứu hoặc xác nhận đơn hàng, bạn xuất trình mã QR để shop kiểm tra nhanh nhất.
          </p>
        </div>

        {/* Download button */}
        <button
          onClick={handleSave}
          disabled={sharing}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.97] transition-all disabled:opacity-60"
        >
          <Download className="w-4 h-4" />
          {sharing ? "Đang lưu…" : "Lưu mã QR về máy"}
        </button>
      </div>
    </div>
  );
}
