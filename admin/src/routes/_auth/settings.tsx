import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth";
import { useState } from "react";
import { Check } from "lucide-react";
import { useSettings, useUpdateSetting } from "@/features/settings/api";

export const Route = createFileRoute("/_auth/settings")({
  beforeLoad: () => {
    if (useAuthStore.getState().role !== "owner") throw redirect({ to: "/" });
  },
  component: SettingsPage,
});

const SETTING_LABELS: Record<string, string> = {
  phone: "Số điện thoại",
  hotline_display: "Hotline hiển thị",
  zalo: "Link Zalo",
  email: "Email",
  address_1: "Địa chỉ 1",
  address_2: "Địa chỉ 2",
  opening_hours: "Giờ mở cửa",
  free_shipping_note: "Ghi chú giao hàng",
};

function SettingsPage() {
  const { data: settings = [], isLoading } = useSettings();
  const updateSetting = useUpdateSetting();
  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<string | null>(null);

  // Sync PB data into local values on first load
  const merged: Record<string, string> = {};
  settings.forEach((s) => { merged[s.id] = values[s.id] ?? s.value; });

  function handleSave(id: string) {
    updateSetting.mutate(
      { id, value: merged[id] },
      {
        onSuccess: () => {
          setSaved(id);
          setTimeout(() => setSaved(null), 2000);
        },
      }
    );
  }

  return (
    <div className="space-y-5 max-w-xl">
      <div>
        <h1 className="text-xl font-bold text-white">Cài đặt</h1>
        <p className="text-stone-400 text-sm">Thông tin cửa hàng</p>
      </div>

      <div className="bg-stone-900 border border-stone-800 rounded-xl divide-y divide-stone-800">
        {isLoading ? (
          <div className="px-5 py-8 text-center text-stone-500 text-sm">Đang tải...</div>
        ) : (
          settings.map((s) => (
            <div key={s.id} className="px-5 py-4">
              <label className="block text-xs font-medium text-stone-400 mb-2">
                {SETTING_LABELS[s.key] ?? s.key}
              </label>
              <div className="flex gap-2">
                <input
                  value={merged[s.id] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [s.id]: e.target.value }))}
                  className="flex-1 px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-sm text-white focus:outline-none focus:border-stone-500"
                />
                <button
                  onClick={() => handleSave(s.id)}
                  disabled={updateSetting.isPending && updateSetting.variables?.id === s.id}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    saved === s.id
                      ? "bg-green-600 text-white"
                      : "bg-stone-700 hover:bg-stone-600 text-stone-300 disabled:opacity-60"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  {saved === s.id ? "Đã lưu" : updateSetting.isPending && updateSetting.variables?.id === s.id ? "..." : "Lưu"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
