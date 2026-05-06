"use client";

import { useRef, useState, useEffect } from "react";
import { useEditor, EditorContent, ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import ImageExtension from "@tiptap/extension-image";
import { Bold, Italic, UnderlineIcon, Strikethrough, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Quote, Link2, Undo2, Redo2, ImageIcon } from "lucide-react";

// ── Resizable image node view ──────────────────────────────────────────────

function ResizableImageView({ node, updateAttributes, selected }: NodeViewProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [dragging, setDragging] = useState(false);
  const [liveWidth, setLiveWidth] = useState<number | null>(null);

  function onHandleMouseDown(e: React.MouseEvent, side: "left" | "right") {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);

    const startX = e.clientX;
    const startWidth = imgRef.current?.offsetWidth ?? node.attrs.width ?? 400;

    function onMouseMove(ev: MouseEvent) {
      const delta = side === "right" ? ev.clientX - startX : startX - ev.clientX;
      const next = Math.round(Math.max(80, startWidth + delta));
      setLiveWidth(next);
      updateAttributes({ width: next });
    }
    function onMouseUp() {
      setDragging(false);
      setLiveWidth(null);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }

  const width = node.attrs.width;
  const align: string = node.attrs.align ?? "left";
  const showUI = selected || dragging;

  const marginStyle =
    align === "center" ? { marginLeft: "auto", marginRight: "auto" } :
    align === "right"  ? { marginLeft: "auto", marginRight: "0" } :
                         { marginLeft: "0",    marginRight: "auto" };

  return (
    <NodeViewWrapper className="block w-full">
      <div
        className="relative select-none"
        style={{ width: width ? `${width}px` : "100%", ...marginStyle }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={node.attrs.src}
          alt={node.attrs.alt || ""}
          style={{ width: "100%", display: "block" }}
          className={showUI ? "ring-2 ring-blue-500 rounded-sm" : "rounded-sm"}
          draggable={false}
        />

        {showUI && (
          <>
            <div
              onMouseDown={(e) => onHandleMouseDown(e, "left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center w-3 h-10 cursor-ew-resize group z-10"
            >
              <div className="w-1.5 h-8 bg-blue-500 rounded-full shadow-md opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform" />
            </div>
            <div
              onMouseDown={(e) => onHandleMouseDown(e, "right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 flex items-center justify-center w-3 h-10 cursor-ew-resize group z-10"
            >
              <div className="w-1.5 h-8 bg-blue-500 rounded-full shadow-md opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform" />
            </div>
          </>
        )}

        {dragging && liveWidth !== null && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-zinc-900/80 text-white text-[11px] font-medium px-2 py-0.5 rounded pointer-events-none">
            {liveWidth}px
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}

const ResizableImage = ImageExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (el) => el.getAttribute("width"),
        renderHTML: (attrs) => attrs.width ? { width: attrs.width, style: `width:${attrs.width}px` } : {},
      },
      align: {
        default: "left",
        parseHTML: (el) => el.getAttribute("data-align") ?? "left",
        renderHTML: (attrs) => ({ "data-align": attrs.align }),
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});

// ── Editor ─────────────────────────────────────────────────────────────────

interface Props {
  value: string;
  onChange: (html: string) => void;
  className?: string;
  rows?: number;
}

export default function RichEditor({ value, onChange, className = "", rows = 5 }: Props) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      ResizableImage.configure({ inline: false, allowBase64: false }),
    ],
    content: value,
    onUpdate: ({ editor: ed }) => { onChange(ed.getHTML()); },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) return <div className={`border border-zinc-300 rounded-lg p-3 bg-white text-sm text-zinc-500 ${className}`}>Đang tải...</div>;

  const ed = editor;
  const imgActive = ed.isActive("image");
  const imgAlign = imgActive ? (ed.getAttributes("image").align ?? "left") : null;

  function setAlign(align: string) {
    if (imgActive) {
      ed.chain().focus().updateAttributes("image", { align }).run();
    } else {
      ed.chain().focus().setTextAlign(align).run();
    }
  }

  async function uploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const { url } = await res.json();
      if (url) ed.chain().focus().setImage({ src: url }).run();
    } catch { /* ignore */ }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  }

  return (
    <div className={`border border-zinc-300 rounded-lg overflow-hidden bg-white ${className}`}>
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-zinc-200 bg-zinc-50 flex-wrap">
        <Btn onClick={() => ed.chain().focus().undo().run()} icon={<Undo2 className="w-3.5 h-3.5" />} />
        <Btn onClick={() => ed.chain().focus().redo().run()} icon={<Redo2 className="w-3.5 h-3.5" />} />
        <span className="w-px h-4 bg-zinc-200 mx-1" />
        <Btn active={ed.isActive("bold")} onClick={() => ed.chain().focus().toggleBold().run()} icon={<Bold className="w-3.5 h-3.5" />} />
        <Btn active={ed.isActive("italic")} onClick={() => ed.chain().focus().toggleItalic().run()} icon={<Italic className="w-3.5 h-3.5" />} />
        <Btn active={ed.isActive("underline")} onClick={() => ed.chain().focus().toggleUnderline().run()} icon={<UnderlineIcon className="w-3.5 h-3.5" />} />
        <Btn active={ed.isActive("strike")} onClick={() => ed.chain().focus().toggleStrike().run()} icon={<Strikethrough className="w-3.5 h-3.5" />} />
        <span className="w-px h-4 bg-zinc-200 mx-1" />
        <Btn active={imgAlign === "left" || (!imgActive && ed.isActive({ textAlign: "left" }))} onClick={() => setAlign("left")} icon={<AlignLeft className="w-3.5 h-3.5" />} />
        <Btn active={imgAlign === "center" || (!imgActive && ed.isActive({ textAlign: "center" }))} onClick={() => setAlign("center")} icon={<AlignCenter className="w-3.5 h-3.5" />} />
        <Btn active={imgAlign === "right" || (!imgActive && ed.isActive({ textAlign: "right" }))} onClick={() => setAlign("right")} icon={<AlignRight className="w-3.5 h-3.5" />} />
        <span className="w-px h-4 bg-zinc-200 mx-1" />
        <Btn active={ed.isActive("bulletList")} onClick={() => ed.chain().focus().toggleBulletList().run()} icon={<List className="w-3.5 h-3.5" />} />
        <Btn active={ed.isActive("orderedList")} onClick={() => ed.chain().focus().toggleOrderedList().run()} icon={<ListOrdered className="w-3.5 h-3.5" />} />
        <Btn active={ed.isActive("blockquote")} onClick={() => ed.chain().focus().toggleBlockquote().run()} icon={<Quote className="w-3.5 h-3.5" />} />
        <span className="w-px h-4 bg-zinc-200 mx-1" />
        <Btn onClick={() => { const url = prompt("URL:"); if (url) ed.chain().focus().setLink({ href: url }).run(); }} icon={<Link2 className="w-3.5 h-3.5" />} />
        <Btn onClick={() => fileInputRef.current?.click()} icon={<ImageIcon className="w-3.5 h-3.5" />} disabled={uploading} />
        <input ref={fileInputRef} type="file" accept="image/*" onChange={uploadImage} className="hidden" />
        <span className="w-px h-4 bg-zinc-200 mx-1" />
        <Btn onClick={() => ed.chain().focus().toggleHeading({ level: 2 }).run()} active={ed.isActive("heading", { level: 2 })} label="H2" />
        <Btn onClick={() => ed.chain().focus().toggleHeading({ level: 3 }).run()} active={ed.isActive("heading", { level: 3 })} label="H3" />
        <Btn onClick={() => ed.chain().focus().setParagraph().run()} active={ed.isActive("paragraph")} label="P" />
      </div>
      <EditorContent editor={ed} className="px-3 py-2 text-sm text-zinc-900 [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[120px]" style={{ minHeight: rows * 24 }} />
    </div>
  );
}

function Btn({ onClick, icon, active, label, disabled }: { onClick: () => void; icon?: React.ReactNode; active?: boolean; label?: string; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className={`text-xs rounded transition-colors ${label ? "px-1.5 py-0.5 font-semibold" : "w-7 h-6 flex items-center justify-center"} ${active ? "bg-zinc-200 text-zinc-900" : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200"} ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}>
      {icon || label}
    </button>
  );
}
