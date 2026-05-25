import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, QrCode, CheckCircle2, Clock, Eye, X, Download } from "lucide-react";
import pb from "@/lib/pb";
import { PHOTO_BASE } from "@/lib/config";
import { useAuthStore } from "@/stores/auth";
import type { CheckinVoucher } from "@/schema/pocketbase";

export const Route = createFileRoute("/_auth/checkin-vouchers")({
  component: CheckinVouchersPage,
});

type StatusFilter = "all" | "pending" | "redeemed";

function useVouchers(status: StatusFilter, search: string) {
  return useQuery({
    queryKey: ["checkin-vouchers", status, search],
    queryFn: () => {
      const filters: string[] = [];
      if (status !== "all") filters.push(`status='${status}'`);
      if (search.trim()) {
        const s = search.trim().replace(/'/g, "\\'");
        filters.push(`(user_name~'${s}' || user_phone~'${s}')`);
      }
      const filterStr = filters.join(" && ");
      return pb
        .collection("checkin_vouchers")
        .getList<CheckinVoucher>(1, 50, {
          ...(filterStr ? { filter: filterStr } : {}),
          sort: "-id",
        });
    },
    staleTime: 15_000,
  });
}

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

function fmtDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso.replace(" ", "T"));
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function screenshotUrl(v: CheckinVoucher) {
  if (!v.screenshot) return null;
  return `${PHOTO_BASE}/${v.collectionId}/${v.id}/${v.screenshot}`;
}

// ── Detail dialog ────────────────────────────────────────────────────────────

function VoucherDialog({
  voucher,
  onClose,
  onRedeem,
  redeeming,
}: {
  voucher: CheckinVoucher;
  onClose: () => void;
  onRedeem: () => void;
  redeeming: boolean;
}) {
  const imgUrl = screenshotUrl(voucher);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden max-w-sm mx-auto max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800">
          <p className="text-sm font-semibold text-white">Chi tiết Voucher</p>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-stone-800 flex items-center justify-center text-stone-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {imgUrl && (
          <div className="relative">
            <img src={imgUrl} alt="screenshot" className="w-full object-cover max-h-56" />
            <a
              href={imgUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-2 right-2 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-sm hover:bg-black/70"
            >
              <Download className="w-3 h-3" /> Tải về
            </a>
          </div>
        )}

        <div className="p-5 space-y-3">
          <Row label="Tên khách" value={voucher.user_name} />
          <Row label="SĐT" value={voucher.user_phone || "—"} />
          <Row label="Ngày tạo" value={fmtDate(voucher.created)} />
          <Row
            label="Trạng thái"
            value={
              voucher.status === "redeemed" ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Đã dùng
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Chưa dùng
                </span>
              )
            }
          />
          {voucher.status === "redeemed" && (
            <>
              <Row label="Dùng lúc" value={fmtDate(voucher.redeemed_at ?? "")} />
              <Row label="Bởi" value={voucher.redeemed_by || "—"} />
            </>
          )}
          <Row label="QR Token" value={<span className="font-mono text-xs text-stone-400 break-all">{voucher.qr_token}</span>} />
        </div>

        {voucher.status === "pending" && (
          <div className="px-5 pb-5">
            <button
              onClick={onRedeem}
              disabled={redeeming}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              {redeeming ? "Đang xác nhận..." : "✅ Xác nhận đã dùng"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-stone-500 shrink-0">{label}</span>
      <span className="text-stone-200 text-right">{value}</span>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

function CheckinVouchersPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CheckinVoucher | null>(null);

  const { data, isLoading, error } = useVouchers(statusFilter, search);
  const redeem = useRedeemVoucher();

  const vouchers = data?.items ?? [];
  const total = data?.totalItems ?? 0;

  function handleRedeem() {
    if (!selected) return;
    redeem.mutate(selected.id, {
      onSuccess: (updated) => setSelected(updated),
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <QrCode className="w-5 h-5 text-rose-400" /> Voucher Check-in
        </h1>
        <p className="text-stone-500 text-sm mt-0.5">{total} voucher</p>
      </div>

      {/* Filters */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tên, SĐT..."
            className="w-full pl-9 pr-3 py-2.5 bg-stone-800 border border-stone-700 rounded-lg text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-stone-600"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "pending", "redeemed"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                statusFilter === s
                  ? "bg-rose-600 border-rose-600 text-white"
                  : "bg-stone-800 border-stone-700 text-stone-400 hover:text-white"
              }`}
            >
              {s === "all" ? "Tất cả" : s === "pending" ? "Chưa dùng" : "Đã dùng"}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
          Lỗi tải dữ liệu: {error instanceof Error ? error.message : String(error)}
        </div>
      )}

      {/* Desktop table */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-stone-900 border border-stone-800 rounded-xl p-4 animate-pulse h-16" />
          ))}
        </div>
      ) : vouchers.length === 0 ? (
        <div className="py-20 text-center">
          <QrCode className="w-10 h-10 text-stone-700 mx-auto mb-3" />
          <p className="text-stone-400 font-medium">Không có voucher</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {vouchers.map((v) => (
              <div key={v.id} className="bg-stone-900 border border-stone-800 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{v.user_name}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{v.user_phone || "—"}</p>
                    <p className="text-xs text-stone-500 mt-1">{fmtDate(v.created)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {v.status === "redeemed" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Đã dùng
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Clock className="w-3 h-3" /> Chưa dùng
                      </span>
                    )}
                    <button
                      onClick={() => setSelected(v)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-stone-800 border border-stone-700 text-stone-400 hover:text-white transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" /> Xem →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-800 text-stone-500 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Tên KH</th>
                  <th className="px-4 py-3 text-left">SĐT</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-left">Ngày tạo</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {vouchers.map((v, i) => (
                  <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-stone-500">{i + 1}</td>
                    <td className="px-4 py-3 text-white font-medium">{v.user_name}</td>
                    <td className="px-4 py-3 text-stone-400">{v.user_phone || "—"}</td>
                    <td className="px-4 py-3">
                      {v.status === "redeemed" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Đã dùng
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Clock className="w-3 h-3" /> Chưa dùng
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-stone-400 text-xs">{fmtDate(v.created)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelected(v)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-stone-800 border border-stone-700 text-stone-400 hover:text-white transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> Xem
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {selected && (
        <VoucherDialog
          voucher={selected}
          onClose={() => setSelected(null)}
          onRedeem={handleRedeem}
          redeeming={redeem.isPending}
        />
      )}
    </div>
  );
}
