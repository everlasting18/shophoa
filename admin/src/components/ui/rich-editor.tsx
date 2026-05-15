import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Italic, List, ListOrdered, Undo, Redo,
  Heading2, Heading3, ImagePlus,
} from "lucide-react";
import pb from "@/lib/pb";
import { PHOTO_BASE } from "@/lib/config";

interface Props {
  value: string;
  onChange: (html: string) => void;
  className?: string;
}

export default function RichEditor({ value, onChange, className = "" }: Props) {
  const valueRef = useRef(value);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isInternalChange = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension.configure({ inline: false }),
      Placeholder.configure({ placeholder: "Nhập mô tả chi tiết sản phẩm..." }),
    ],
    content: value,
    onUpdate({ editor }) {
      isInternalChange.current = true;
      const html = editor.getHTML();
      valueRef.current = html;
      onChange(html);
    },
  });

  // Sync external value changes (e.g. when product data loads)
  useEffect(() => {
    if (!editor || isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    if (value !== valueRef.current) {
      valueRef.current = value;
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  async function handleImageUpload(file: File) {
    if (!editor) return;
    const formData = new FormData();
    formData.append("file", file);
    const record = await pb.collection("media").create(formData);
    const url = `${PHOTO_BASE}/${record.collectionId}/${record.id}/${record.file}`;
    editor.chain().focus().setImage({ src: url }).run();
  }

  if (!editor) return null;

  const btnCls = (active: boolean) =>
    `p-1.5 rounded transition-colors ${active ? "bg-rose-600 text-white" : "text-stone-400 hover:text-white hover:bg-stone-700"}`;

  return (
    <div className={`tiptap-wrap border border-stone-700 rounded-lg overflow-hidden focus-within:border-rose-500/60 transition-colors ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 flex-wrap px-2 py-1.5 bg-[#18181b] border-b border-stone-700">
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnCls(editor.isActive("heading", { level: 2 }))} title="Tiêu đề 2">
          <Heading2 className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btnCls(editor.isActive("heading", { level: 3 }))} title="Tiêu đề 3">
          <Heading3 className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-stone-700 mx-1" />
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnCls(editor.isActive("bold"))} title="Đậm">
          <Bold className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnCls(editor.isActive("italic"))} title="Nghiêng">
          <Italic className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-stone-700 mx-1" />
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnCls(editor.isActive("bulletList"))} title="Danh sách chấm">
          <List className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnCls(editor.isActive("orderedList"))} title="Danh sách số">
          <ListOrdered className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-stone-700 mx-1" />
        <button type="button" onClick={() => fileInputRef.current?.click()} className={btnCls(false)} title="Chèn ảnh">
          <ImagePlus className="w-4 h-4" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
            e.target.value = "";
          }}
        />
        <div className="flex-1" />
        <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={btnCls(false) + " disabled:opacity-30"} title="Hoàn tác">
          <Undo className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={btnCls(false) + " disabled:opacity-30"} title="Làm lại">
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} className="tiptap-content" />
    </div>
  );
}
