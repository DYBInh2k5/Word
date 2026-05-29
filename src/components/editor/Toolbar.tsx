"use client";

import { useCallback } from "react";
import { type Editor } from "@tiptap/react";
import {
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter,
  AlignRight, AlignJustify, List, ListOrdered, ListChecks,
  Quote, Code, Code2, Minus, Link2, Image as ImageIcon, Table, Undo, Redo,
  ChevronDown, Type, Highlighter, Subscript, Superscript, Search,
} from "lucide-react";
import ColorPickerPopup from "./ColorPickerPopup";
import AIMenu from "./AIMenu";
import { useAuthStore } from "@/store/authStore";
import { useDocumentStore } from "@/store/documentStore";
import { uploadImage } from "@/lib/cloudSync";

interface ToolbarProps {
  editor: Editor | null;
  onToggleFindReplace?: () => void;
}

const FONT_FAMILIES = [
  { label: "Times New Roman", value: "Times New Roman, serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Calibri", value: "Calibri, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Helvetica", value: "Helvetica, sans-serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Courier New", value: "Courier New, monospace" },
  { label: "Inter", value: "Inter, sans-serif" },
];

const FONT_SIZES = ["8","9","10","11","12","14","16","18","20","22","24","28","32","36","48","72"];

const HEADING_LEVELS = [
  { label: "Đoạn văn", value: 0 },
  { label: "Tiêu đề 1", value: 1 },
  { label: "Tiêu đề 2", value: 2 },
  { label: "Tiêu đề 3", value: 3 },
  { label: "Tiêu đề 4", value: 4 },
  { label: "Tiêu đề 5", value: 5 },
  { label: "Tiêu đề 6", value: 6 },
];

export default function Toolbar({ editor, onToggleFindReplace }: ToolbarProps) {
  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("Nhập URL:", prev || "https://");
    if (url === null) return;
    if (url === "") editor.chain().focus().unsetLink().run();
    else editor.chain().focus().setLink({ href: url, target: "_blank" }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const choice = window.confirm("Bạn muốn tải ảnh từ máy tính lên? (Chọn Cancel nếu muốn nhập URL hình ảnh trực tiếp)");
    if (choice) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        
        const user = useAuthStore.getState().user;
        if (user) {
          try {
            useDocumentStore.getState().showToast("Đang tải ảnh lên...", "info");
            const url = await uploadImage(file, user.id);
            editor.chain().focus().setImage({ src: url }).run();
            useDocumentStore.getState().showToast("Đã tải ảnh lên!", "success");
          } catch (e) {
            useDocumentStore.getState().showToast("Lỗi tải ảnh lên cloud. Đang dùng ảnh offline.", "error");
            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result === "string") {
                editor.chain().focus().setImage({ src: reader.result }).run();
              }
            };
            reader.readAsDataURL(file);
          }
        } else {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === "string") {
              editor.chain().focus().setImage({ src: reader.result }).run();
            }
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } else {
      const url = window.prompt("Nhập URL hình ảnh:", "");
      if (url) editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const insertTable = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  if (!editor) return null;

  const btn = (
    onClick: () => void,
    icon: React.ReactNode,
    isActive?: boolean,
    title?: string,
    disabled?: boolean,
  ) => (
    <button
      onClick={onClick}
      className={`toolbar-btn ${isActive ? "active" : ""}`}
      title={title}
      disabled={disabled}
      type="button"
    >
      {icon}
    </button>
  );

  const headingValue =
    editor.isActive("heading", { level: 1 }) ? 1 :
    editor.isActive("heading", { level: 2 }) ? 2 :
    editor.isActive("heading", { level: 3 }) ? 3 :
    editor.isActive("heading", { level: 4 }) ? 4 :
    editor.isActive("heading", { level: 5 }) ? 5 :
    editor.isActive("heading", { level: 6 }) ? 6 : 0;

  return (
    <div className="toolbar" id="main-toolbar" style={{ flexWrap: "wrap", rowGap: 2 }}>
      {/* ── Undo / Redo ── */}
      {btn(() => editor.chain().focus().undo().run(), <Undo size={15} />, false, "Hoàn tác (Ctrl+Z)", !editor.can().undo())}
      {btn(() => editor.chain().focus().redo().run(), <Redo size={15} />, false, "Làm lại (Ctrl+Y)", !editor.can().redo())}
      <div className="toolbar-divider" />

      {/* ── Heading ── */}
      <select
        className="toolbar-select"
        style={{ width: 130 }}
        value={headingValue}
        onChange={(e) => {
          const level = Number(e.target.value);
          if (level === 0) editor.chain().focus().setParagraph().run();
          else editor.chain().focus().toggleHeading({ level: level as 1|2|3|4|5|6 }).run();
        }}
        title="Kiểu văn bản"
      >
        {HEADING_LEVELS.map((h) => (
          <option key={h.value} value={h.value}>{h.label}</option>
        ))}
      </select>
      <div className="toolbar-divider" />

      {/* ── Font family ── */}
      <select
        className="toolbar-select"
        style={{ width: 140 }}
        title="Font chữ"
        onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
        defaultValue="Times New Roman, serif"
      >
        {FONT_FAMILIES.map((f) => (
          <option key={f.value} value={f.value}>{f.label}</option>
        ))}
      </select>

      {/* ── Font size ── */}
      <select
        className="toolbar-select"
        style={{ width: 62 }}
        title="Cỡ chữ"
        defaultValue="12"
        onChange={(e) => {
          editor.chain().focus().setMark("textStyle", { fontSize: `${e.target.value}pt` }).run();
        }}
      >
        {FONT_SIZES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      
      {/* ── Line height ── */}
      <select
        className="toolbar-select"
        style={{ width: 85 }}
        title="Giãn dòng"
        defaultValue="1.8"
        onChange={(e) => {
          editor.chain().focus().setLineHeight(e.target.value).run();
        }}
      >
        <option value="1.0">Dòng 1.0</option>
        <option value="1.15">Dòng 1.15</option>
        <option value="1.5">Dòng 1.5</option>
        <option value="1.8">Dòng 1.8</option>
        <option value="2.0">Dòng 2.0</option>
        <option value="2.5">Dòng 2.5</option>
        <option value="3.0">Dòng 3.0</option>
      </select>
      
      <div className="toolbar-divider" />

      {/* ── Text formatting ── */}
      {btn(() => editor.chain().focus().toggleBold().run(), <Bold size={15} />, editor.isActive("bold"), "Đậm (Ctrl+B)")}
      {btn(() => editor.chain().focus().toggleItalic().run(), <Italic size={15} />, editor.isActive("italic"), "Nghiêng (Ctrl+I)")}
      {btn(() => editor.chain().focus().toggleUnderline().run(), <Underline size={15} />, editor.isActive("underline"), "Gạch chân (Ctrl+U)")}
      {btn(() => editor.chain().focus().toggleStrike().run(), <Strikethrough size={15} />, editor.isActive("strike"), "Gạch ngang")}
      {btn(() => editor.chain().focus().toggleSubscript().run(), <Subscript size={15} />, editor.isActive("subscript"), "Chỉ số dưới")}
      {btn(() => editor.chain().focus().toggleSuperscript().run(), <Superscript size={15} />, editor.isActive("superscript"), "Chỉ số trên")}
      <div className="toolbar-divider" />

      {/* ── Colors ── */}
      <ColorPickerPopup
        onSelect={(color) => editor.chain().focus().setColor(color).run()}
        icon={<Type size={15} />}
        title="Màu chữ"
        currentColor={editor.getAttributes("textStyle").color || "#111827"}
      />
      <ColorPickerPopup
        onSelect={(color) => editor.chain().focus().toggleHighlight({ color }).run()}
        icon={<Highlighter size={15} />}
        title="Highlight"
        currentColor="#fbbf24"
        isHighlight
      />
      <div className="toolbar-divider" />

      {/* ── Alignment ── */}
      {btn(() => editor.chain().focus().setTextAlign("left").run(), <AlignLeft size={15} />, editor.isActive({ textAlign: "left" }), "Căn trái")}
      {btn(() => editor.chain().focus().setTextAlign("center").run(), <AlignCenter size={15} />, editor.isActive({ textAlign: "center" }), "Căn giữa")}
      {btn(() => editor.chain().focus().setTextAlign("right").run(), <AlignRight size={15} />, editor.isActive({ textAlign: "right" }), "Căn phải")}
      {btn(() => editor.chain().focus().setTextAlign("justify").run(), <AlignJustify size={15} />, editor.isActive({ textAlign: "justify" }), "Căn đều")}
      <div className="toolbar-divider" />

      {/* ── Lists ── */}
      {btn(() => editor.chain().focus().toggleBulletList().run(), <List size={15} />, editor.isActive("bulletList"), "Danh sách chấm")}
      {btn(() => editor.chain().focus().toggleOrderedList().run(), <ListOrdered size={15} />, editor.isActive("orderedList"), "Danh sách số")}
      {btn(() => editor.chain().focus().toggleTaskList().run(), <ListChecks size={15} />, editor.isActive("taskList"), "Task list")}
      <div className="toolbar-divider" />

      {/* ── Blocks ── */}
      {btn(() => editor.chain().focus().toggleBlockquote().run(), <Quote size={15} />, editor.isActive("blockquote"), "Trích dẫn")}
      {btn(() => editor.chain().focus().toggleCode().run(), <Code size={15} />, editor.isActive("code"), "Code inline")}
      {btn(() => editor.chain().focus().toggleCodeBlock().run(), <Code2 size={15} />, editor.isActive("codeBlock"), "Code block")}
      {btn(() => editor.chain().focus().setHorizontalRule().run(), <Minus size={15} />, false, "Đường kẻ ngang")}
      <div className="toolbar-divider" />

      {/* ── Insert ── */}
      {btn(setLink, <Link2 size={15} />, editor.isActive("link"), "Chèn liên kết")}
      {btn(addImage, <ImageIcon size={15} />, false, "Chèn hình ảnh")}
      {btn(insertTable, <Table size={15} />, false, "Chèn bảng")}
      <div className="toolbar-divider" />

      {/* ── Find ── */}
      {btn(
        () => onToggleFindReplace?.(),
        <Search size={15} />,
        false,
        "Tìm & Thay thế (Ctrl+F)",
      )}
      <div className="toolbar-divider" />

      {/* ── AI ── */}
      <AIMenu editor={editor} />
    </div>
  );
}
