import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, lazy, Suspense } from "react";
import { ChevronLeft, Upload, ImageIcon, Plus, X, Check } from "lucide-react";
const RichEditor = lazy(() => import("@/components/ui/rich-editor"));
import { useProduct, useSaveProduct } from "@/features/products/api";
import { useCategories } from "@/features/categories/api";
import { useToast } from "@/lib/toast";
import { formatPrice, generateSlug } from "@/lib/utils";
import { getThumbUrl, getImageUrl } from "@/lib/media";

export const Route = createFileRoute("/_auth/products/$id")({
  component: ProductFormPage,
});

const OCCASIONS = ["Sinh nhật", "Khai trương", "Tốt nghiệp", "Tình yêu", "Chia buồn", "Sự kiện", "Chúc mừng", "Valentine", "8/3", "20/10", "20/11"];

const iCls = "w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-rose-500/60 transition-all";
const lCls = "text-[11px] text-stone-500 mb-1.5 block";
const noSpinner = " [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";
const tagCls = (active: boolean) =>
  `px-2.5 py-1 text-[11px] rounded-md border transition-colors ${active ? "bg-rose-600 border-rose-600 text-white" : "bg-stone-800 border-stone-700 text-stone-400 hover:text-white"}`;

function ProductFormPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const creating = id === "new";

  const { data: product } = useProduct(id);
  const { data: categories = [] } = useCategories();
  const saveProduct = useSaveProduct();

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
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!product) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm({
      name: product.name, price: String(product.price),
      sale_price: product.sale_price ? String(product.sale_price) : "",
      short_description: product.short_description || "",
      description: product.description || "",
      is_featured: product.is_featured, is_best_seller: product.is_best_seller,
      is_active: product.is_active,
      categories: product.categories || [], occasions: product.occasions || [],
    });
    if (product.thumbnail) setThumbnailPreview(getThumbUrl(product.collectionId, product.id, product.thumbnail));
    if (Array.isArray(product.images)) {
      setExistingImages(product.images.map((img: string) => ({
        filename: img,
        url: getImageUrl(product.collectionId, product.id, img),
      })));
    }
  }, [product]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Vui lòng điền tên sản phẩm."); return; }
    if (!form.price || Number(form.price) <= 0) { setError("Giá gốc phải lớn hơn 0."); return; }
    if (form.sale_price && Number(form.sale_price) >= Number(form.price)) { setError("Giá sale phải nhỏ hơn giá gốc."); return; }

    const slug = creating ? generateSlug(form.name) : (product?.slug || generateSlug(form.name));
    if (!slug) { setError("Tên sản phẩm không hợp lệ."); return; }

    setError("");
    const data = new FormData();
    data.append("name", form.name);
    data.append("slug", slug);
    data.append("price", form.price);
    data.append("sale_price", form.sale_price || "0");
    data.append("short_description", form.short_description);
    data.append("description", form.description);
    data.append("is_featured", String(form.is_featured));
    data.append("is_best_seller", String(form.is_best_seller));
    data.append("is_active", String(form.is_active));
    form.occasions.forEach((o) => data.append("occasions", o));
    form.categories.forEach((c) => data.append("categories", c));
    if (thumbnailFile) data.append("thumbnail", thumbnailFile);
    galleryFiles.forEach((f) => data.append("images", f));
    removedImages.forEach((fn) => data.append("images-", fn));

    saveProduct.mutate({ id, data }, {
      onSuccess: () => {
        addToast(creating ? "Đã thêm sản phẩm!" : "Đã lưu thay đổi!", "success");
        navigate({ to: "/products" });
      },
      onError: (err: unknown) => {
        const msg = (err as { message?: string })?.message || "Có lỗi xảy ra.";
        setError(msg);
        addToast(msg, "error");
      },
    });
  }

  const totalGallery = existingImages.length + galleryPreviews.length;

  return (
    <div className="max-w-6xl">
      <div className="flex items-center gap-3 mb-5">
        <Link to="/products" className="text-stone-400 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-white">{creating ? "Thêm sản phẩm mới" : "Chỉnh sửa sản phẩm"}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">

          {/* LEFT */}
          <div className="space-y-4">
            <Section title="Thông tin cơ bản">
              <div className="space-y-3">
                <div>
                  <label className={lCls}>Tên sản phẩm *</label>
                  <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="VD: Bó hoa hồng đỏ 20 bông" className={iCls} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lCls}>Giá gốc *</label>
                    <input type="number" min="0" step="1000" value={form.price}
                      onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                      placeholder="350000" className={iCls + noSpinner} />
                    {form.price && <p className="text-[10px] text-stone-500 mt-1">{formatPrice(Number(form.price))}</p>}
                  </div>
                  <div>
                    <label className={lCls}>Giá sale</label>
                    <input type="number" min="0" step="1000" value={form.sale_price}
                      onChange={(e) => setForm((f) => ({ ...f, sale_price: e.target.value }))}
                      placeholder="Để trống nếu không sale" className={iCls + noSpinner} />
                    {form.sale_price && Number(form.sale_price) >= Number(form.price) && (
                      <p className="text-[10px] text-red-400 mt-1">Phải nhỏ hơn giá gốc</p>
                    )}
                    {form.sale_price && Number(form.sale_price) < Number(form.price) && (
                      <p className="text-[10px] text-stone-500 mt-1">{formatPrice(Number(form.sale_price))}</p>
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={lCls.replace("mb-1.5", "")}>Mô tả ngắn <span className="text-stone-600">(hiển thị trên thẻ sản phẩm)</span></label>
                    <span className={`text-[10px] tabular-nums ${form.short_description.length > 120 ? "text-amber-400" : "text-stone-600"}`}>
                      {form.short_description.length}/150
                    </span>
                  </div>
                  <textarea value={form.short_description}
                    onChange={(e) => setForm((f) => ({ ...f, short_description: e.target.value.slice(0, 150) }))}
                    placeholder="Mô tả 1-2 câu ngắn gọn..." className={iCls} rows={2} />
                </div>
              </div>
            </Section>

            <Section title="Mô tả chi tiết">
              <Suspense fallback={<div className="h-48 rounded-lg bg-stone-800 animate-pulse" />}>
                <RichEditor
                  value={form.description}
                  onChange={(html) => setForm((f) => ({ ...f, description: html }))}
                />
              </Suspense>
            </Section>

            <Section title="Phân loại">
              <div className="space-y-4">
                <div>
                  <label className={lCls}>Danh mục</label>
                  <div className="mt-1 space-y-2">
                    {categories
                      .filter((c) => !c.parent)
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map((parent) => {
                        const children = categories.filter((c) => c.parent === parent.id).sort((a, b) => a.sort_order - b.sort_order);
                        const toggleCat = (id: string) => setForm((f) => ({
                          ...f,
                          categories: f.categories.includes(id)
                            ? f.categories.filter((x) => x !== id)
                            : [...f.categories, id],
                        }));
                        return (
                          <div key={parent.id}>
                            <button type="button" onClick={() => toggleCat(parent.id)} className={tagCls(form.categories.includes(parent.id))}>
                              {parent.name}
                            </button>
                            {children.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-1.5 ml-3 pl-2 border-l border-stone-700">
                                {children.map((child) => (
                                  <button key={child.id} type="button" onClick={() => toggleCat(child.id)} className={tagCls(form.categories.includes(child.id))}>
                                    {child.name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
                <div>
                  <label className={lCls}>Dịp tặng</label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {OCCASIONS.map((o) => (
                      <button key={o} type="button"
                        onClick={() => setForm((f) => ({
                          ...f,
                          occasions: f.occasions.includes(o)
                            ? f.occasions.filter((x) => x !== o)
                            : [...f.occasions, o],
                        }))}
                        className={tagCls(form.occasions.includes(o))}>
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">{error}</div>
            )}
          </div>

          {/* RIGHT */}
          <div className="space-y-4 lg:sticky lg:top-4">
            <Section title="Ảnh đại diện">
              <label className="block cursor-pointer group">
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-stone-800 border-2 border-dashed border-stone-700 group-hover:border-rose-500/60 transition-colors">
                  {thumbnailPreview ? (
                    <>
                      <img src={thumbnailPreview} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                        <Upload className="w-6 h-6 text-white" />
                        <span className="text-white text-xs font-medium">Thay ảnh</span>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-stone-500">
                      <ImageIcon className="w-10 h-10" />
                      <span className="text-xs">Click để chọn ảnh</span>
                    </div>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) { setThumbnailFile(f); setThumbnailPreview(URL.createObjectURL(f)); }
                  }} />
              </label>
            </Section>

            <Section title={`Gallery (${totalGallery}/4)`}>
              <div className="grid grid-cols-2 gap-2">
                {existingImages.map((img, i) => (
                  <div key={`e-${i}`} className="relative aspect-square rounded-lg overflow-hidden bg-stone-800 border border-stone-700 group">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    <button type="button"
                      onClick={() => { setRemovedImages((p) => [...p, img.filename]); setExistingImages((p) => p.filter((_, j) => j !== i)); }}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {galleryPreviews.map((src, i) => (
                  <div key={`n-${i}`} className="relative aspect-square rounded-lg overflow-hidden bg-stone-800 border border-stone-700 group">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button type="button"
                      onClick={() => { setGalleryFiles((p) => p.filter((_, j) => j !== i)); setGalleryPreviews((p) => p.filter((_, j) => j !== i)); }}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {totalGallery < 4 && (
                  <label className="aspect-square rounded-lg bg-stone-800 border-2 border-dashed border-stone-700 hover:border-rose-500/60 flex items-center justify-center cursor-pointer transition-colors">
                    <div className="flex flex-col items-center gap-1 text-stone-500">
                      <Plus className="w-5 h-5" />
                      <span className="text-[10px]">Thêm ảnh</span>
                    </div>
                    <input type="file" accept="image/*" multiple className="hidden"
                      onChange={(e) => {
                        const slots = 4 - totalGallery;
                        const files = Array.from(e.target.files || []).slice(0, slots);
                        setGalleryFiles((p) => [...p, ...files]);
                        setGalleryPreviews((p) => [...p, ...files.map((f) => URL.createObjectURL(f))]);
                      }} />
                  </label>
                )}
              </div>
            </Section>

            <Section title="Tuỳ chọn">
              <div className="space-y-2.5">
                <Toggle label="Hiển thị" desc="Sản phẩm xuất hiện ngoài cửa hàng"
                  checked={form.is_active} onChange={(v) => setForm((f) => ({ ...f, is_active: v }))} />
                <Toggle label="Nổi bật" desc="Hiển thị trong mục sản phẩm nổi bật"
                  checked={form.is_featured} onChange={(v) => setForm((f) => ({ ...f, is_featured: v }))} />
                <Toggle label="Bán chạy" desc="Hiển thị nhãn best seller"
                  checked={form.is_best_seller} onChange={(v) => setForm((f) => ({ ...f, is_best_seller: v }))} />
              </div>
            </Section>

            <div className="flex gap-2">
              <button type="submit" disabled={saveProduct.isPending}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60">
                <Check className="w-3.5 h-3.5" />
                {saveProduct.isPending ? "Đang lưu..." : creating ? "Tạo sản phẩm" : "Lưu thay đổi"}
              </button>
              <Link to="/products" className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm rounded-lg transition-colors">
                Huỷ
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
      <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Toggle({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="w-full flex items-center justify-between gap-3 group text-left">
      <div>
        <p className="text-sm text-stone-300 group-hover:text-white transition-colors">{label}</p>
        <p className="text-[10px] text-stone-600">{desc}</p>
      </div>
      <div className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${checked ? "bg-rose-600" : "bg-stone-700"}`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${checked ? "left-[18px]" : "left-0.5"}`} />
      </div>
    </button>
  );
}
