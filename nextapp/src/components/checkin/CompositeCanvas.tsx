"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import QRCode from "qrcode";

export interface CompositeCanvasRef {
  download: () => void;
}

interface Props {
  screenshot: File;
  qrToken: string;
  userName: string;
  userPhone: string;
}

const W = 800;
const H = 900;
const HALF = H / 2; // 450

const CompositeCanvas = forwardRef<CompositeCanvasRef, Props>(
  ({ screenshot, qrToken, userName, userPhone }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useImperativeHandle(ref, () => ({
      download() {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "voucher-hoaxinh.png";
          a.click();
          URL.revokeObjectURL(url);
        }, "image/png");
      },
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let cancelled = false;

      async function draw() {
        if (!ctx || !canvas) return;

        // ── Load screenshot ──
        const screenshotUrl = URL.createObjectURL(screenshot);
        const img = new Image();
        await new Promise<void>((res, rej) => {
          img.onload = () => res();
          img.onerror = rej;
          img.src = screenshotUrl;
        });
        URL.revokeObjectURL(screenshotUrl);
        if (cancelled) return;

        // ── Generate QR ──
        const qrDataUrl = await QRCode.toDataURL(qrToken, {
          width: 350,
          margin: 1,
          color: { dark: "#1c1917", light: "#ffffff" },
        });
        const qrImg = new Image();
        await new Promise<void>((res, rej) => {
          qrImg.onload = () => res();
          qrImg.onerror = rej;
          qrImg.src = qrDataUrl;
        });
        if (cancelled) return;

        // ── Draw screenshot (top 50%) ──
        // Crop center-fit into 800×450
        const srcRatio = img.width / img.height;
        const dstRatio = W / HALF;
        let sx = 0, sy = 0, sw = img.width, sh = img.height;
        if (srcRatio > dstRatio) {
          sw = img.height * dstRatio;
          sx = (img.width - sw) / 2;
        } else {
          sh = img.width / dstRatio;
          sy = (img.height - sh) / 2;
        }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, HALF);

        // ── Bottom half background (white) ──
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, HALF, W, HALF);

        // ── Left panel: QR code (400×450), center QR 350×350 ──
        const qrX = (400 - 350) / 2; // 25
        const qrY = HALF + (HALF - 350) / 2; // HALF + 50
        ctx.drawImage(qrImg, qrX, qrY, 350, 350);

        // ── Divider line ──
        ctx.strokeStyle = "#e7e5e4";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(400, HALF + 20);
        ctx.lineTo(400, H - 20);
        ctx.stroke();

        // ── Right panel: shop info ──
        const rx = 420;

        // Pink accent bar
        ctx.fillStyle = "#ffe4e6";
        ctx.fillRect(400, HALF, W - 400, 6);

        // Flower emoji + shop name
        ctx.font = "bold 22px system-ui, sans-serif";
        ctx.fillStyle = "#be123c";
        ctx.fillText("🌸 Tiệm Hoa Nhà Tình", rx, HALF + 55);

        // Voucher headline
        ctx.font = "bold 18px system-ui, sans-serif";
        ctx.fillStyle = "#1c1917";
        ctx.fillText("Voucher Ưu Đãi", rx, HALF + 95);

        // Voucher detail
        ctx.font = "15px system-ui, sans-serif";
        ctx.fillStyle = "#44403c";
        ctx.fillText("Mua 1 Tặng 1", rx, HALF + 125);
        ctx.fillText("Bó hoa 69k", rx, HALF + 148);

        // Divider
        ctx.strokeStyle = "#e7e5e4";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(rx, HALF + 168);
        ctx.lineTo(W - 20, HALF + 168);
        ctx.stroke();

        // User info
        ctx.font = "13px system-ui, sans-serif";
        ctx.fillStyle = "#78716c";
        ctx.fillText("Tên:", rx, HALF + 195);
        ctx.font = "bold 14px system-ui, sans-serif";
        ctx.fillStyle = "#1c1917";
        const nameText = userName.length > 22 ? userName.slice(0, 22) + "…" : userName;
        ctx.fillText(nameText, rx + 40, HALF + 195);

        if (userPhone) {
          ctx.font = "13px system-ui, sans-serif";
          ctx.fillStyle = "#78716c";
          ctx.fillText("SĐT:", rx, HALF + 220);
          ctx.font = "bold 14px system-ui, sans-serif";
          ctx.fillStyle = "#1c1917";
          ctx.fillText(userPhone, rx + 40, HALF + 220);
        }

        // ── Footer strip ──
        ctx.fillStyle = "#fff1f2";
        ctx.fillRect(0, H - 50, W, 50);
        ctx.font = "13px system-ui, sans-serif";
        ctx.fillStyle = "#be123c";
        ctx.textAlign = "center";
        ctx.fillText("Tiệm Hoa Nhà Tình – Voucher ưu đãi · Xuất trình khi đến shop", W / 2, H - 20);
        ctx.textAlign = "left";
      }

      draw().catch(console.error);
      return () => { cancelled = true; };
    }, [screenshot, qrToken, userName, userPhone]);

    return (
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="w-full max-w-xs mx-auto rounded-2xl shadow-lg"
        style={{ height: "auto" }}
      />
    );
  }
);

CompositeCanvas.displayName = "CompositeCanvas";
export default CompositeCanvas;
