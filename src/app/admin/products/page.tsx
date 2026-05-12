"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import pb from "@/services/pocketbase";
import { formatPrice } from "@/lib/utils";
import { getThumbUrl } from "@/lib/media";
import { Plus, Pencil, Trash2, Search, Check, Package } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Product } from "@/schema";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const filter = search ? `name~"${search}"` : undefined;
    pb.collection("products").getList<Product>(page, 20, { sort: "-created", filter }).then((r) => {
      if (!cancelled) { setProducts(r.items); setTotal(r.totalItems); }
    });
    return () => { cancelled = true; };
  }, [page, search]);

  async function toggleActive(p: Product) {
    try {
      await pb.collection("products").update(p.id, { is_active: !p.is_active });
      setProducts((prev) => prev?.map((x) => x.id === p.id ? { ...x, is_active: !p.is_active } : x) ?? prev);
    } catch (e) { console.error(e); }
  }

  async function deleteProduct() {
    if (!deleteId) return;
    setDeleting(true);
    try { await pb.collection("products").delete(deleteId); setDeleteId(null); await refresh(); }
    catch (e) { console.error(e); }
    finally { setDeleting(false); setDeleteId(null); }
  }

  async function refresh() {
    const filter = search ? `name~"${search}"` : undefined;
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

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Tìm sản phẩm..." className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600" />
      </div>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm bg-zinc-950 border border-zinc-800 text-white p-0 gap-0">
          <div className="p-5"><DialogHeader><DialogTitle className="text-white text-sm">Xoá sản phẩm</DialogTitle></DialogHeader><p className="text-zinc-400 text-sm mt-2">Sản phẩm này sẽ bị xoá vĩnh viễn.</p></div>
          <div className="flex gap-2 justify-end px-5 py-3 border-t border-zinc-800 bg-zinc-900/50"><button onClick={() => setDeleteId(null)} className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors">Huỷ</button><button onClick={deleteProduct} disabled={deleting} className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-60"><Check className="w-3.5 h-3.5" />{deleting ? "Đang xoá..." : "Xoá"}</button></div>
        </DialogContent>
      </Dialog>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-x-auto">
        {products === null ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                <th className="py-3 pl-4 text-left w-14">Ảnh</th>
                <th className="py-3 pl-2 text-left">Sản phẩm</th>
                <th className="py-3 pl-2 text-left hidden md:table-cell">Giá</th>
                <th className="py-3 pl-2 text-left hidden lg:table-cell">Tags</th>
                <th className="py-3 pl-2 text-center w-24">Hiển thị</th>
                <th className="py-3 pr-4 text-center w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  <td className="py-2 pl-4"><div className="w-10 h-10 rounded-lg bg-zinc-800 animate-pulse" /></td>
                  <td className="py-3 pl-2"><div className="h-4 w-48 bg-zinc-800 rounded animate-pulse" /></td>
                  <td className="py-3 pl-2 hidden md:table-cell"><div className="h-4 w-24 bg-zinc-800 rounded animate-pulse" /></td>
                  <td /><td /><td />
                </tr>
              ))}
            </tbody>
          </table>
        ) : products.length === 0 ? <div className="py-16 text-center"><Package className="w-10 h-10 text-zinc-600 mx-auto mb-3" /><p className="text-zinc-400 font-medium">Không có sản phẩm nào</p></div>
        : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                <th className="py-3 pl-4 text-left w-14">Ảnh</th>
                <th className="py-3 pl-2 text-left">Sản phẩm</th>
                <th className="py-3 pl-2 text-left hidden md:table-cell">Giá</th>
                <th className="py-3 pl-2 text-left hidden lg:table-cell">Tags</th>
                <th className="py-3 pl-2 text-center w-24">Hiển thị</th>
                <th className="py-3 pr-4 text-center w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-2 pl-4">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-800">
                      {p.thumbnail ? (
                        <Image src={getThumbUrl(p.collectionId, p.id, p.thumbnail, "80x80")} alt={p.name} width={40} height={40} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Package className="w-4 h-4 text-zinc-600" /></div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 pl-2">
                    <p className="text-white font-medium truncate max-w-[200px] md:max-w-[320px]">{p.name}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5 md:hidden">
                      {p.sale_price ? <>{formatPrice(p.sale_price)} <span className="line-through text-zinc-600 ml-1">{formatPrice(p.price)}</span></> : formatPrice(p.price)}
                    </p>
                  </td>
                  <td className="py-3 pl-2 hidden md:table-cell">
                    {p.sale_price ? (
                      <span><span className="text-white font-medium">{formatPrice(p.sale_price)}</span><span className="text-zinc-500 line-through text-xs ml-1.5">{formatPrice(p.price)}</span></span>
                    ) : (
                      <span className="text-zinc-400">{formatPrice(p.price)}</span>
                    )}
                  </td>
                  <td className="py-3 pl-2 hidden lg:table-cell">
                    <div className="flex gap-1 flex-wrap">
                      {p.is_best_seller && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">Best</span>}
                      {p.is_featured && <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/20">Nổi bật</span>}
                      {!p.is_active && <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-400 border border-zinc-600">Ẩn</span>}
                    </div>
                  </td>
                  <td className="py-3 pl-2 text-center">
                    <button onClick={() => toggleActive(p)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                        p.is_active ? "bg-green-500/15 text-green-400 hover:bg-green-500/25 border border-green-500/30" : "bg-zinc-800 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-700 border border-zinc-700"
                      }`}>
                      {p.is_active ? "Hiển thị" : "Ẩn"}
                    </button>
                  </td>
                  <td className="py-3 pr-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Link href={`/admin/products/${p.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-zinc-400 bg-zinc-800 hover:text-white hover:bg-zinc-700 border border-zinc-700 transition-colors">
                        <Pencil className="w-3 h-3" /> Sửa
                      </Link>
                      <button onClick={() => setDeleteId(p.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-zinc-400 bg-zinc-800 hover:text-red-400 hover:bg-red-400/10 border border-zinc-700 hover:border-red-500/30 transition-colors">
                        <Trash2 className="w-3 h-3" /> Xoá
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 text-sm">‹</button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            let pg: number;
            if (totalPages <= 7) pg = i + 1;
            else if (page <= 4) pg = i + 1;
            else if (page >= totalPages - 3) pg = totalPages - 6 + i;
            else pg = page - 3 + i;
            return <button key={pg} onClick={() => setPage(pg)} className={`w-8 h-8 text-sm rounded-lg border transition-colors ${page === pg ? "bg-rose-600 border-rose-600 text-white" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"}`}>{pg}</button>;
          })}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 text-sm">›</button>
        </div>
      )}
    </div>
  );
}
