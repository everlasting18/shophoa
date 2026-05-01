"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import pb from "@/lib/pocketbase";
import { ChevronLeft, Upload } from "lucide-react";
import type { Category } from "@/lib/types";

export default function AdminNewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: "", slug: "", price: "", sale_price: "",
    short_description: "", description: "",
    is_featured: false, is_best_seller: false, is_active: true,
    seo_title: "", seo_description: "",
    categories: [] as string[],
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    pb.collection("categories").getFullList<Category>({ sort: "sort_order" }).then(setCategories);
  }, []);

  function set(key: string, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function generateSlug(name: string) {
    return name.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d").replace(/[^a-z0-9\s-]/g, "")
      .trim().replace(/\s+/g, "-");
  }

  function toggleCategory(catId: string) {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(catId)
        ? prev.categories.filter((c) => c !== catId)
        : [...prev.categories, catId],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.slug || !form.price) { setError("Vui lòng điền Tên, Slug và Giá."); return; }
    setSaving(true); setError("");
    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("slug", form.slug);
      data.append("price", form.price);
      if (form.sale_price) data.append("sale_price", form.sale_price);
      data.append("short_description", form.short_description);
      data.append("description", form.description);
      data.append("is_featured", String(form.is_featured));
      data.append("is_best_seller", String(form.is_best_seller));
      data.append("is_active", String(form.is_active));
      data.append("seo_title", form.seo_title);
      data.append("seo_description", form.seo_description);
      form.categories.forEach((c) => data.append("categories", c));
      if (thumbnailFile) data.append("thumbnail", thumbnailFile);
      await pb.collection("products").create(data);
      router.push("/admin/products");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="text-zinc-400 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-white">Thêm sản phẩm</h1>
      </div>

      <Card title="Thông tin cơ bản">
        <div className="space-y-3">
          <F label="Tên sản phẩm *">
            <input value={form.name} onChange={(e) => { set("name", e.target.value); set("slug", generateSlug(e.target.value)); }}
              placeholder="Bó Hoa Tulip Hà Lan..." className={iCls} required />
          </F>
          <F label="Slug *">
            <input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="bo-hoa-tulip-ha-lan" className={iCls} required />
          </F>
          <F label="Mô tả ngắn">
            <input value={form.short_description} onChange={(e) => set("short_description", e.target.value)} placeholder="Size 35x50cm..." className={iCls} />
          </F>
          <F label="Mô tả chi tiết (HTML)">
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} className={`${iCls} resize-none`} />
          </F>
        </div>
      </Card>

      <Card title="Giá">
        <div className="grid grid-cols-2 gap-3">
          <F label="Giá gốc *"><input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="380000" className={iCls} required /></F>
          <F label="Giá sale"><input type="number" value={form.sale_price} onChange={(e) => set("sale_price", e.target.value)} placeholder="320000" className={iCls} /></F>
        </div>
      </Card>

      <Card title="Ảnh đại diện">
        <label className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm text-zinc-300 cursor-pointer w-fit transition-colors">
          <Upload className="w-4 h-4" />
          {thumbnailFile ? thumbnailFile.name : "Chọn ảnh thumbnail"}
          <input type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)} className="hidden" />
        </label>
      </Card>

      <Card title="Danh mục">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button key={cat.id} type="button" onClick={() => toggleCategory(cat.id)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${form.categories.includes(cat.id) ? "bg-rose-600 border-rose-600 text-white" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white"}`}>
              {cat.name}
            </button>
          ))}
        </div>
      </Card>

      <Card title="Tuỳ chọn">
        {(["is_active", "is_featured", "is_best_seller"] as const).map((key) => (
          <label key={key} className="flex items-center gap-3 cursor-pointer mb-2">
            <input type="checkbox" checked={form[key]} onChange={(e) => set(key, e.target.checked)} className="w-4 h-4 accent-rose-500" />
            <span className="text-sm text-zinc-300">{{ is_active: "Hiển thị", is_featured: "Nổi bật", is_best_seller: "Bán chạy" }[key]}</span>
          </label>
        ))}
      </Card>

      <Card title="SEO">
        <div className="space-y-3">
          <F label="SEO Title"><input value={form.seo_title} onChange={(e) => set("seo_title", e.target.value)} className={iCls} /></F>
          <F label="SEO Description"><textarea value={form.seo_description} onChange={(e) => set("seo_description", e.target.value)} rows={2} className={`${iCls} resize-none`} /></F>
        </div>
      </Card>

      {error && <p className="text-xs text-red-400 bg-red-950/30 rounded-lg px-3 py-2">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60">
          {saving ? "Đang tạo..." : "Tạo sản phẩm"}
        </button>
        <Link href="/admin/products" className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg transition-colors">Huỷ</Link>
      </div>
    </form>
  );
}

const iCls = "w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all";
function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">{title && <p className="text-xs font-medium text-zinc-400 mb-3 uppercase tracking-wide">{title}</p>}{children}</div>;
}
function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="mb-0"><label className="block text-xs text-zinc-400 mb-1.5">{label}</label>{children}</div>;
}
