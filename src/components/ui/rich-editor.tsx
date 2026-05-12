"use client";

import { useRef, useEffect } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Essentials,
  Bold, Italic, Underline,
  Heading, Paragraph,
  List,
  Alignment,
  Link, AutoLink,
  BlockQuote,
  Image, ImageBlock, ImageInline,
  ImageToolbar, ImageStyle, ImageResize, ImageUpload,
  FileRepository,
  HorizontalLine,
  RemoveFormat,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";

/* eslint-disable @typescript-eslint/no-explicit-any */
function uploadAdapterPlugin(editor: any) {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader: any) => ({
    upload: async () => {
      const file = await loader.file;
      if (!file) throw new Error("No file");
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!data.url) throw new Error(data.error || "Upload failed");
      return { default: data.url };
    },
    abort: () => {},
  });
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const EDITOR_CONFIG = {
  licenseKey: "GPL",
  plugins: [
    Essentials,
    Bold, Italic, Underline,
    Heading, Paragraph,
    List,
    Alignment,
    Link, AutoLink,
    BlockQuote,
    Image, ImageBlock, ImageInline,
    ImageToolbar, ImageStyle, ImageResize, ImageUpload,
    FileRepository,
    HorizontalLine,
    RemoveFormat,
  ],
  toolbar: {
    items: [
      "heading",
      "|", "bold", "italic", "underline", "removeFormat",
      "|", "alignment",
      "|", "bulletedList", "numberedList",
      "|", "blockQuote", "horizontalLine",
      "|", "link", "uploadImage",
      "|", "undo", "redo",
    ],
  },
  heading: {
    options: [
      { model: "paragraph" as const, title: "Đoạn văn", class: "ck-heading_paragraph" },
      { model: "heading2" as const, view: "h2" as const, title: "Tiêu đề 2", class: "ck-heading_heading2" },
      { model: "heading3" as const, view: "h3" as const, title: "Tiêu đề 3", class: "ck-heading_heading3" },
    ],
  },
  image: {
    resizeUnit: "%" as const,
    resizeOptions: [
      { name: "resizeImage:original", value: null, label: "Gốc" },
      { name: "resizeImage:50",  value: "50",  label: "50%" },
      { name: "resizeImage:75",  value: "75",  label: "75%" },
      { name: "resizeImage:100", value: "100", label: "100%" },
    ],
    styles: {
      options: ["inline", "alignLeft", "alignCenter", "alignRight", "side"],
    },
    toolbar: [
      "imageStyle:alignLeft", "imageStyle:alignCenter", "imageStyle:alignRight",
      "|", "imageStyle:inline", "imageStyle:side",
      "|", "imageTextAlternative",
      "|", "resizeImage",
    ],
  },
  extraPlugins: [uploadAdapterPlugin],
};

interface Props {
  value: string;
  onChange: (html: string) => void;
  className?: string;
}

export default function RichEditor({ value, onChange, className = "" }: Props) {
  const editorRef = useRef<ClassicEditor | null>(null);
  const internalRef = useRef(false);

  useEffect(() => {
    if (!editorRef.current || internalRef.current) { internalRef.current = false; return; }
    if (value !== editorRef.current.getData()) editorRef.current.setData(value);
  }, [value]);

  return (
    <div className={className}>
      <CKEditor
        editor={ClassicEditor}
        config={EDITOR_CONFIG}
        data={value}
        onReady={(editor) => { editorRef.current = editor; }}
        onChange={(_, editor) => { internalRef.current = true; onChange(editor.getData()); }}
      />
    </div>
  );
}
