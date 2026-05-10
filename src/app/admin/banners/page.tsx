"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import pb from "@/services/pocketbase";
import { Plus, Trash2, ToggleLeft, ToggleRight, Upload } from "lucide-react";
import type { Banner } from "@/schema";
import { getImageUrl } from "@/lib/media";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: "", link: "", position: "hero" as "hero" | "promo" | "category", sort_order: 0 });
  const [file, setFile] = useState<File | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    pb.collection("banners").getFullList<Banner>({ sort: "sort_order" }).then(setBanners);
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    try {
      const created = await pb.collection("banners").create<Banner>({
        title: form.title || "Banner",
        link: form.link || undefined,
        position: form.position,
        sort_order: form.sort_order,
        is_active: true,
        image: file,
      });
      setBanners((prev) => [...(prev ?? []), created]);
      setShowForm(false);
      setFile(null);
      setForm({ title: "", link: "", position: "hero", sort_order: 0 });
    } finally {
      setUploading(false);
    }
  }

  async function toggleActive(banner: Banner) {
    const updated = await pb.collection("banners").update<Banner>(banner.id, { is_active: !banner.is_active });
    setBanners((prev) => prev?.map((b) => b.id === banner.id ? updated : b) ?? prev);
  }

  async function deleteBanner(id: string) {
    if (!confirm("Xoá banner này?")) return;
    await pb.collection("banners").delete(id);
    setBanners((prev) => prev?.filter((b) => b.id !== id) ?? prev);
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Banners</h1>
          <p className="text-zinc-400 text-sm">Quản lý ảnh banner</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Upload banner
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-zinc-900 border border-rose-500/30 rounded-xl p-4 space-y-3">
          <p className="text-xs font-medium text-rose-400 uppercase tracking-wide">Upload banner mới</p>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-zinc-400 mb-1 block">Tiêu đề</label>
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={iCls} /></div>
            <div><label className="text-xs text-zinc-400 mb-1 block">Link (tuỳ chọn)</label>
              <input value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} className={iCls} placeholder="/hoa-sinh-nhat" /></div>
            <div><label className="text-xs text-zinc-400 mb-1 block">Vị trí</label>
              <select value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: e.target.value as "hero" | "promo" | "category" }))} className={iCls}>
                <option value="hero">Hero (trang chủ)</option>
                <option value="promo">Promo banner</option>
                <option value="category">Danh mục</option>
              </select></div>
            <div><label className="text-xs text-zinc-400 mb-1 block">Thứ tự</label>
              <input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))} className={iCls} /></div>
          </div>
          <div>
            <label className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm text-zinc-300 cursor-pointer w-fit">
              <Upload className="w-4 h-4" />{file ? file.name : "Chọn ảnh *"}
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="hidden" required />
            </label>
          </div>
          <button type="submit" disabled={uploading || !file}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm rounded-lg transition-colors disabled:opacity-60">
            {uploading ? "Đang upload..." : "Tạo banner"}
          </button>
        </form>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {banners === null ? (
          <div className="py-10 text-center text-zinc-500 text-sm">Đang tải...</div>
        ) : banners.length === 0 ? (
          <div className="py-10 text-center text-zinc-500 text-sm">Chưa có banner nào. Upload ảnh đầu tiên!</div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {banners.map((banner) => {
              const imgUrl = getImageUrl(banner.collectionId, banner.id, banner.image, 300);
              return (
                <div key={banner.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="relative w-24 h-12 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                    <Image src={imgUrl} alt={banner.title} fill sizes="96px" className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">{banner.title || "Không có tiêu đề"}</p>
                    <p className="text-xs text-zinc-500">{banner.position} · #{banner.sort_order}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => toggleActive(banner)}
                      className={`p-1.5 rounded-lg transition-colors ${banner.is_active ? "text-green-400 hover:bg-green-400/10" : "text-zinc-500 hover:bg-zinc-700"}`}>
                      {banner.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <button onClick={() => deleteBanner(banner.id)} className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const iCls = "w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600";
