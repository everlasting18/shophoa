"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import pb from "@/lib/pocketbase";
import { formatPrice } from "@/lib/utils";
import { getThumbUrl } from "@/lib/media";
import { Plus, Pencil, Trash2, Search, ToggleLeft, ToggleRight, ImageIcon, Package, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Product } from "@/lib/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const filter = search ? `name~"${search}" || slug~"${search}"` : undefined;
    pb.collection("products").getList<Product>(page, 20, { sort: "-created", filter }).then((r) => {
      if (!cancelled) { setProducts(r.items); setTotal(r.totalItems); }
    });
    return () => { cancelled = true; };
  }, [page, search]);

  async function toggleActive(p: Product) {
    try {
      await pb.collection("products").update(p.id, { is_active: !p.is_active });
      setProducts((prev) => prev?.map((x) => x.id === p.id ? { ...x, is_active: !p.is_active } : x) ?? prev);
    } catch (e) { console.error("Toggle failed:", e); }
  }

  async function deleteProduct() {
    if (!deleteId) return;
    setDeleting(true);
    try { await pb.collection("products").delete(deleteId); setDeleteId(null); await refresh(); }
    catch (e) { console.error("Delete failed:", e); }
    finally { setDeleting(false); setDeleteId(null); }
  }

  async function refresh() {
    const filter = search ? `name~"${search}" || slug~"${search}"` : undefined;
    const r = await pb.collection("products").getList<Product>(page, 20, { sort: "-created", filter });
    setProducts(r.items); setTotal(r.totalItems);
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-white">Sản phẩm</h1><p className="text-zinc-400 text-sm">{total} sản phẩm</p></div>
        <Link href="/admin/products/new" className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium rounded-lg transition-colors"><Plus className="w-4 h-4" /> Thêm mới</Link>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Tìm sản phẩm..." className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600" />
      </div>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm bg-zinc-950 border border-zinc-800 text-white p-0 gap-0">
          <div className="p-5"><DialogHeader><DialogTitle className="text-white text-sm">Xoá sản phẩm</DialogTitle></DialogHeader><p className="text-zinc-400 text-sm mt-2">Sản phẩm này sẽ bị xoá vĩnh viễn.</p></div>
          <div className="flex gap-2 justify-end px-5 py-3 border-t border-zinc-800 bg-zinc-900/50"><button onClick={() => setDeleteId(null)} className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors">Huỷ</button><button onClick={deleteProduct} disabled={deleting} className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-60"><Check className="w-3.5 h-3.5" />{deleting ? "Đang xoá..." : "Xoá"}</button></div>
        </DialogContent>
      </Dialog>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {products === null ? <div className="py-16 text-center text-zinc-500 text-sm">Đang tải...</div>
        : products.length === 0 ? <div className="py-16 text-center"><Package className="w-10 h-10 text-zinc-600 mx-auto mb-3" /><p className="text-zinc-400 font-medium">Không có sản phẩm nào</p></div>
        : <div className="divide-y divide-zinc-800">
          {products.map((p) => (
            <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-zinc-800/30 transition-colors">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                {p.thumbnail ? <Image src={getThumbUrl(p.collectionId, p.id, p.thumbnail, "100x100")} alt={p.name} width={48} height={48} className="object-cover w-full h-full" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-5 h-5 text-zinc-600" /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-white font-medium truncate">{p.name}</p>
                  {p.is_best_seller && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium shrink-0">Best</span>}
                  {p.is_featured && <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-medium shrink-0">Nổi bật</span>}
                  {!p.is_active && <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-400 font-medium shrink-0">Ẩn</span>}
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {formatPrice(p.sale_price ?? p.price)}
                  {p.sale_price && <span className="line-through text-zinc-600 ml-2">{formatPrice(p.price)}</span>}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => toggleActive(p)} className={`p-1.5 rounded-lg transition-colors ${p.is_active ? "text-green-400 hover:bg-green-400/10" : "text-zinc-500 hover:bg-zinc-700"}`}>{p.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}</button>
                <Link href={`/admin/products/${p.id}`} className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"><Pencil className="w-4 h-4" /></Link>
                <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 text-sm">‹</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 text-sm rounded-lg border transition-colors ${page === p ? "bg-rose-600 border-rose-600 text-white" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"}`}>{p}</button>
          ))}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 text-sm">›</button>
        </div>
      )}
    </div>
  );
}
