"use client";

import { useState, useEffect } from "react";
import pb from "@/lib/pocketbase";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X, Check } from "lucide-react";
import type { Category } from "@/lib/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", sort_order: "0", is_active: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    pb.collection("categories").getFullList<Category>({ sort: "sort_order,name" })
      .then(setCategories);
  }, []);

  function generateSlug(name: string) {
    return name.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d").replace(/[^a-z0-9\s-]/g, "")
      .trim().replace(/\s+/g, "-");
  }

  function startCreate() {
    setForm({ name: "", slug: "", sort_order: "0", is_active: true });
    setEditing(null);
    setCreating(true);
  }

  function startEdit(cat: Category) {
    setForm({ name: cat.name, slug: cat.slug, sort_order: String(cat.sort_order), is_active: cat.is_active });
    setEditing(cat);
    setCreating(false);
  }

  function cancelForm() {
    setCreating(false);
    setEditing(null);
  }

  async function saveForm() {
    if (!form.name || !form.slug) return;
    setSaving(true);
    try {
      const payload = { name: form.name, slug: form.slug, sort_order: Number(form.sort_order), is_active: form.is_active };
      if (editing) {
        const updated = await pb.collection("categories").update<Category>(editing.id, payload);
        setCategories((prev) => prev?.map((c) => c.id === editing.id ? updated : c) ?? prev);
      } else {
        const created = await pb.collection("categories").create<Category>(payload);
        setCategories((prev) => [...(prev ?? []), created]);
      }
      cancelForm();
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(cat: Category) {
    const updated = await pb.collection("categories").update<Category>(cat.id, { is_active: !cat.is_active });
    setCategories((prev) => prev?.map((c) => c.id === cat.id ? updated : c) ?? prev);
  }

  async function deleteCategory(id: string) {
    if (!confirm("Xoá danh mục này?")) return;
    await pb.collection("categories").delete(id);
    setCategories((prev) => prev?.filter((c) => c.id !== id) ?? prev);
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Danh mục</h1>
          <p className="text-zinc-400 text-sm">{categories?.length ?? 0} danh mục</p>
        </div>
        <button onClick={startCreate}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Thêm mới
        </button>
      </div>

      {/* Inline form */}
      {(creating || editing) && (
        <div className="bg-zinc-900 border border-rose-500/30 rounded-xl p-4 space-y-3">
          <p className="text-xs font-medium text-rose-400 uppercase tracking-wide">
            {creating ? "Tạo danh mục mới" : `Chỉnh sửa: ${editing?.name}`}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Tên *</label>
              <input value={form.name} onChange={(e) => {
                setForm((f) => ({ ...f, name: e.target.value, slug: creating ? generateSlug(e.target.value) : f.slug }));
              }} className={iCls} placeholder="Hoa Sinh Nhật" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Slug *</label>
              <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className={iCls} placeholder="hoa-sinh-nhat" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Thứ tự</label>
              <input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))} className={iCls} />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-rose-500" />
                <span className="text-sm text-zinc-300">Hiển thị</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={saveForm} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm rounded-lg transition-colors disabled:opacity-60">
              <Check className="w-3.5 h-3.5" /> {saving ? "Đang lưu..." : "Lưu"}
            </button>
            <button onClick={cancelForm} className="flex items-center gap-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg transition-colors">
              <X className="w-3.5 h-3.5" /> Huỷ
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {categories === null ? (
          <div className="py-10 text-center text-zinc-500 text-sm">Đang tải...</div>
        ) : categories.length === 0 ? (
          <div className="py-10 text-center text-zinc-500 text-sm">Chưa có danh mục nào</div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-3 px-5 py-3">
                <span className="text-xs text-zinc-600 w-5 text-right shrink-0">{cat.sort_order}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium">{cat.name}</p>
                  <p className="text-xs text-zinc-500">{cat.slug}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => toggleActive(cat)} title={cat.is_active ? "Đang hiển thị" : "Đang ẩn"}
                    className={`p-1.5 rounded-lg transition-colors ${cat.is_active ? "text-green-400 hover:bg-green-400/10" : "text-zinc-500 hover:bg-zinc-700"}`}>
                    {cat.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button onClick={() => startEdit(cat)} className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteCategory(cat.id)} className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const iCls = "w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 transition-all";
