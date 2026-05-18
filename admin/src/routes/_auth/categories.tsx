import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth";
import { useState, useMemo, useRef } from "react";
import { Plus, Pencil, Trash2, Check, GripVertical, ChevronRight, ImageIcon, X } from "lucide-react";
import { getThumbUrl } from "@/lib/media";
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, DragOverlay,
  type DragEndEvent, type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  useCategories, useSaveCategory, useToggleCategoryActive,
  useDeleteCategory, useReorderCategories,
} from "@/features/categories/api";
import { generateSlug } from "@/lib/utils";
import type { Category } from "@/schema/pocketbase";

export const Route = createFileRoute("/_auth/categories")({
  beforeLoad: () => {
    if (useAuthStore.getState().role !== "owner") throw redirect({ to: "/" });
  },
  component: CategoriesPage,
});

const iCls = "w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-rose-500/50 transition-all";

function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const saveCategory = useSaveCategory();
  const toggleActive = useToggleCategoryActive();
  const deleteCategory = useDeleteCategory();
  const reorder = useReorderCategories();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteBlocked, setDeleteBlocked] = useState<string | null>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", is_active: true, parent: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const activeCategory = activeId ? categories.find((c) => c.id === activeId) : null;

  // Flat ordered ids for SortableContext (tree pre-order traversal)
  const flatIds = useMemo(() => {
    const ids: string[] = [];
    function addIds(parentId: string) {
      categories
        .filter((c) => c.parent === parentId)
        .sort((a, b) => a.sort_order - b.sort_order)
        .forEach((c) => { ids.push(c.id); addIds(c.id); });
    }
    addIds("");
    return ids;
  }, [categories]);

  function openCreate() {
    setForm({ name: "", is_active: true, parent: "" });
    setEditing(null);
    setImageFile(null);
    setImagePreview("");
    setDialogOpen(true);
  }
  function openEdit(cat: Category) {
    setForm({ name: cat.name, is_active: cat.is_active, parent: cat.parent || "" });
    setEditing(cat);
    setImageFile(null);
    setImagePreview(cat.image ? getThumbUrl(cat.collectionId, cat.id, cat.image) : "");
    setDialogOpen(true);
  }
  function closeDialog() { setDialogOpen(false); setEditing(null); setImageFile(null); setImagePreview(""); }

  function saveForm() {
    if (!form.name) return;
    const slug = editing ? editing.slug : generateSlug(form.name);
    let sort_order = editing ? editing.sort_order : 0;
    if (!editing) {
      const siblings = categories.filter((c) => c.parent === (form.parent || ""));
      sort_order = siblings.length > 0 ? Math.max(...siblings.map((s) => s.sort_order)) + 1 : 0;
    }
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("slug", slug);
    fd.append("sort_order", String(sort_order));
    fd.append("is_active", String(form.is_active));
    fd.append("parent", form.parent || "");
    if (imageFile) fd.append("image", imageFile);
    saveCategory.mutate({ id: editing?.id ?? null, data: fd }, { onSuccess: closeDialog });
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const dragged = categories.find((c) => c.id === active.id);
    const target = categories.find((c) => c.id === over.id);
    if (!dragged || !target) return;

    // Only reorder within the same parent — cross-parent change via Edit dialog
    if (dragged.parent !== target.parent) return;

    const siblings = categories
      .filter((c) => c.parent === dragged.parent)
      .sort((a, b) => a.sort_order - b.sort_order);
    const oldIdx = siblings.findIndex((c) => c.id === active.id);
    const newIdx = siblings.findIndex((c) => c.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;

    const reordered = arrayMove(siblings, oldIdx, newIdx);
    reorder.mutate(reordered.map((c, i) => ({ id: c.id, sort_order: i })));
  }

  function buildParentOptions() {
    const exclude = new Set<string>();
    if (editing) { exclude.add(editing.id); categories.filter((c) => c.parent === editing.id).forEach((c) => exclude.add(c.id)); }
    return categories.filter((c) => !c.parent && !exclude.has(c.id)).sort((a, b) => a.sort_order - b.sort_order);
  }

  const rootCats = categories.filter((c) => !c.parent).sort((a, b) => a.sort_order - b.sort_order);
  const getChildren = (pid: string) => categories.filter((c) => c.parent === pid).sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Danh mục</h1>
          <p className="text-stone-400 text-sm">{categories.length} danh mục</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Thêm mới
        </button>
      </div>

      {/* Create/Edit dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-stone-950 border border-stone-800 rounded-xl w-full max-w-lg">
            <div className="px-5 py-4 border-b border-stone-800">
              <h3 className="text-white text-sm font-semibold">{editing ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}</h3>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Left: fields */}
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-stone-500 mb-1.5 block">Tên *</label>
                  <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className={iCls} placeholder="Hoa Sinh Nhật" />
                </div>
                <div>
                  <label className="text-[11px] text-stone-500 mb-1.5 block">Danh mục cha</label>
                  <select value={form.parent} onChange={(e) => setForm((f) => ({ ...f, parent: e.target.value }))} className={iCls}>
                    <option value="">— Gốc —</option>
                    {buildParentOptions().map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                    className="w-4 h-4 rounded accent-rose-500" />
                  <span className="text-sm text-stone-300">Hiển thị</span>
                </label>
              </div>

              {/* Right: image */}
              <div>
                <label className="text-[11px] text-stone-500 mb-1.5 block">Ảnh danh mục</label>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setImageFile(file);
                    setImagePreview(URL.createObjectURL(file));
                  }}
                />
                {imagePreview ? (
                  <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-stone-700 group">
                    <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button type="button" onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs rounded-lg transition-colors">
                        Đổi ảnh
                      </button>
                      <button type="button"
                        onClick={() => { setImageFile(null); setImagePreview(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                        className="p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-[4/3] border-2 border-dashed border-stone-700 hover:border-stone-500 rounded-lg flex flex-col items-center justify-center gap-1.5 text-stone-500 hover:text-stone-400 transition-colors">
                    <ImageIcon className="w-6 h-6" />
                    <span className="text-xs">Click để chọn ảnh</span>
                  </button>
                )}
              </div>
            </div>
            <div className="flex gap-2 justify-end px-5 py-3 border-t border-stone-800 bg-stone-900/50">
              <button onClick={closeDialog} className="px-3 py-1.5 text-xs text-stone-400 hover:text-white transition-colors">Huỷ</button>
              <button onClick={saveForm} disabled={saveCategory.isPending}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-60">
                <Check className="w-3.5 h-3.5" /> {saveCategory.isPending ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-stone-950 border border-stone-800 rounded-xl p-5 w-full max-w-sm">
            <h3 className="text-white text-sm font-semibold mb-2">Xoá danh mục</h3>
            <p className="text-stone-400 text-sm mb-4">Danh mục này sẽ bị xoá vĩnh viễn.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-3 py-1.5 text-xs text-stone-400 hover:text-white transition-colors">Huỷ</button>
              <button onClick={() => deleteCategory.mutate(deleteId, { onSuccess: () => setDeleteId(null) })}
                disabled={deleteCategory.isPending}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-60">
                Xoá
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete blocked */}
      {deleteBlocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-stone-950 border border-stone-800 rounded-xl p-5 w-full max-w-sm">
            <h3 className="text-white text-sm font-semibold mb-2">Không thể xoá</h3>
            <p className="text-stone-400 text-sm mb-4">Danh mục này còn danh mục con. Vui lòng xoá danh mục con trước.</p>
            <div className="flex justify-end">
              <button onClick={() => setDeleteBlocked(null)} className="px-4 py-1.5 bg-stone-700 hover:bg-stone-600 text-white text-xs font-medium rounded-lg transition-colors">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Tree list */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="py-10 text-center text-stone-500 text-sm">Đang tải...</div>
        ) : categories.length === 0 ? (
          <div className="py-10 text-center text-stone-500 text-sm">Chưa có danh mục nào</div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={({ active }: DragStartEvent) => setActiveId(active.id as string)}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveId(null)}
          >
            <SortableContext items={flatIds} strategy={verticalListSortingStrategy}>
              <div className="divide-y divide-stone-800">
                {rootCats.map((cat) => (
                  <CategoryRow
                    key={cat.id}
                    cat={cat}
                    depth={0}
                    getChildren={getChildren}
                    activeId={activeId}
                    onEdit={openEdit}
                    onToggle={(c) => toggleActive.mutate({ id: c.id, is_active: !c.is_active })}
                    onDelete={(id) => {
                      if (categories.some((c) => c.parent === id)) { setDeleteBlocked(id); return; }
                      setDeleteId(id);
                    }}
                  />
                ))}
              </div>
            </SortableContext>
            <DragOverlay dropAnimation={null}>
              {activeCategory && (
                <div className="flex items-center gap-3 px-3 py-3 bg-stone-800 border border-stone-600 rounded-xl shadow-2xl shadow-black/60">
                  <GripVertical className="w-4 h-4 text-stone-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium">{activeCategory.name}</p>
                    <p className="text-xs text-stone-500">/{activeCategory.slug}</p>
                  </div>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  );
}

function CategoryRow({ cat, depth, getChildren, activeId, onEdit, onToggle, onDelete }: {
  cat: Category; depth: number; getChildren: (pid: string) => Category[];
  activeId: string | null;
  onEdit: (c: Category) => void; onToggle: (c: Category) => void; onDelete: (id: string) => void;
}) {
  const children = getChildren(cat.id);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id });

  return (
    <>
      <div
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition, paddingLeft: 12 + depth * 24 }}
        className={`flex items-center gap-3 pr-3 py-3 transition-colors ${isDragging ? "opacity-30" : "hover:bg-stone-800/30"}`}
      >
        <button
          {...attributes}
          {...listeners}
          className="text-stone-600 hover:text-stone-400 cursor-grab active:cursor-grabbing touch-none shrink-0"
          aria-label="Kéo để sắp xếp"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        {depth > 0 && <ChevronRight className="w-3.5 h-3.5 text-stone-600 shrink-0 -ml-1" />}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white font-medium">
            {!cat.is_active && <span className="text-stone-500 mr-1.5">[Ẩn]</span>}
            {cat.name}
          </p>
          <p className="text-xs text-stone-500">/{cat.slug}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onToggle(cat)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
              cat.is_active
                ? "bg-green-500/15 text-green-400 hover:bg-green-500/25 border border-green-500/30"
                : "bg-stone-800 text-stone-400 hover:text-stone-300 hover:bg-stone-700 border border-stone-700"
            }`}
          >
            {cat.is_active ? "Hiển thị" : "Ẩn"}
          </button>
          <button
            onClick={() => onEdit(cat)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-stone-400 bg-stone-800 hover:text-white hover:bg-stone-700 border border-stone-700 transition-colors"
          >
            <Pencil className="w-3 h-3" /> Sửa
          </button>
          <button
            onClick={() => onDelete(cat.id)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-stone-400 bg-stone-800 hover:text-red-400 hover:bg-red-400/10 border border-stone-700 hover:border-red-500/30 transition-colors"
          >
            <Trash2 className="w-3 h-3" /> Xoá
          </button>
        </div>
      </div>
      {children.map((child) => (
        <CategoryRow
          key={child.id}
          cat={child}
          depth={depth + 1}
          getChildren={getChildren}
          activeId={activeId}
          onEdit={onEdit}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </>
  );
}
