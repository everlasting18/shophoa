"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import pb from "@/services/pocketbase";
import { Plus, Trash2, Upload, GripVertical, Check } from "lucide-react";
import type { Banner } from "@/schema";
import { getImageUrl } from "@/lib/media";
import { revalidatePage } from "@/lib/revalidate";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ link: "" });
  const [file, setFile] = useState<File | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const dragIdx = useRef<number | null>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  useEffect(() => {
    pb.collection("banners").getFullList<Banner>({ sort: "sort_order" }).then(setBanners);
  }, []);

  function handleDragStart(e: React.DragEvent<HTMLTableRowElement>, idx: number) {
    dragIdx.current = idx;
    setDraggingIdx(idx);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragEnd() {
    setDraggingIdx(null);
    setDragOverIdx(null);
    dragIdx.current = null;
  }

  function handleDragOver(e: React.DragEvent<HTMLTableRowElement>, idx: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragIdx.current !== idx) setDragOverIdx(idx);
  }

  function handleDragLeave() {
    setDragOverIdx(null);
  }

  async function handleDrop(e: React.DragEvent<HTMLTableRowElement>, toIdx: number) {
    e.preventDefault();
    setDragOverIdx(null);
    if (dragIdx.current === null || dragIdx.current === toIdx || !banners) return;

    const reordered = [...banners];
    const [moved] = reordered.splice(dragIdx.current, 1);
    reordered.splice(toIdx, 0, moved);

    setBanners(reordered);

    try {
      await Promise.all(
        reordered.map((b, i) =>
          pb.collection("banners").update(b.id, { sort_order: i })
        )
      );
      revalidatePage().catch(console.error);
    } catch {
      setBanners(banners);
    }

    dragIdx.current = null;
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    try {
      const created = await pb.collection("banners").create<Banner>({
        link: form.link || undefined,
        sort_order: banners?.length ?? 0,
        is_active: true,
        image: file,
      });
      setBanners((prev) => [...(prev ?? []), created]);
      setShowForm(false);
      setFile(null);
      setForm({ link: "" });
      revalidatePage().catch(console.error);
    } finally {
      setUploading(false);
    }
  }

  async function toggleActive(banner: Banner) {
    const updated = await pb.collection("banners").update<Banner>(banner.id, { is_active: !banner.is_active });
    setBanners((prev) => prev?.map((b) => b.id === banner.id ? updated : b) ?? prev);
    revalidatePage();
  }

  async function deleteBanner() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await pb.collection("banners").delete(deleteId);
      setBanners((prev) => prev?.filter((b) => b.id !== deleteId) ?? prev);
      setDeleteId(null);
      revalidatePage().catch(console.error);
    } catch (e) {
      console.error("Delete banner failed:", e);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5">
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
          <div>
            <label className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm text-zinc-300 cursor-pointer w-fit">
              <Upload className="w-4 h-4" />{file ? file.name : "Chọn ảnh *"}
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="hidden" required />
            </label>
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Link đến (tuỳ chọn)</label>
            <input value={form.link} onChange={(e) => setForm({ link: e.target.value })} className={iCls} placeholder="Mặc định: danh sách sản phẩm" />
          </div>
          <button type="submit" disabled={uploading || !file}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm rounded-lg transition-colors disabled:opacity-60">
            {uploading ? "Đang upload..." : "Tạo banner"}
          </button>
        </form>
      )}

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm bg-zinc-950 border border-zinc-800 text-white p-0 gap-0">
          <div className="p-5">
            <DialogHeader>
              <DialogTitle className="text-white text-sm">Xoá banner</DialogTitle>
            </DialogHeader>
            <p className="text-zinc-400 text-sm mt-2">Banner này sẽ bị xoá vĩnh viễn.</p>
          </div>
          <div className="flex gap-2 justify-end px-5 py-3 border-t border-zinc-800 bg-zinc-900/50">
            <button onClick={() => setDeleteId(null)} className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors">Huỷ</button>
            <button onClick={deleteBanner} disabled={deleting}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-60">
              <Check className="w-3.5 h-3.5" />{deleting ? "Đang xoá..." : "Xoá"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-x-auto">
        {banners === null ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                <th className="w-10 py-3 pl-4 text-center">#</th>
                <th className="w-28 py-3 pl-2 text-left">Ảnh</th>
                <th className="py-3 pl-2 text-left">Link</th>
                <th className="py-3 pl-2 text-center w-24">Hiển thị</th>
                <th className="py-3 pr-4 text-center w-20">Xoá</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {[1, 2, 3].map((i) => (
                <tr key={i}>
                  <td className="py-3 pl-4 text-center"><div className="w-4 h-4 bg-zinc-800 rounded animate-pulse mx-auto" /></td>
                  <td className="py-2 pl-2"><div className="w-24 h-14 rounded-lg bg-zinc-800 animate-pulse" /></td>
                  <td className="py-3 pl-2"><div className="h-4 w-40 bg-zinc-800 rounded animate-pulse" /></td>
                  <td /><td />
                </tr>
              ))}
            </tbody>
          </table>
        ) : banners.length === 0 ? (
          <div className="py-10 text-center text-zinc-500 text-sm">Chưa có banner nào. Upload ảnh đầu tiên!</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                <th className="w-10 py-3 pl-4 text-center">#</th>
                <th className="w-28 py-3 pl-2 text-left">Ảnh</th>
                <th className="py-3 pl-2 text-left">Link</th>
                <th className="py-3 pl-2 text-center w-24">Hiển thị</th>
                <th className="py-3 pr-4 text-center w-20">Xoá</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {banners.map((banner, idx) => {
                const imgUrl = getImageUrl(banner.collectionId, banner.id, banner.image, 300);
                return (
                  <tr
                    key={banner.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, idx)}
                    className={`cursor-move transition-colors ${
                      draggingIdx === idx ? "opacity-30" : dragOverIdx === idx ? "bg-rose-500/10 outline outline-rose-500/40" : "hover:bg-zinc-800/50"
                    }`}
                  >
                    <td className="py-3 pl-4 text-center">
                      <GripVertical className="w-4 h-4 text-zinc-600 inline-block" />
                    </td>
                    <td className="py-2 pl-2">
                      <div className="relative w-24 h-14 rounded-lg overflow-hidden bg-zinc-800">
                        <Image src={imgUrl} alt={`Banner ${idx + 1}`} fill sizes="96px" className="object-cover" />
                      </div>
                    </td>
                    <td className="py-3 pl-2">
                      {banner.link ? (
                        <span className="text-zinc-300 text-sm font-mono truncate max-w-[250px] block">{banner.link}</span>
                      ) : (
                        <span className="text-zinc-600 text-sm">Trang chủ</span>
                      )}
                    </td>
                    <td className="py-3 pl-2 text-center">
                      <button onClick={() => toggleActive(banner)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          banner.is_active
                            ? "bg-green-500/15 text-green-400 hover:bg-green-500/25 border border-green-500/30"
                            : "bg-zinc-800 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-700 border border-zinc-700"
                        }`}>
                        {banner.is_active ? "Hiển thị" : "Ẩn"}
                      </button>
                    </td>
                    <td className="py-3 pr-4 text-center">
                      <button onClick={() => setDeleteId(banner.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 bg-zinc-800 hover:text-red-400 hover:bg-red-400/10 border border-zinc-700 hover:border-red-500/30 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                        Xoá
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const iCls = "w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600";
