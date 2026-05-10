"use client";

import { useState, useEffect } from "react";
import pb from "@/services/pocketbase";
import { Check } from "lucide-react";
import type { Settings } from "@/schema";

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

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    pb.collection("settings").getFullList<Settings>().then((list) => {
      setSettings(list);
      const vals: Record<string, string> = {};
      list.forEach((s) => { vals[s.id] = s.value; });
      setValues(vals);
    });
  }, []);

  async function saveSetting(setting: Settings) {
    setSaving(setting.id);
    await pb.collection("settings").update(setting.id, { value: values[setting.id] });
    setSaving(null);
    setSaved(setting.id);
    setTimeout(() => setSaved(null), 2000);
  }

  return (
    <div className="space-y-5 max-w-xl">
      <div>
        <h1 className="text-xl font-bold text-white">Cài đặt</h1>
        <p className="text-zinc-400 text-sm">Thông tin cửa hàng</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
        {settings.map((s) => (
          <div key={s.id} className="px-5 py-4">
            <label className="block text-xs font-medium text-zinc-400 mb-2">
              {SETTING_LABELS[s.key] ?? s.key}
            </label>
            <div className="flex gap-2">
              <input value={values[s.id] ?? ""} onChange={(e) => setValues((v) => ({ ...v, [s.id]: e.target.value }))}
                className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-zinc-500" />
              <button onClick={() => saveSetting(s)} disabled={saving === s.id}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  saved === s.id
                    ? "bg-green-600 text-white"
                    : "bg-zinc-700 hover:bg-zinc-600 text-zinc-300 disabled:opacity-60"
                }`}>
                <Check className="w-3.5 h-3.5" />
                {saved === s.id ? "Đã lưu" : saving === s.id ? "..." : "Lưu"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
