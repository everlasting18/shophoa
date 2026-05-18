import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth";
import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { useShippingZones, useCreateZone, useUpdateZone, useDeleteZone } from "@/features/shipping/api";
import { formatPrice } from "@/lib/utils";
import type { ShippingZone } from "@/schema/pocketbase";

export const Route = createFileRoute("/_auth/shipping")({
  beforeLoad: () => {
    if (useAuthStore.getState().role !== "owner") throw redirect({ to: "/" });
  },
  component: ShippingPage,
});

const EMPTY: Omit<ShippingZone, "id"> = {
  label: "",
  fee: 0,
  districts: [],
  sort_order: 0,
};

const HCMC_DISTRICTS = [
  "Quận 1", "Quận 3", "Quận 4", "Quận 5", "Quận 6",
  "Quận 7", "Quận 8", "Quận 10", "Quận 11", "Quận 12",
  "Quận Bình Tân", "Quận Bình Thạnh", "Quận Gò Vấp",
  "Quận Phú Nhuận", "Quận Tân Bình", "Quận Tân Phú",
  "Thành phố Thủ Đức",
  "Huyện Bình Chánh", "Huyện Cần Giờ", "Huyện Củ Chi",
  "Huyện Hóc Môn", "Huyện Nhà Bè",
];

function ZoneForm({
  initial,
  onSave,
  onCancel,
  isPending,
  usedDistricts,
}: {
  initial: Omit<ShippingZone, "id">;
  onSave: (data: Omit<ShippingZone, "id">) => void;
  onCancel: () => void;
  isPending: boolean;
  usedDistricts: Set<string>;
}) {
  const [label, setLabel] = useState(initial.label);
  const [fee, setFee] = useState(String(initial.fee));
  const [selected, setSelected] = useState<Set<string>>(new Set(initial.districts ?? []));
  function toggle(district: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(district) ? next.delete(district) : next.add(district);
      return next;
    });
  }

  function handleSave() {
    onSave({
      label: label.trim(),
      fee: Number(fee) || 0,
      districts: Array.from(selected),
      sort_order: initial.sort_order,
    });
  }

  return (
    <div className="bg-stone-800/60 border border-stone-700 rounded-xl p-4 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-stone-400 mb-1">Tên zone</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="vd: Nội thành trung tâm"
            className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-sm text-white focus:outline-none focus:border-stone-500 placeholder:text-stone-600"
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-stone-400 mb-1">Phí ship (VND)</label>
            <input
              type="number"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              placeholder="30000"
              className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-sm text-white focus:outline-none focus:border-stone-500 placeholder:text-stone-600"
            />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-stone-400">
            Quận/Huyện áp dụng
            {selected.size > 0 && (
              <span className="ml-2 text-rose-400">({selected.size} đã chọn)</span>
            )}
          </label>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="text-xs text-stone-600 hover:text-stone-400 transition-colors"
          >
            Bỏ chọn tất cả
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {HCMC_DISTRICTS.map((d) => {
            const isSelected = selected.has(d);
            const isUsed = usedDistricts.has(d) && !isSelected;
            return (
              <label
                key={d}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors select-none text-xs ${
                  isSelected
                    ? "bg-rose-500/20 border border-rose-500/40 text-rose-300"
                    : isUsed
                    ? "bg-stone-900/40 border border-stone-800 text-stone-600 cursor-not-allowed"
                    : "bg-stone-900 border border-stone-800 text-stone-300 hover:border-stone-600 hover:text-white"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={isUsed}
                  onChange={() => !isUsed && toggle(d)}
                  className="w-3.5 h-3.5 accent-rose-500 shrink-0"
                />
                <span className="truncate">{d}</span>
              </label>
            );
          })}
        </div>
        <p className="text-[11px] text-stone-600 mt-1.5">Quận đã dùng trong zone khác sẽ bị mờ</p>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          onClick={onCancel}
          className="px-3 py-2 rounded-lg text-sm text-stone-400 hover:text-white hover:bg-stone-700 transition-colors flex items-center gap-1.5"
        >
          <X className="w-3.5 h-3.5" /> Hủy
        </button>
        <button
          onClick={handleSave}
          disabled={isPending || !label.trim()}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-rose-600 hover:bg-rose-500 text-white transition-colors flex items-center gap-1.5 disabled:opacity-60"
        >
          <Check className="w-3.5 h-3.5" /> {isPending ? "Đang lưu..." : "Lưu"}
        </button>
      </div>
    </div>
  );
}

function ShippingPage() {
  const { data: zones = [], isLoading } = useShippingZones();
  const createZone = useCreateZone();
  const updateZone = useUpdateZone();
  const deleteZone = useDeleteZone();

  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Districts already assigned to other zones (to prevent duplicates)
  function getUsedDistricts(excludeId?: string): Set<string> {
    const used = new Set<string>();
    zones.forEach((z) => {
      if (z.id === excludeId) return;
      (z.districts ?? []).forEach((d) => used.add(d));
    });
    return used;
  }

  function handleCreate(data: Omit<ShippingZone, "id">) {
    createZone.mutate(data, { onSuccess: () => setAdding(false) });
  }

  function handleUpdate(id: string, data: Omit<ShippingZone, "id">) {
    updateZone.mutate({ id, ...data }, { onSuccess: () => setEditingId(null) });
  }

  function handleDelete(id: string, label: string) {
    if (!confirm(`Xóa zone "${label}"?`)) return;
    deleteZone.mutate(id);
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Phí giao hàng</h1>
          <p className="text-stone-400 text-sm">Quản lý zone và phí ship theo khu vực</p>
        </div>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium rounded-xl transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" /> Thêm zone
          </button>
        )}
      </div>

      {adding && (
        <ZoneForm
          initial={{ ...EMPTY, sort_order: zones.length }}
          onSave={handleCreate}
          onCancel={() => setAdding(false)}
          isPending={createZone.isPending}
          usedDistricts={getUsedDistricts()}
        />
      )}

      <div className="bg-stone-900 border border-stone-800 rounded-xl divide-y divide-stone-800">
        {isLoading ? (
          <div className="px-5 py-8 text-center text-stone-500 text-sm">Đang tải...</div>
        ) : zones.length === 0 ? (
          <div className="px-5 py-8 text-center text-stone-500 text-sm">
            Chưa có zone nào. Thêm zone đầu tiên.
          </div>
        ) : (
          zones.map((zone) =>
            editingId === zone.id ? (
              <div key={zone.id} className="p-4">
                <ZoneForm
                  initial={zone}
                  onSave={(data) => handleUpdate(zone.id, data)}
                  onCancel={() => setEditingId(null)}
                  isPending={updateZone.isPending}
                  usedDistricts={getUsedDistricts(zone.id)}
                />
              </div>
            ) : (
              <div key={zone.id} className="px-5 py-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-white truncate">{zone.label}</p>
                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full shrink-0">
                      {zone.fee === 0 ? "Miễn phí" : formatPrice(zone.fee)}
                    </span>
                  </div>
                  {zone.districts?.length > 0 && (
                    <p className="text-xs text-stone-500 truncate">
                      {zone.districts.join(" · ")}
                    </p>
                  )}
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => setEditingId(zone.id)}
                    className="p-2 rounded-lg text-stone-500 hover:text-white hover:bg-stone-800 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(zone.id, zone.label)}
                    disabled={deleteZone.isPending}
                    className="p-2 rounded-lg text-stone-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}
