import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, Search, Check, Package, Eye, EyeOff } from "lucide-react";
import { useProducts, useToggleProductActive, useDeleteProduct } from "@/features/products/api";
import { useCategories } from "@/features/categories/api";
import { formatPrice, useDebounce } from "@/lib/utils";
import { getThumbUrl } from "@/lib/media";

export const Route = createFileRoute("/_auth/products/")({
  component: ProductsPage,
});

const ACTIVE_FILTERS = [
  { value: "all",      label: "Tất cả" },
  { value: "active",   label: "Hiển thị" },
  { value: "inactive", label: "Đang ẩn" },
] as const;

function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search);
  const { data, isLoading } = useProducts(page, debouncedSearch, activeFilter, categoryFilter);
  const { data: categories = [] } = useCategories();
  const toggleActive = useToggleProductActive();
  const deleteProduct = useDeleteProduct();

  const products = data?.items ?? [];
  const total = data?.totalItems ?? 0;
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Sản phẩm</h1>
          <p className="text-stone-400 text-sm">{total} sản phẩm</p>
        </div>
        <Link to="/products/$id" params={{ id: "new" }}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Thêm mới
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm sản phẩm..."
            className="w-full pl-9 pr-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-stone-600"
          />
        </div>
        <div className="flex gap-1.5">
          {ACTIVE_FILTERS.map((f) => (
            <button key={f.value} onClick={() => { setActiveFilter(f.value); setPage(1); }}
              className={`flex-1 sm:flex-none px-3 py-2 sm:py-1.5 text-xs font-medium rounded-lg border transition-all ${
                activeFilter === f.value
                  ? "bg-rose-600 border-rose-600 text-white"
                  : "bg-stone-900 border-stone-800 text-stone-400 hover:text-white hover:border-stone-700"
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {categories.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          <button
            onClick={() => { setCategoryFilter(""); setPage(1); }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all whitespace-nowrap shrink-0 ${
              !categoryFilter ? "bg-rose-600 border-rose-600 text-white" : "bg-stone-900 border-stone-800 text-stone-400 hover:text-white hover:border-stone-700"
            }`}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setCategoryFilter(cat.id === categoryFilter ? "" : cat.id); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all whitespace-nowrap shrink-0 ${
                categoryFilter === cat.id ? "bg-rose-600 border-rose-600 text-white" : "bg-stone-900 border-stone-800 text-stone-400 hover:text-white hover:border-stone-700"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-stone-950 border border-stone-800 rounded-xl p-5 w-full max-w-sm">
            <h3 className="text-white text-sm font-semibold mb-2">Xoá sản phẩm</h3>
            <p className="text-stone-400 text-sm mb-4">Sản phẩm này sẽ bị xoá vĩnh viễn.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-3 py-1.5 text-xs text-stone-400 hover:text-white transition-colors">Huỷ</button>
              <button
                onClick={() => deleteProduct.mutate(deleteId, { onSuccess: () => setDeleteId(null) })}
                disabled={deleteProduct.isPending}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-60"
              >
                <Check className="w-3.5 h-3.5" />
                {deleteProduct.isPending ? "Đang xoá..." : "Xoá"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <>
            {/* Mobile skeleton */}
            <div className="lg:hidden divide-y divide-stone-800/50">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3.5 animate-pulse">
                  <div className="w-12 h-12 rounded-xl bg-stone-800 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 bg-stone-800 rounded" />
                    <div className="h-3 w-24 bg-stone-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop skeleton */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <TableHead />
                <tbody className="divide-y divide-stone-800/50">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i}>
                      <td className="py-2 pl-4"><div className="w-10 h-10 rounded-lg bg-stone-800 animate-pulse" /></td>
                      <td className="py-3 pl-2"><div className="h-4 w-48 bg-stone-800 rounded animate-pulse" /></td>
                      <td className="py-3 pl-2 hidden md:table-cell"><div className="h-4 w-24 bg-stone-800 rounded animate-pulse" /></td>
                      <td /><td /><td />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : products.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="w-10 h-10 text-stone-600 mx-auto mb-3" />
            <p className="text-stone-400 font-medium">Không có sản phẩm nào</p>
          </div>
        ) : (
          <>
            {/* Mobile: card list */}
            <div className="lg:hidden divide-y divide-stone-800/50">
              {products.map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-stone-800/20 transition-colors">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-800 shrink-0">
                    {p.thumbnail ? (
                      <img src={getThumbUrl(p.collectionId, p.id, p.thumbnail)} alt={p.name} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-stone-600" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm leading-tight truncate">{p.name}</p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {p.sale_price
                        ? <><span className="text-stone-300">{formatPrice(p.sale_price)}</span><span className="line-through text-stone-600 ml-1.5">{formatPrice(p.price)}</span></>
                        : formatPrice(p.price)}
                    </p>
                    {(p.is_best_seller || (p.expand?.categories?.length ?? 0) > 0) && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {p.is_best_seller && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">Best</span>}
                        {(p.expand?.categories ?? []).map((cat) => (
                          <span key={cat.id} className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-400 border border-stone-700">{cat.name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => toggleActive.mutate({ id: p.id, is_active: !p.is_active })}
                      title={p.is_active ? "Đang hiển thị" : "Đang ẩn"}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors border ${
                        p.is_active
                          ? "bg-green-500/15 text-green-400 border-green-500/30 hover:bg-green-500/25"
                          : "bg-stone-800 text-stone-500 border-stone-700 hover:text-stone-300"
                      }`}
                    >
                      {p.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <Link to="/products/$id" params={{ id: p.id }}
                      className="w-9 h-9 rounded-xl flex items-center justify-center bg-stone-800 text-stone-400 hover:text-white border border-stone-700 transition-colors">
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button onClick={() => setDeleteId(p.id)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center bg-stone-800 text-stone-400 hover:text-red-400 border border-stone-700 hover:border-red-500/30 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <TableHead />
                <tbody className="divide-y divide-stone-800/50">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-stone-800/30 transition-colors">
                      <td className="py-2 pl-4">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-800">
                          {p.thumbnail ? (
                            <img src={getThumbUrl(p.collectionId, p.id, p.thumbnail)} alt={p.name} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Package className="w-4 h-4 text-stone-600" /></div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 pl-2">
                        <p className="text-white font-medium truncate max-w-[200px] md:max-w-[280px]">{p.name}</p>
                        {p.is_best_seller && (
                          <div className="flex gap-1 mt-1">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">Best</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 pl-2 hidden md:table-cell">
                        {p.sale_price ? (
                          <span><span className="text-white font-medium">{formatPrice(p.sale_price)}</span><span className="text-stone-500 line-through text-xs ml-1.5">{formatPrice(p.price)}</span></span>
                        ) : (
                          <span className="text-stone-400">{formatPrice(p.price)}</span>
                        )}
                      </td>
                      <td className="py-3 pl-2 hidden lg:table-cell">
                        <div className="flex gap-1 flex-wrap max-w-[180px]">
                          {(p.expand?.categories ?? []).length > 0
                            ? (p.expand?.categories ?? []).map((cat) => (
                                <span key={cat.id} className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 border border-stone-700 whitespace-nowrap">{cat.name}</span>
                              ))
                            : <span className="text-stone-600 text-xs">—</span>
                          }
                        </div>
                      </td>
                      <td className="py-3 pl-2 text-center">
                        <button
                          onClick={() => toggleActive.mutate({ id: p.id, is_active: !p.is_active })}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                            p.is_active
                              ? "bg-green-500/15 text-green-400 hover:bg-green-500/25 border border-green-500/30"
                              : "bg-stone-800 text-stone-400 hover:text-stone-300 hover:bg-stone-700 border border-stone-700"
                          }`}
                        >
                          {p.is_active ? "Hiển thị" : "Ẩn"}
                        </button>
                      </td>
                      <td className="py-3 pr-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Link to="/products/$id" params={{ id: p.id }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-stone-400 bg-stone-800 hover:text-white hover:bg-stone-700 border border-stone-700 transition-colors">
                            <Pencil className="w-3 h-3" /> Sửa
                          </Link>
                          <button onClick={() => setDeleteId(p.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-stone-400 bg-stone-800 hover:text-red-400 hover:bg-red-400/10 border border-stone-700 hover:border-red-500/30 transition-colors">
                            <Trash2 className="w-3 h-3" /> Xoá
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-800 text-stone-400 hover:text-white disabled:opacity-30 text-sm">‹</button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            let pg: number;
            if (totalPages <= 7) pg = i + 1;
            else if (page <= 4) pg = i + 1;
            else if (page >= totalPages - 3) pg = totalPages - 6 + i;
            else pg = page - 3 + i;
            return (
              <button key={pg} onClick={() => setPage(pg)}
                className={`w-8 h-8 text-sm rounded-lg border transition-colors ${page === pg ? "bg-rose-600 border-rose-600 text-white" : "bg-stone-900 border-stone-800 text-stone-400 hover:text-white"}`}>
                {pg}
              </button>
            );
          })}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-800 text-stone-400 hover:text-white disabled:opacity-30 text-sm">›</button>
        </div>
      )}
    </div>
  );
}

function TableHead() {
  return (
    <thead>
      <tr className="border-b border-stone-800 text-stone-500 text-xs uppercase tracking-wider">
        <th className="py-3 pl-4 text-left w-14">Ảnh</th>
        <th className="py-3 pl-2 text-left">Sản phẩm</th>
        <th className="py-3 pl-2 text-left hidden md:table-cell">Giá</th>
        <th className="py-3 pl-2 text-left hidden lg:table-cell">Danh mục</th>
        <th className="py-3 pl-2 text-center w-24">Hiển thị</th>
        <th className="py-3 pr-4 text-center w-28">Thao tác</th>
      </tr>
    </thead>
  );
}
