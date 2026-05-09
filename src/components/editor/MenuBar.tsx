"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDocumentStore } from "@/store/documentStore";
import { type Editor } from "@tiptap/react";
import { exportToPDF, exportToHTML, exportToMarkdown } from "@/lib/export";
import {
  FileText, Save, Download, FileDown, Copy, Sun, Moon,
  ChevronDown, ZoomIn, ZoomOut, RotateCcw, Info, Printer
} from "lucide-react";

interface MenuBarProps {
  editor: Editor | null;
}

type MenuKey = "file" | "edit" | "view" | "insert" | "format" | "help" | null;

export default function MenuBar({ editor }: MenuBarProps) {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);
  const { currentDoc, saveCurrentDoc, theme, toggleTheme, zoom, setZoom, showToast } = useDocumentStore();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSave = () => {
    if (!editor || !currentDoc) return;
    const html = editor.getHTML();
    const text = editor.getText();
    saveCurrentDoc(html, text.trim().split(/\s+/).length, text.length);
    showToast("Đã lưu tài liệu!", "success");
    setOpenMenu(null);
  };

  const handleExportPDF = async () => {
    if (!editor || !currentDoc) return;
    showToast("Đang xuất PDF...", "info");
    await exportToPDF(editor, currentDoc.title);
    showToast("Xuất PDF thành công!", "success");
    setOpenMenu(null);
  };

  const handleExportHTML = () => {
    if (!editor || !currentDoc) return;
    exportToHTML(editor, currentDoc.title);
    showToast("Xuất HTML thành công!", "success");
    setOpenMenu(null);
  };

  const handleCopyMarkdown = () => {
    if (!editor) return;
    const md = exportToMarkdown(editor);
    navigator.clipboard.writeText(md);
    showToast("Đã copy Markdown!", "success");
    setOpenMenu(null);
  };

  const handlePrint = () => {
    window.print();
    setOpenMenu(null);
  };

  const menu = (key: MenuKey, label: string, items: React.ReactNode) => (
    <div style={{ position: "relative" }}>
      <button
        className={`menubar-item ${openMenu === key ? "active" : ""}`}
        onClick={() => setOpenMenu(openMenu === key ? null : key)}
        type="button"
      >
        {label}
      </button>
      {openMenu === key && (
        <div className="dropdown-content" style={{ position: "absolute", top: "calc(100% + 2px)", left: 0, minWidth: 200 }}>
          {items}
        </div>
      )}
    </div>
  );

  const item = (icon: React.ReactNode, label: string, onClick: () => void, shortcut?: string) => (
    <button className="dropdown-item" onClick={onClick} type="button">
      {icon}
      <span style={{ flex: 1 }}>{label}</span>
      {shortcut && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{shortcut}</span>}
    </button>
  );

  return (
    <div className="menubar" ref={ref} id="menu-bar">
      {/* Logo mini */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, marginRight: 8, textDecoration: "none" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="6" fill="#2563eb" />
          <path d="M6 7h12M6 12h12M6 17h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </Link>

      {/* File menu */}
      {menu("file", "Tệp", <>
        {item(<FileText size={14} />, "Tài liệu mới", () => { router.push("/editor"); setOpenMenu(null); }, "Ctrl+N")}
        {item(<Save size={14} />, "Lưu", handleSave, "Ctrl+S")}
        <div className="dropdown-separator" />
        {item(<Download size={14} />, "Xuất PDF", handleExportPDF)}
        {item(<FileDown size={14} />, "Xuất HTML", handleExportHTML)}
        {item(<Copy size={14} />, "Copy Markdown", handleCopyMarkdown)}
        <div className="dropdown-separator" />
        {item(<Printer size={14} />, "In", handlePrint, "Ctrl+P")}
      </>)}

      {/* Edit menu */}
      {menu("edit", "Chỉnh sửa", <>
        {item(<RotateCcw size={14} />, "Hoàn tác", () => { editor?.chain().focus().undo().run(); setOpenMenu(null); }, "Ctrl+Z")}
        {item(<RotateCcw size={14} style={{ transform: "scaleX(-1)" }} />, "Làm lại", () => { editor?.chain().focus().redo().run(); setOpenMenu(null); }, "Ctrl+Y")}
      </>)}

      {/* View menu */}
      {menu("view", "Xem", <>
        <div className="dropdown-item" style={{ cursor: "default" }}>
          <ZoomOut size={14} />
          <span>Thu phóng</span>
        </div>
        {[75, 90, 100, 110, 125, 150, 175, 200].map((z) => (
          <button
            key={z}
            className="dropdown-item"
            onClick={() => { setZoom(z); setOpenMenu(null); }}
            type="button"
            style={{ paddingLeft: 24 }}
          >
            {zoom === z && <span style={{ marginRight: 4, color: "var(--brand-primary)" }}>✓</span>}
            {z}%
          </button>
        ))}
        <div className="dropdown-separator" />
        {item(theme === "dark" ? <Sun size={14} /> : <Moon size={14} />,
          theme === "dark" ? "Chế độ Sáng" : "Chế độ Tối",
          () => { toggleTheme(); setOpenMenu(null); })}
      </>)}
    </div>
  );
}
