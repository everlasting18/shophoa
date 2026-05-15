import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth";
import { useState } from "react";
import { Plus, Trash2, Upload, GripVertical, Check } from "lucide-react";
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
import { useBanners, useCreateBanner, useToggleBannerActive, useDeleteBanner, useReorderBanners } from "@/features/banners/api";
import { getImageUrl } from "@/lib/media";
import type { Banner } from "@/schema/pocketbase";

export const Route = createFileRoute("/_auth/banners")({
  beforeLoad: () => {
    if (useAuthStore.getState().role !== "owner") throw redirect({ to: "/" });
  },
  component: BannersPage,
});

const iCls = "w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-stone-600";

function BannersPage() {
  const { data: banners = [], isLoading } = useBanners();
  const createBanner = useCreateBanner();
  const toggleActive = useToggleBannerActive();
  const deleteBanner = useDeleteBanner();
  const reorder = useReorderBanners();

  const [showForm, setShowForm] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const activeBanner = activeId ? banners.find((b) => b.id === activeId) : null;

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const oldIdx = banners.findIndex((b) => b.id === active.id);
    const newIdx = banners.findIndex((b) => b.id === over.id);
    const reordered = arrayMove(banners, oldIdx, newIdx);
    reorder.mutate(reordered.map((b, i) => ({ id: b.id, sort_order: i })));
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    createBanner.mutate(
      { image: file, link, sort_order: banners.length },
      {
        onSuccess: () => {
          setShowForm(false);
          setFile(null);
          setLink("");
        },
      }
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Banners</h1>
          <p className="text-stone-400 text-sm">Quản lý ảnh banner trang chủ</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Upload banner
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-stone-900 border border-rose-500/30 rounded-xl p-4 space-y-3">
          <p className="text-xs font-medium text-rose-400 uppercase tracking-wide">Upload banner mới</p>
          <label className="flex items-center gap-2 px-4 py-2.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg text-sm text-stone-300 cursor-pointer w-fit">
            <Upload className="w-4 h-4" />
            {file ? file.name : "Chọn ảnh *"}
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="hidden" required />
          </label>
          <div>
            <label className="text-xs text-stone-400 mb-1 block">Link đến (tuỳ chọn)</label>
            <input value={link} onChange={(e) => setLink(e.target.value)} className={iCls} placeholder="Mặc định: trang chủ" />
          </div>
          <button
            type="submit"
            disabled={createBanner.isPending || !file}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm rounded-lg transition-colors disabled:opacity-60"
          >
            {createBanner.isPending ? "Đang upload..." : "Tạo banner"}
          </button>
        </form>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-stone-950 border border-stone-800 rounded-xl p-5 w-full max-w-sm">
            <h3 className="text-white text-sm font-semibold mb-2">Xoá banner</h3>
            <p className="text-stone-400 text-sm mb-4">Banner này sẽ bị xoá vĩnh viễn.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-3 py-1.5 text-xs text-stone-400 hover:text-white transition-colors">Huỷ</button>
              <button
                onClick={() => deleteBanner.mutate(deleteId, { onSuccess: () => setDeleteId(null) })}
                disabled={deleteBanner.isPending}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-60"
              >
                <Check className="w-3.5 h-3.5" />
                {deleteBanner.isPending ? "Đang xoá..." : "Xoá"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-stone-800/50">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3 animate-pulse">
                <div className="w-4 h-4 bg-stone-800 rounded shrink-0" />
                <div className="w-20 h-12 rounded-lg bg-stone-800 shrink-0" />
                <div className="h-4 flex-1 bg-stone-800 rounded" />
              </div>
            ))}
          </div>
        ) : banners.length === 0 ? (
          <div className="py-10 text-center text-stone-500 text-sm">Chưa có banner nào. Upload ảnh đầu tiên!</div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={({ active }: DragStartEvent) => setActiveId(active.id as string)}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveId(null)}
          >
            <SortableContext items={banners.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              <div className="divide-y divide-stone-800/50">
                {banners.map((banner, idx) => (
                  <SortableBannerItem
                    key={banner.id}
                    banner={banner}
                    idx={idx}
                    isDragging={activeId === banner.id}
                    onToggle={() => toggleActive.mutate({ id: banner.id, is_active: !banner.is_active })}
                    onDelete={() => setDeleteId(banner.id)}
                  />
                ))}
              </div>
            </SortableContext>
            <DragOverlay dropAnimation={null}>
              {activeBanner && <BannerDragPreview banner={activeBanner} />}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  );
}

function SortableBannerItem({ banner, idx, isDragging, onToggle, onDelete }: {
  banner: Banner; idx: number; isDragging: boolean;
  onToggle: () => void; onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: banner.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const imgUrl = getImageUrl(banner.collectionId, banner.id, banner.image);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 px-4 py-3 bg-stone-900 transition-colors ${isDragging ? "opacity-30" : "hover:bg-stone-800/20"}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="shrink-0 touch-none cursor-grab active:cursor-grabbing text-stone-600 hover:text-stone-400 transition-colors"
        aria-label="Kéo để sắp xếp"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="w-20 h-12 rounded-lg overflow-hidden bg-stone-800 shrink-0">
        <img src={imgUrl} alt={`Banner ${idx + 1}`} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        {banner.link
          ? <p className="text-sm text-stone-300 font-mono truncate">{banner.link}</p>
          : <p className="text-sm text-stone-500">Trang chủ</p>
        }
        <p className="text-[11px] text-stone-600 mt-0.5">#{idx + 1}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onToggle}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
            banner.is_active
              ? "bg-green-500/15 text-green-400 hover:bg-green-500/25 border-green-500/30"
              : "bg-stone-800 text-stone-400 hover:text-stone-300 border-stone-700"
          }`}
        >
          {banner.is_active ? "Hiển thị" : "Ẩn"}
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-400 bg-stone-800 hover:text-red-400 hover:bg-red-400/10 border border-stone-700 hover:border-red-500/30 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> Xoá
        </button>
      </div>
    </div>
  );
}

function BannerDragPreview({ banner }: { banner: Banner }) {
  const imgUrl = getImageUrl(banner.collectionId, banner.id, banner.image);
  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-stone-800 border border-stone-600 rounded-xl shadow-2xl shadow-black/60">
      <GripVertical className="w-4 h-4 text-stone-400 shrink-0" />
      <div className="w-20 h-12 rounded-lg overflow-hidden bg-stone-700 shrink-0">
        <img src={imgUrl} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-stone-200 truncate">{banner.link || "Trang chủ"}</p>
      </div>
    </div>
  );
}
