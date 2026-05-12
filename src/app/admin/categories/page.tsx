"use client";

import { useState, useEffect } from "react";
import pb from "@/services/pocketbase";
import { Plus, Pencil, Trash2, Check, GripVertical, ChevronRight } from "lucide-react";
import { revalidatePage } from "@/lib/revalidate";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Category } from "@/schema";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", is_active: true, parent: "" });
  const [saving, setSaving] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  useEffect(() => {
    pb.collection("categories").getFullList<Category>({ sort: "sort_order,name" }).then((list) => setCategories(list));
  }, []);

  async function refresh() {
    const list = await pb.collection("categories").getFullList<Category>({ sort: "sort_order,name" });
    setCategories(list);
  }

  function openCreate() { setForm({ name: "", is_active: true, parent: "" }); setEditing(null); setDialogOpen(true); }

  function generateSlug(name: string) {
    return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
  }

  function openEdit(cat: Category) {
    setForm({ name: cat.name, is_active: cat.is_active, parent: cat.parent || "" });
    setEditing(cat); setDialogOpen(true);
  }

  function closeDialog() { setDialogOpen(false); setEditing(null); }

  async function saveForm() {
    if (!form.name) return;
    const slug = generateSlug(form.name);
    setSaving(true);
    try {
      let sort_order = editing ? editing.sort_order : 0;
      if (!editing && categories) {
        const siblings = categories.filter((c) => c.parent === (form.parent || ""));
        sort_order = siblings.length > 0 ? Math.max(...siblings.map((s) => s.sort_order)) + 1 : 0;
      }
      const payload = { name: form.name, slug, sort_order, is_active: form.is_active, parent: form.parent || "" };
      if (editing) {
        await pb.collection("categories").update(editing.id, payload);
      } else {
        await pb.collection("categories").create(payload);
      }
      closeDialog();
      await refresh();
      revalidatePage().catch(console.error);
    } catch (e) { console.error("Save failed:", e); }
    finally { setSaving(false); }
  }

  async function toggleActive(cat: Category) {
    try {
      await pb.collection("categories").update(cat.id, { is_active: !cat.is_active });
      setCategories((prev) => prev?.map((c) => c.id === cat.id ? { ...c, is_active: !cat.is_active } : c) ?? prev);
      revalidatePage().catch(console.error);
    } catch (e) { console.error("Toggle failed:", e); }
  }

  async function deleteCategory() {
    if (!deleteId) return;
    try { await pb.collection("categories").delete(deleteId); setDeleteId(null); await refresh(); revalidatePage(); }
    catch (e) { console.error("Delete failed:", e); setDeleteId(null); }
  }

  async function reorder(draggedId: string, targetId: string) {
    if (!categories || draggedId === targetId) return;
    const dragged = categories.find((c) => c.id === draggedId);
    const target = categories.find((c) => c.id === targetId);
    if (!dragged || !target) return;

    if (dragged.parent !== target.parent) {
      try {
        await pb.collection("categories").update(draggedId, { parent: target.parent });
        setCategories((prev) => prev?.map((c) => c.id === draggedId ? { ...c, parent: target.parent } : c) ?? prev);
        revalidatePage().catch(console.error);
      } catch (e) { console.error("Move parent failed:", e); }
      return;
    }

    const siblings = categories.filter((c) => c.parent === target.parent).sort((a, b) => a.sort_order - b.sort_order);
    const fromIdx = siblings.findIndex((c) => c.id === draggedId);
    const toIdx = siblings.findIndex((c) => c.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;

    const reordered = [...siblings];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);

    try {
      const updates = reordered.map((c, i) => pb.collection("categories").update(c.id, { sort_order: i }));
      await Promise.all(updates);
      setCategories((prev) => prev?.map((c) => { const idx = reordered.findIndex((r) => r.id === c.id); return idx !== -1 ? { ...c, sort_order: idx } : c; }) ?? prev);
      revalidatePage().catch(console.error);
    } catch (e) { console.error("Reorder failed:", e); }
  }

  function buildParentTree(): { id: string; label: string }[] {
    if (!categories) return [];
    const exclude = new Set<string>();
    if (editing) {
      exclude.add(editing.id);
      for (const c of categories) if (c.parent === editing.id) exclude.add(c.id);
    }
    return categories
      .filter((c) => !c.parent && !exclude.has(c.id))
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((c) => ({ id: c.id, label: c.name }));
  }

  function handleDragStart(e: React.DragEvent, id: string) { setDragId(id); e.dataTransfer.effectAllowed = "move"; }
  function handleDragOver(e: React.DragEvent, id: string) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; if (dragId !== id) setDropTarget(id); }
  function handleDragLeave() { setDropTarget(null); }
  function handleDrop(e: React.DragEvent, id: string) { e.preventDefault(); setDropTarget(null); if (dragId) { reorder(dragId, id); setDragId(null); } }
  function handleDragEnd() { setDragId(null); setDropTarget(null); }

  const rootCats = (categories ?? []).filter((c) => !c.parent).sort((a, b) => a.sort_order - b.sort_order);
  const getChildren = (pid: string) => (categories ?? []).filter((c) => c.parent === pid).sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-white">Danh mục</h1><p className="text-zinc-400 text-sm">{categories?.length ?? 0} danh mục</p></div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium rounded-lg transition-colors"><Plus className="w-4 h-4" /> Thêm mới</button>
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md bg-zinc-950 border border-zinc-800 text-white p-0 gap-0">
          <div className="px-5 py-4 border-b border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-white text-sm">{editing ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-[11px] text-zinc-500 mb-1.5 block">Tên *</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={iCls} placeholder="Hoa Sinh Nhật" />
              </div>
              <div className="col-span-2">
                <label className="text-[11px] text-zinc-500 mb-1.5 block">Danh mục cha</label>
                <select value={form.parent} onChange={(e) => setForm((f) => ({ ...f, parent: e.target.value }))} className={iCls}>
                  <option value="">— Gốc —</option>
                  {buildParentTree().map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 rounded accent-rose-500" />
              <span className="text-sm text-zinc-300">Hiển thị</span>
            </label>
          </div>
          <div className="flex gap-2 justify-end px-5 py-3 border-t border-zinc-800 bg-zinc-900/50">
            <button onClick={closeDialog} className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors">Huỷ</button>
            <button onClick={saveForm} disabled={saving} className="flex items-center gap-1.5 px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-60"><Check className="w-3.5 h-3.5" /> {saving ? "Đang lưu..." : "Lưu"}</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm bg-zinc-950 border border-zinc-800 text-white p-0 gap-0">
          <div className="p-5">
            <DialogHeader>
              <DialogTitle className="text-white text-sm">Xoá danh mục</DialogTitle>
            </DialogHeader>
            <p className="text-zinc-400 text-sm mt-2">Danh mục này sẽ bị xoá vĩnh viễn. Bạn có chắc không?</p>
          </div>
          <div className="flex gap-2 justify-end px-5 py-3 border-t border-zinc-800 bg-zinc-900/50">
            <button onClick={() => setDeleteId(null)} className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors">Huỷ</button>
            <button onClick={deleteCategory} className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded-lg transition-colors">Xoá</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tree list */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {categories === null ? (
          <div className="py-10 text-center text-zinc-500 text-sm">Đang tải...</div>
        ) : categories.length === 0 ? (
          <div className="py-10 text-center text-zinc-500 text-sm">Chưa có danh mục nào</div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {rootCats.map((cat) => (
              <CategoryRow key={cat.id} cat={cat} depth={0} getChildren={getChildren}
                dragId={dragId} dropTarget={dropTarget}
                onEdit={openEdit} onToggle={toggleActive} onDelete={setDeleteId}
                onDragStart={handleDragStart} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onDragEnd={handleDragEnd} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryRow({ cat, depth, getChildren, dragId, dropTarget, onEdit, onToggle, onDelete, onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd }: {
  cat: Category; depth: number; getChildren: (pid: string) => Category[];
  dragId: string | null; dropTarget: string | null;
  onEdit: (c: Category) => void; onToggle: (c: Category) => void; onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDragLeave: () => void; onDrop: (e: React.DragEvent, id: string) => void; onDragEnd: () => void;
}) {
  const children = getChildren(cat.id);
  const isOver = dropTarget === cat.id;
  return (
    <>
      <div draggable onDragStart={(e) => onDragStart(e, cat.id)} onDragOver={(e) => onDragOver(e, cat.id)} onDragLeave={onDragLeave} onDrop={(e) => onDrop(e, cat.id)} onDragEnd={onDragEnd}
        style={{ paddingLeft: 12 + depth * 24 }}
        className={`flex items-center gap-3 pr-5 py-3 transition-colors cursor-default ${isOver ? "bg-rose-500/10" : "hover:bg-zinc-800/30"} ${dragId === cat.id ? "opacity-50" : ""}`}>
        <span className="text-zinc-600 cursor-grab active:cursor-grabbing shrink-0"><GripVertical className="w-4 h-4" /></span>
        {depth > 0 && <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0 -ml-1" />}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white font-medium">{!cat.is_active && <span className="text-zinc-500 mr-1.5">[Ẩn]</span>}{cat.name}</p>
          <p className="text-xs text-zinc-500">/{cat.slug}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => onToggle(cat)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
              cat.is_active
                ? "bg-green-500/15 text-green-400 hover:bg-green-500/25 border border-green-500/30"
                : "bg-zinc-800 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-700 border border-zinc-700"
            }`}>
            {cat.is_active ? "Hiển thị" : "Ẩn"}
          </button>
          <button onClick={() => onEdit(cat)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-zinc-400 bg-zinc-800 hover:text-white hover:bg-zinc-700 border border-zinc-700 transition-colors">
            <Pencil className="w-3 h-3" /> Sửa
          </button>
          <button onClick={() => onDelete(cat.id)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-zinc-400 bg-zinc-800 hover:text-red-400 hover:bg-red-400/10 border border-zinc-700 hover:border-red-500/30 transition-colors">
            <Trash2 className="w-3 h-3" /> Xoá
          </button>
        </div>
      </div>
      {children.map((child) => (
        <CategoryRow key={child.id} cat={child} depth={depth + 1} getChildren={getChildren}
          dragId={dragId} dropTarget={dropTarget}
          onEdit={onEdit} onToggle={onToggle} onDelete={onDelete}
          onDragStart={onDragStart} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} onDragEnd={onDragEnd} />
      ))}
    </>
  );
}

const iCls = "w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-rose-500/50 focus:border transition-all";
