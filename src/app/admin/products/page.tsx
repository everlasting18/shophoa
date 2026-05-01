"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import pb from "@/lib/pocketbase";
import { formatPrice } from "@/components/product/price-display";
import { Plus, Pencil, Trash2, Search, ToggleLeft, ToggleRight } from "lucide-react";
import type { Product } from "@/lib/types";

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    const filter = search ? `name~"${search}" || slug~"${search}"` : undefined;

    pb.collection("products").getList<Product>(page, 20, {
      sort: "-created",
      filter,
    }).then((result) => {
      if (!cancelled) {
        setProducts(result.items);
        setTotal(result.totalItems);
      }
    });

    return () => { cancelled = true; };
  }, [page, search]);

  async function toggleActive(product: Product) {
    await pb.collection("products").update(product.id, { is_active: !product.is_active });
    setProducts((prev) => prev?.map((p) =>
      p.id === product.id ? { ...p, is_active: !p.is_active } : p
    ) ?? prev);
  }

  async function deleteProduct(id: string) {
    if (!confirm("Xoá sản phẩm này?")) return;
    await pb.collection("products").delete(id);
    setProducts((prev) => prev?.filter((p) => p.id !== id) ?? prev);
    setTotal((t) => t - 1);
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Sản phẩm</h1>
          <p className="text-zinc-400 text-sm">{total} sản phẩm</p>
        </div>
        <Link href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Thêm mới
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Tìm sản phẩm..."
          className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600" />
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {products === null ? (
          <div className="py-16 text-center text-zinc-500 text-sm">Đang tải...</div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 text-sm">Không có sản phẩm nào</div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {products.map((product) => {
              const thumb = product.thumbnail && typeof product.thumbnail === "string"
                ? `${PB_URL}/api/files/${product.collectionId}/${product.id}/${product.thumbnail}?thumb=80x80`
                : "/images/placeholder-flower.svg";
              return (
                <div key={product.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                    <Image src={thumb} alt={product.name} fill sizes="48px" className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{product.name}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {formatPrice(product.sale_price ?? product.price)}
                      {product.sale_price && (
                        <span className="line-through text-zinc-600 ml-2">{formatPrice(product.price)}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => toggleActive(product)} title={product.is_active ? "Đang hiển thị" : "Đang ẩn"}
                      className={`p-1.5 rounded-lg transition-colors ${product.is_active ? "text-green-400 hover:bg-green-400/10" : "text-zinc-500 hover:bg-zinc-700"}`}>
                      {product.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <Link href={`/admin/products/${product.id}`}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors">
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button onClick={() => deleteProduct(product.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-8 h-8 text-sm rounded-lg border transition-colors ${page === p ? "bg-rose-600 border-rose-600 text-white" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
