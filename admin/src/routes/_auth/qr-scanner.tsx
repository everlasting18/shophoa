import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ScanLine, CheckCircle2, AlertTriangle, XCircle, RotateCcw } from "lucide-react";
import pb from "@/lib/pb";
import { useAuthStore } from "@/stores/auth";
import QRReader from "@/components/QRReader";
import type { CheckinVoucher } from "@/schema/pocketbase";

export const Route = createFileRoute("/_auth/qr-scanner")({
  component: QRScannerPage,
});

type ScanState =
  | { type: "idle" }
  | { type: "scanning" }
  | { type: "loading" }
  | { type: "found"; voucher: CheckinVoucher }
  | { type: "not_found" }
  | { type: "error"; message: string };

function useRedeemVoucher() {
  const qc = useQueryClient();
  const { adminEmail } = useAuthStore();
  return useMutation({
    mutationFn: (id: string) =>
      pb.collection("checkin_vouchers").update<CheckinVoucher>(id, {
        status: "redeemed",
        redeemed_at: new Date().toISOString(),
        redeemed_by: adminEmail ?? "unknown",
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["checkin-vouchers"] }),
  });
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso.replace(" ", "T"));
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("vi-VN", {
    hour: "2-digit", minute: "2-digit",
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

function QRScannerPage() {
  const [scanState, setScanState] = useState<ScanState>({ type: "idle" });
  const redeem = useRedeemVoucher();

  const cameraActive = scanState.type === "scanning";

  const handleDetected = useCallback(async (code: string) => {
    setScanState({ type: "loading" });
    try {
      const result = await pb
        .collection("checkin_vouchers")
        .getFirstListItem<CheckinVoucher>(`qr_token='${code}'`);
      setScanState({ type: "found", voucher: result });
    } catch {
      setScanState({ type: "not_found" });
    }
  }, []);

  function handleReset() {
    setScanState({ type: "idle" });
  }

  function handleConfirm() {
    if (scanState.type !== "found") return;
    redeem.mutate(scanState.voucher.id, {
      onSuccess: (updated) => setScanState({ type: "found", voucher: updated }),
      onError: (e) =>
        setScanState({ type: "error", message: e instanceof Error ? e.message : "Lỗi xác nhận" }),
    });
  }

  return (
    <div className="space-y-5 max-w-sm mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <ScanLine className="w-5 h-5 text-rose-400" /> Quét mã QR Voucher
        </h1>
        <p className="text-stone-500 text-sm mt-0.5">Xác nhận voucher check-in của khách</p>
      </div>

      {/* ── Idle: chưa mở camera ── */}
      {scanState.type === "idle" && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8 flex flex-col items-center text-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-stone-800 flex items-center justify-center">
            <ScanLine className="w-10 h-10 text-stone-400" />
          </div>
          <div>
            <p className="font-semibold text-white text-base">Quét mã QR voucher</p>
            <p className="text-stone-500 text-sm mt-1.5 leading-relaxed">
              Nhấn nút bên dưới để mở camera<br />và quét mã QR của khách
            </p>
          </div>
          <button
            onClick={() => setScanState({ type: "scanning" })}
            className="w-full h-12 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <ScanLine className="w-4 h-4" /> Mở camera quét mã
          </button>
        </div>
      )}

      {/* ── Camera đang quét ── */}
      {scanState.type === "scanning" && (
        <>
          <QRReader onDetected={handleDetected} active={cameraActive} />
          <p className="text-center text-sm text-stone-400">Hướng camera vào mã QR trên voucher...</p>
          <button
            onClick={handleReset}
            className="w-full h-10 flex items-center justify-center gap-2 text-sm text-stone-400 hover:text-white border border-stone-700 rounded-xl bg-stone-800 hover:bg-stone-700 transition-colors"
          >
            Huỷ
          </button>
        </>
      )}

      {/* ── Đang tra cứu ── */}
      {scanState.type === "loading" && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8 flex flex-col items-center gap-4">
          <span className="w-8 h-8 border-2 border-stone-600 border-t-rose-400 rounded-full animate-spin" />
          <p className="text-stone-400 text-sm">Đang tra cứu voucher...</p>
        </div>
      )}

      {/* ── Kết quả ── */}
      {(scanState.type === "found" || scanState.type === "not_found" || scanState.type === "error") && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
          {scanState.type === "not_found" && (
            <div className="p-6 text-center">
              <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="font-semibold text-white">Không tìm thấy voucher</p>
              <p className="text-stone-500 text-sm mt-1">Mã QR không hợp lệ hoặc không tồn tại</p>
            </div>
          )}

          {scanState.type === "error" && (
            <div className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <p className="font-semibold text-white">Lỗi xác nhận</p>
              <p className="text-stone-500 text-sm mt-1">{scanState.message}</p>
            </div>
          )}

          {scanState.type === "found" && (
            <div className="p-5 space-y-4">
              {scanState.voucher.status === "redeemed" ? (
                <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-300">Voucher đã được sử dụng</p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Dùng lúc {fmtDate(scanState.voucher.redeemed_at)} · Bởi {scanState.voucher.redeemed_by || "—"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <p className="text-sm font-semibold text-emerald-300">Voucher hợp lệ – Chưa dùng</p>
                </div>
              )}

              <div className="space-y-2 text-sm">
                <InfoRow label="Khách" value={scanState.voucher.user_name} />
                <InfoRow label="SĐT" value={scanState.voucher.user_phone || "—"} />
                <InfoRow label="Check-in lúc" value={fmtDate(scanState.voucher.created)} />
              </div>

              {scanState.voucher.status === "pending" && (
                <button
                  onClick={handleConfirm}
                  disabled={redeem.isPending}
                  className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 text-base"
                >
                  {redeem.isPending ? "Đang xác nhận..." : "✅ Xác nhận đã dùng"}
                </button>
              )}
            </div>
          )}

          <div className="px-5 pb-5">
            <button
              onClick={handleReset}
              className="w-full h-10 flex items-center justify-center gap-2 text-sm text-stone-400 hover:text-white border border-stone-700 rounded-xl bg-stone-800 hover:bg-stone-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Quét lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-stone-500">{label}</span>
      <span className="text-white font-medium text-right">{value}</span>
    </div>
  );
}
