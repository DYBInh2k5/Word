"use client";

import { type Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { 
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, 
  Trash2, Merge, Split, Grid 
} from "lucide-react";

interface TableControlsProps {
  editor: Editor | null;
}

export default function TableControls({ editor }: TableControlsProps) {
  if (!editor) return null;

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ editor }: { editor: Editor }) => editor.isActive("table")}
      className="table-bubble-menu"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        background: "var(--bg-card)",
        border: "1px solid var(--border-default)",
        borderRadius: 8,
        padding: 4,
        boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
        zIndex: 50,
      }}
    >
      <button
        onClick={() => editor.chain().focus().addRowBefore().run()}
        className="toolbar-btn"
        title="Thêm hàng phía trên"
        type="button"
      >
        <ArrowUp size={14} />
      </button>
      <button
        onClick={() => editor.chain().focus().addRowAfter().run()}
        className="toolbar-btn"
        title="Thêm hàng phía dưới"
        type="button"
      >
        <ArrowDown size={14} />
      </button>
      <button
        onClick={() => editor.chain().focus().deleteRow().run()}
        className="toolbar-btn"
        title="Xóa hàng"
        type="button"
      >
        <Trash2 size={14} style={{ color: "#ef4444" }} />
      </button>
      <div className="toolbar-divider" style={{ width: 1, height: 16, background: "var(--border-default)", margin: "0 4px" }} />
      <button
        onClick={() => editor.chain().focus().addColumnBefore().run()}
        className="toolbar-btn"
        title="Thêm cột bên trái"
        type="button"
      >
        <ArrowLeft size={14} />
      </button>
      <button
        onClick={() => editor.chain().focus().addColumnAfter().run()}
        className="toolbar-btn"
        title="Thêm cột bên phải"
        type="button"
      >
        <ArrowRight size={14} />
      </button>
      <button
        onClick={() => editor.chain().focus().deleteColumn().run()}
        className="toolbar-btn"
        title="Xóa cột"
        type="button"
      >
        <Trash2 size={14} style={{ color: "#ef4444" }} />
      </button>
      <div className="toolbar-divider" style={{ width: 1, height: 16, background: "var(--border-default)", margin: "0 4px" }} />
      <button
        onClick={() => editor.chain().focus().mergeCells().run()}
        className="toolbar-btn"
        title="Gộp ô"
        type="button"
      >
        <Merge size={14} />
      </button>
      <button
        onClick={() => editor.chain().focus().splitCell().run()}
        className="toolbar-btn"
        title="Tách ô"
        type="button"
      >
        <Split size={14} />
      </button>
      <div className="toolbar-divider" style={{ width: 1, height: 16, background: "var(--border-default)", margin: "0 4px" }} />
      <button
        onClick={() => {
          if (window.confirm("Bạn có chắc muốn xóa toàn bộ bảng?")) {
            editor.chain().focus().deleteTable().run();
          }
        }}
        className="toolbar-btn"
        title="Xóa bảng"
        type="button"
      >
        <Grid size={14} style={{ color: "#ef4444" }} />
      </button>
    </BubbleMenu>
  );
}
