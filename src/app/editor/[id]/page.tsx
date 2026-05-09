"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDocumentStore } from "@/store/documentStore";
import { getDocument } from "@/lib/storage";
import { Document } from "@/types/document";
import dynamic from "next/dynamic";
import Toast from "@/components/ui/Toast";
import { Save, ArrowLeft, Sun, Moon } from "lucide-react";

// Dynamic import to avoid SSR issues with Tiptap
const Editor = dynamic(() => import("@/components/editor/Editor"), { ssr: false });

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { setCurrentDoc, currentDoc, updateTitle, theme, toggleTheme, showToast } = useDocumentStore();
  const [doc, setDoc] = useState<Document | null>(null);
  const [titleEdit, setTitleEdit] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Init theme from storage
    const savedTheme = localStorage.getItem("wordflow_theme") as "light" | "dark" | null;
    if (savedTheme) {
      document.documentElement.setAttribute("data-theme", savedTheme);
      useDocumentStore.setState({ theme: savedTheme });
    }

    const found = getDocument(id);
    if (found) {
      setDoc(found);
      setCurrentDoc(found);
      setTitleEdit(found.title);
    } else {
      router.replace("/");
    }
    setLoading(false);
  }, [id]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleEdit(e.target.value);
  };

  const handleTitleBlur = () => {
    if (titleEdit.trim() && titleEdit !== currentDoc?.title) {
      updateTitle(titleEdit.trim());
      showToast("Đã cập nhật tên tài liệu", "success");
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") (e.target as HTMLInputElement).blur();
  };

  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", background: "var(--bg-app)",
      }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!doc) return null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-app)" }}>
      {/* Top bar */}
      <div className="header-bar" id="doc-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => router.push("/")}
            title="Quay lại trang chủ"
            type="button"
          >
            <ArrowLeft size={18} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="6" fill="#2563eb" />
              <path d="M6 7h12M6 12h12M6 17h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              className="doc-title-input"
              value={titleEdit}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              id="doc-title-input"
              placeholder="Nhập tên tài liệu..."
            />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            className="btn btn-ghost btn-icon"
            onClick={toggleTheme}
            title={theme === "dark" ? "Chế độ Sáng" : "Chế độ Tối"}
            type="button"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => showToast("Đã lưu!", "success")}
            id="save-btn"
            type="button"
          >
            <Save size={15} />
            Lưu
          </button>
        </div>
      </div>

      <Editor document={doc} />
      <Toast />
    </div>
  );
}
