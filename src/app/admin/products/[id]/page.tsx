"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import pb from "@/services/pocketbase";
import { formatPrice } from "@/lib/utils";
import { ChevronLeft, Upload, ImageIcon, Plus, X, Check } from "lucide-react";
import { getThumbUrl, getImageUrl } from "@/lib/media";
import RichEditor from "@/components/ui/rich-editor";
import { useToast } from "@/components/ui/toast";
import type { Product, Category } from "@/schema";

const OCCASIONS = ["Sinh nhật", "Khai trương", "Tốt nghiệp", "Tình yêu", "Chia buồn", "Sự kiện", "Chúc mừng", "Valentine", "8/3", "20/10", "20/11"];

export default function AdminProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const creating = id === "new";

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: "", price: "", sale_price: "", short_description: "", description: "",
    is_featured: false, is_best_seller: false, is_active: true,
    categories: [] as string[], occasions: [] as string[],
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<{ filename: string; url: string }[]>([]);
  const [removedImageFilenames, setRemovedImageFilenames] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { addToast } = useToast();

  useEffect(() => {
    pb.collection("categories").getFullList<Category>({ sort: "sort_order" }).then(setCategories);
  }, []);

  useEffect(() => {
    if (creating) return;
    pb.collection("products").getOne<Product>(id).then((p) => {
      setForm({
        name: p.name, price: String(p.price),
        sale_price: p.sale_price ? String(p.sale_price) : "",
        short_description: p.short_description || "", description: p.description || "",
        is_featured: p.is_featured, is_best_seller: p.is_best_seller, is_active: p.is_active,
        categories: p.categories || [], occasions: p.occasions || [],
      });
      if (p.thumbnail) setThumbnailPreview(getThumbUrl(p.collectionId, p.id, p.thumbnail, "400x400"));
      if (Array.isArray(p.images))
        setExistingImages(p.images.map((img: string) => ({ filename: img, url: getImageUrl(p.collectionId, p.id, img, 300) })));
    }).catch(() => setError("Không tìm thấy sản phẩm."));
  }, [id, creating]);

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Vui lòng điền tên sản phẩm."); return; }
    if (!form.price || Number(form.price) <= 0) { setError("Giá gốc phải lớn hơn 0."); return; }
    if (form.sale_price && Number(form.sale_price) >= Number(form.price)) { setError("Giá sale phải nhỏ hơn giá gốc."); return; }

    const slug = generateSlug(form.name);
    if (!slug) { setError("Tên sản phẩm không hợp lệ để tạo slug."); return; }

    if (!pb.authStore.isValid) { setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."); return; }
    setSaving(true); setError("");
    try {
      const data = new FormData();
      data.append("name", form.name); data.append("slug", slug); data.append("price", form.price);
      if (form.sale_price) data.append("sale_price", form.sale_price);
      data.append("short_description", form.short_description); data.append("description", form.description);
      data.append("is_featured", String(form.is_featured)); data.append("is_best_seller", String(form.is_best_seller));
      data.append("is_active", String(form.is_active));
      form.occasions.forEach((o) => data.append("occasions", o));
      form.categories.forEach((c) => data.append("categories", c));
      if (thumbnailFile) data.append("thumbnail", thumbnailFile);
      galleryFiles.forEach((f) => data.append("images", f));
      removedImageFilenames.forEach((fn) => data.append("images-", fn));
      if (creating) await pb.collection("products").create(data);
      else await pb.collection("products").update(id, data);
      addToast(creating ? "Đã thêm sản phẩm thành công!" : "Đã cập nhật sản phẩm!", "success");
      router.push("/admin/products");
    } catch (err: unknown) {
      const pbErr = err as { data?: { data?: Record<string, { message: string }> }; message?: string };
      const fieldErrors = pbErr?.data?.data;
      if (fieldErrors && Object.keys(fieldErrors).length > 0) {
        const msgs = Object.entries(fieldErrors).map(([k, v]) => `${k}: ${v.message}`).join(" | ");
        setError(msgs);
        addToast(msgs, "error");
      } else {
        const msg = pbErr?.message || "Có lỗi xảy ra, vui lòng thử lại.";
        setError(msg);
        addToast(msg, "error");
      }
    }
    finally { setSaving(false); }
  }

  const totalGallery = existingImages.length + galleryPreviews.length;

  return (
    <div className="max-w-6xl">
      <div className="flex items-center gap-3 mb-5">
        <Link href="/admin/products" className="text-zinc-400 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-white">
          {creating ? "Thêm sản phẩm mới" : "Chỉnh sửa sản phẩm"}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">

          {/* ── LEFT: content ── */}
          <div className="space-y-4">

            {/* Basic info */}
            <Section title="Thông tin cơ bản">
              <div className="space-y-3">
                <div>
                  <label className={lCls}>Tên sản phẩm *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="VD: Bó hoa hồng đỏ 20 bông"
                    className={iCls}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lCls}>Giá gốc *</label>
                    <input
                      type="number" min="0" step="1000"
                      value={form.price}
                      onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                      placeholder="350000"
                      className={iCls + noSpinner}
                    />
                    {form.price && <p className="text-[10px] text-zinc-500 mt-1">{formatPrice(Number(form.price))}</p>}
                  </div>
                  <div>
                    <label className={lCls}>Giá sale</label>
                    <input
                      type="number" min="0" step="1000"
                      value={form.sale_price}
                      onChange={(e) => setForm((f) => ({ ...f, sale_price: e.target.value }))}
                      placeholder="Để trống nếu không sale"
                      className={iCls + noSpinner}
                    />
                    {form.sale_price && Number(form.sale_price) >= Number(form.price) && (
                      <p className="text-[10px] text-red-400 mt-1">Phải nhỏ hơn giá gốc</p>
                    )}
                    {form.sale_price && Number(form.sale_price) < Number(form.price) && (
                      <p className="text-[10px] text-zinc-500 mt-1">{formatPrice(Number(form.sale_price))}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className={lCls}>Mô tả ngắn <span className="text-zinc-600">(hiển thị trên thẻ sản phẩm)</span></label>
                  <textarea
                    value={form.short_description}
                    onChange={(e) => setForm((f) => ({ ...f, short_description: e.target.value }))}
                    placeholder="Mô tả 1-2 câu ngắn gọn về sản phẩm..."
                    className={iCls}
                    rows={2}
                  />
                </div>
              </div>
            </Section>

            {/* Rich editor — full width, no height cap */}
            <Section title="Mô tả chi tiết">
              <RichEditor
                value={form.description}
                onChange={(html) => setForm((f) => ({ ...f, description: html }))}
              />
            </Section>

            {/* Categories + Occasions */}
            <Section title="Phân loại">
              <div className="space-y-4">
                <div>
                  <label className={lCls}>Danh mục</label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {categories.map((c) => (
                      <button
                        key={c.id} type="button"
                        onClick={() => setForm((f) => ({
                          ...f,
                          categories: f.categories.includes(c.id)
                            ? f.categories.filter((x) => x !== c.id)
                            : [...f.categories, c.id],
                        }))}
                        className={tag(form.categories.includes(c.id))}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={lCls}>Dịp tặng</label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {OCCASIONS.map((o) => (
                      <button
                        key={o} type="button"
                        onClick={() => setForm((f) => ({
                          ...f,
                          occasions: f.occasions.includes(o)
                            ? f.occasions.filter((x) => x !== o)
                            : [...f.occasions, o],
                        }))}
                        className={tag(form.occasions.includes(o))}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* ── RIGHT: sidebar ── */}
          <div className="space-y-4 lg:sticky lg:top-4">

            {/* Thumbnail — large click-to-upload */}
            <Section title="Ảnh đại diện">
              <label className="block cursor-pointer group">
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-800 border-2 border-dashed border-zinc-700 group-hover:border-rose-500/60 transition-colors">
                  {thumbnailPreview ? (
                    <>
                      <Image src={thumbnailPreview} alt="" fill className="object-cover" sizes="300px" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                        <Upload className="w-6 h-6 text-white" />
                        <span className="text-white text-xs font-medium">Thay ảnh</span>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-500">
                      <ImageIcon className="w-10 h-10" />
                      <span className="text-xs">Click để chọn ảnh</span>
                    </div>
                  )}
                </div>
                <input
                  type="file" accept="image/*" className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) { setThumbnailFile(f); setThumbnailPreview(URL.createObjectURL(f)); }
                  }}
                />
              </label>
            </Section>

            {/* Gallery */}
            <Section title={`Gallery (${totalGallery}/4)`}>
              <div className="grid grid-cols-2 gap-2">
                {existingImages.map((img, i) => (
                  <div key={`e-${i}`} className="relative aspect-square rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700 group">
                    <Image src={img.url} alt="" fill className="object-cover" sizes="140px" />
                    <button
                      type="button"
                      onClick={() => {
                        setRemovedImageFilenames((p) => [...p, img.filename]);
                        setExistingImages((prev) => prev.filter((_, j) => j !== i));
                      }}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {galleryPreviews.map((src, i) => (
                  <div key={`n-${i}`} className="relative aspect-square rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700 group">
                    <Image src={src} alt="" fill className="object-cover" sizes="140px" />
                    <button
                      type="button"
                      onClick={() => {
                        setGalleryFiles((p) => p.filter((_, j) => j !== i));
                        setGalleryPreviews((p) => p.filter((_, j) => j !== i));
                      }}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {totalGallery < 4 && (
                  <label className="aspect-square rounded-lg bg-zinc-800 border-2 border-dashed border-zinc-700 hover:border-rose-500/60 flex items-center justify-center cursor-pointer transition-colors">
                    <div className="flex flex-col items-center gap-1 text-zinc-500">
                      <Plus className="w-5 h-5" />
                      <span className="text-[10px]">Thêm ảnh</span>
                    </div>
                    <input
                      type="file" accept="image/*" multiple className="hidden"
                      onChange={(e) => {
                        const slots = 4 - totalGallery;
                        const files = Array.from(e.target.files || []).slice(0, slots);
                        setGalleryFiles((p) => [...p, ...files]);
                        setGalleryPreviews((p) => [...p, ...files.map((f) => URL.createObjectURL(f))]);
                      }}
                    />
                  </label>
                )}
              </div>
            </Section>

            {/* Options */}
            <Section title="Tuỳ chọn">
              <div className="space-y-2.5">
                <Toggle
                  label="Hiển thị"
                  desc="Sản phẩm xuất hiện ngoài cửa hàng"
                  checked={form.is_active}
                  onChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
                />
                <Toggle
                  label="Nổi bật"
                  desc="Hiển thị trong mục sản phẩm nổi bật"
                  checked={form.is_featured}
                  onChange={(v) => setForm((f) => ({ ...f, is_featured: v }))}
                />
                <Toggle
                  label="Bán chạy"
                  desc="Hiển thị nhãn best seller"
                  checked={form.is_best_seller}
                  onChange={(v) => setForm((f) => ({ ...f, is_best_seller: v }))}
                />
              </div>
            </Section>

            {/* Save */}
            <div className="flex gap-2">
              <button
                type="submit" disabled={saving}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
              >
                <Check className="w-3.5 h-3.5" />
                {saving ? "Đang lưu..." : creating ? "Tạo sản phẩm" : "Lưu thay đổi"}
              </button>
              <Link
                href="/admin/products"
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg transition-colors"
              >
                Huỷ
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function Toggle({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="w-full flex items-center justify-between gap-3 group text-left">
      <div>
        <p className="text-sm text-zinc-300 group-hover:text-white transition-colors">{label}</p>
        <p className="text-[10px] text-zinc-600">{desc}</p>
      </div>
      <div className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${checked ? "bg-rose-600" : "bg-zinc-700"}`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${checked ? "left-[18px]" : "left-0.5"}`} />
      </div>
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">{title}</h2>
      {children}
    </div>
  );
}

const tag = (active: boolean) =>
  `px-2.5 py-1 text-[11px] rounded-md border transition-colors ${active ? "bg-rose-600 border-rose-600 text-white" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white"}`;

const lCls = "text-[11px] text-zinc-500 mb-1.5 block";
const iCls = "w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-rose-500/60 transition-all";
const noSpinner = " [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";
