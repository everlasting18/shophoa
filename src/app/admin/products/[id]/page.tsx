"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import pb from "@/lib/pocketbase";
import { formatPrice } from "@/lib/utils";
import { ChevronLeft, Upload, ImageIcon, Plus, X, Check } from "lucide-react";
import { getThumbUrl, getImageUrl } from "@/lib/media";
import RichEditor from "@/components/ui/rich-editor";
import type { Product, Category } from "@/lib/types";

const OCCASIONS = ["Sinh nhật", "Khai trương", "Tốt nghiệp", "Tình yêu", "Chia buồn", "Sự kiện", "Chúc mừng", "Valentine", "8/3", "20/10", "20/11"];

export default function AdminProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const creating = id === "new";

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ name: "", slug: "", price: "", sale_price: "", short_description: "", description: "", is_featured: false, is_best_seller: false, is_active: true, categories: [] as string[], occasions: [] as string[] });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<{ filename: string; url: string }[]>([]);
  const [removedImageFilenames, setRemovedImageFilenames] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { pb.collection("categories").getFullList<Category>({ sort: "sort_order" }).then(setCategories); }, []);

  useEffect(() => {
    if (creating) return;
    pb.collection("products").getOne<Product>(id).then((p) => {
      setForm({ name: p.name, slug: p.slug, price: String(p.price), sale_price: p.sale_price ? String(p.sale_price) : "", short_description: p.short_description || "", description: p.description || "", is_featured: p.is_featured, is_best_seller: p.is_best_seller, is_active: p.is_active, categories: p.categories || [], occasions: p.occasions || [] });
      if (p.thumbnail) setThumbnailPreview(getThumbUrl(p.collectionId, p.id, p.thumbnail, "200x200"));
      if (Array.isArray(p.images)) setExistingImages(p.images.map((img: string) => ({ filename: img, url: getImageUrl(p.collectionId, p.id, img, 200) })));
    });
  }, [id, creating]);

  function generateSlug(name: string) {
    return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.slug || !form.price) { setError("Vui lòng điền Tên, Slug, Giá."); return; }
    if (form.sale_price && Number(form.sale_price) >= Number(form.price)) { setError("Giá sale phải nhỏ hơn giá gốc."); return; }
    setSaving(true); setError("");
    try {
      const data = new FormData();
      data.append("name", form.name); data.append("slug", form.slug); data.append("price", form.price);
      if (form.sale_price) data.append("sale_price", form.sale_price);
      data.append("short_description", form.short_description); data.append("description", form.description);
      data.append("is_featured", String(form.is_featured)); data.append("is_best_seller", String(form.is_best_seller));
      data.append("is_active", String(form.is_active));
      data.append("occasions", JSON.stringify(form.occasions));
      form.categories.forEach((c) => data.append("categories", c));
      if (thumbnailFile) data.append("thumbnail", thumbnailFile);
      galleryFiles.forEach((f) => data.append("images", f));
      removedImageFilenames.forEach((fn) => data.append("images-", fn));

      if (creating) await pb.collection("products").create(data);
      else await pb.collection("products").update(id, data);
      router.push("/admin/products");
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Có lỗi."); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="text-zinc-400 hover:text-white transition-colors"><ChevronLeft className="w-5 h-5" /></Link>
        <h1 className="text-xl font-bold text-white">{creating ? "Thêm sản phẩm mới" : "Chỉnh sửa sản phẩm"}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Basic + Images side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
          <Section title="Thông tin cơ bản">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-zinc-500 mb-1.5 block">Tên *</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: generateSlug(e.target.value) }))} className={iCls} />
              </div>
              <div>
                <label className="text-[11px] text-zinc-500 mb-1.5 block">Slug *</label>
                <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className={iCls} />
              </div>
              <div>
                <label className="text-[11px] text-zinc-500 mb-1.5 block">Giá gốc *</label>
                <input type="number" min="0" step="1000" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className={iCls + " [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"} />
                {form.price && <p className="text-[10px] text-zinc-500 mt-1">{formatPrice(Number(form.price))}</p>}
              </div>
              <div>
                <label className="text-[11px] text-zinc-500 mb-1.5 block">Giá sale</label>
                <input type="number" min="0" max={form.price || undefined} step="1000" value={form.sale_price} onChange={(e) => setForm((f) => ({ ...f, sale_price: e.target.value }))}
                  className={iCls + " [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"} />
                {form.sale_price && Number(form.sale_price) >= Number(form.price) && (
                  <p className="text-[10px] text-red-400 mt-1">Phải nhỏ hơn giá gốc</p>
                )}
                {form.sale_price && Number(form.sale_price) < Number(form.price) && (
                  <p className="text-[10px] text-zinc-500 mt-1">{formatPrice(Number(form.sale_price))}</p>
                )}
              </div>
            </div>
          </Section>

          <Section title="Hình ảnh">
            <div className="space-y-3">
              <div>
                <p className="text-[11px] text-zinc-500 mb-1.5">Ảnh đại diện</p>
                <div className="flex items-start gap-2">
                  <div className="w-16 h-16 rounded-lg bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center shrink-0">
                    {thumbnailPreview ? <Image src={thumbnailPreview} alt="" width={64} height={64} className="object-cover w-full h-full" /> : <ImageIcon className="w-4 h-4 text-zinc-600" />}
                  </div>
                  <label className="inline-flex items-center gap-1 px-2 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-[11px] text-zinc-300 rounded cursor-pointer transition-colors">
                    <Upload className="w-3 h-3" /> Chọn
                    <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setThumbnailFile(f); setThumbnailPreview(URL.createObjectURL(f)); } }} className="hidden" />
                  </label>
                </div>
              </div>
              <div>
                <p className="text-[11px] text-zinc-500 mb-1.5">Gallery (tối đa 4)</p>
                <div className="flex flex-wrap gap-1.5">
                  {existingImages.map((img, i) => (
                    <div key={`e-${i}`} className="relative w-14 h-14 rounded overflow-hidden bg-zinc-800 border border-zinc-700 group">
                      <Image src={img.url} alt="" width={56} height={56} className="object-cover w-full h-full" />
                      <button type="button" onClick={() => { setRemovedImageFilenames((p) => [...p, img.filename]); setExistingImages((prev) => prev.filter((_, j) => j !== i)); }} className="absolute top-0 right-0 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-2.5 h-2.5" /></button>
                    </div>
                  ))}
                  {galleryPreviews.map((src, i) => (
                    <div key={`n-${i}`} className="relative w-14 h-14 rounded overflow-hidden bg-zinc-800 border border-zinc-700 group">
                      <Image src={src} alt="" width={56} height={56} className="object-cover w-full h-full" />
                      <button type="button" onClick={() => { setGalleryFiles((p) => p.filter((_, j) => j !== i)); setGalleryPreviews((p) => p.filter((_, j) => j !== i)); }} className="absolute top-0 right-0 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-2.5 h-2.5" /></button>
                    </div>
                  ))}
                  {(existingImages.length + galleryPreviews.length) < 4 && (
                    <label className="w-14 h-14 rounded bg-zinc-800 border border-dashed border-zinc-700 hover:border-zinc-500 flex items-center justify-center cursor-pointer transition-colors">
                      <Plus className="w-3.5 h-3.5 text-zinc-500" />
                      <input type="file" accept="image/*" multiple onChange={(e) => { const slots = 4 - existingImages.length - galleryPreviews.length; const files = Array.from(e.target.files || []).slice(0, slots); setGalleryFiles((p) => [...p, ...files]); setGalleryPreviews((p) => [...p, ...files.map((f) => URL.createObjectURL(f))]); }} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* Row 2: Description full width */}
        <Section title="Mô tả">
          <div className="space-y-3">
            <div>
              <label className="text-[11px] text-zinc-500 mb-1.5 block">Mô tả ngắn (hiển thị trên thẻ sản phẩm)</label>
              <textarea value={form.short_description} onChange={(e) => setForm((f) => ({ ...f, short_description: e.target.value }))} className={iCls} rows={3} />
            </div>
            <div>
              <label className="text-[11px] text-zinc-500 mb-1.5 block">Mô tả chi tiết</label>
              <RichEditor value={form.description} onChange={(html) => setForm((f) => ({ ...f, description: html }))} rows={14} />
            </div>
          </div>
        </Section>

        {/* Categories + Occasions */}
        <Section title="Phân loại">
          <div>
            <p className="text-[11px] text-zinc-500 mb-1.5">Danh mục</p>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((c) => (
                <button key={c.id} type="button" onClick={() => setForm((f) => ({ ...f, categories: f.categories.includes(c.id) ? f.categories.filter((x) => x !== c.id) : [...f.categories, c.id] }))} className={`px-2.5 py-1 text-[11px] rounded-md border transition-colors ${form.categories.includes(c.id) ? "bg-rose-600 border-rose-600 text-white" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white"}`}>{c.name}</button>
              ))}
            </div>
          </div>
          <div className="mt-3">
            <p className="text-[11px] text-zinc-500 mb-1.5">Dịp tặng</p>
            <div className="flex flex-wrap gap-1.5">
              {OCCASIONS.map((o) => (
                <button key={o} type="button" onClick={() => setForm((f) => ({ ...f, occasions: f.occasions.includes(o) ? f.occasions.filter((x) => x !== o) : [...f.occasions, o] }))} className={`px-2.5 py-1 text-[11px] rounded-md border transition-colors ${form.occasions.includes(o) ? "bg-rose-600 border-rose-600 text-white" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white"}`}>{o}</button>
              ))}
            </div>
          </div>
        </Section>

        {/* Flags */}
        <Section title="Tuỳ chọn">
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 rounded accent-rose-500" /><span className="text-sm text-zinc-300">Hiển thị</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_featured} onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))} className="w-4 h-4 rounded accent-rose-500" /><span className="text-sm text-zinc-300">Nổi bật</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_best_seller} onChange={(e) => setForm((f) => ({ ...f, is_best_seller: e.target.checked }))} className="w-4 h-4 rounded accent-rose-500" /><span className="text-sm text-zinc-300">Bán chạy</span></label>
          </div>
        </Section>

        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">{error}</div>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="flex items-center gap-1.5 px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"><Check className="w-3.5 h-3.5" />{saving ? "Đang lưu..." : creating ? "Tạo sản phẩm" : "Lưu thay đổi"}</button>
          <Link href="/admin/products" className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg transition-colors">Huỷ</Link>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"><h2 className="text-sm font-semibold text-white mb-3">{title}</h2>{children}</div>;
}

const iCls = "w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-rose-500/50 transition-all";
