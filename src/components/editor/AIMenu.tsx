"use client";

import { useState, useRef } from "react";
import { type Editor } from "@tiptap/react";
import {
  Sparkles, ChevronDown, Loader2, Wand2,
  AlignJustify, Minimize2, Maximize2, Languages, Edit3,
} from "lucide-react";
import {
  continueWriting, summarizeText, fixGrammar,
  translateText, rewriteText,
} from "@/lib/gemini";
import { useDocumentStore } from "@/store/documentStore";

interface AIMenuProps {
  editor: Editor | null;
}

const TRANSLATE_LANGS = [
  { label: "🇻🇳 Tiếng Việt", value: "vi" },
  { label: "🇺🇸 English", value: "en" },
  { label: "🇫🇷 Français", value: "fr" },
  { label: "🇯🇵 日本語", value: "ja" },
  { label: "🇨🇳 中文", value: "zh" },
  { label: "🇰🇷 한국어", value: "ko" },
];

export default function AIMenu({ editor }: AIMenuProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState("");
  const { showToast } = useDocumentStore();
  const ref = useRef<HTMLDivElement>(null);

  const isConfigured = !!process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  const run = async (label: string, fn: () => Promise<string>) => {
    if (!editor) return;
    if (!isConfigured) {
      showToast("Cần cấu hình GEMINI_API_KEY trong .env.local", "error");
      return;
    }
    setLoadingAction(label);
    setLoading(true);
    setOpen(false);
    try {
      const result = await fn();
      if (result) {
        editor.chain().focus().insertContent(result).run();
        showToast(`AI: ${label} thành công!`, "success");
      }
    } catch (e) {
      showToast("Lỗi AI. Kiểm tra API key và kết nối mạng.", "error");
    } finally {
      setLoading(false);
      setLoadingAction("");
    }
  };

  const getSelectedText = () => {
    if (!editor) return "";
    const { from, to } = editor.state.selection;
    return editor.state.doc.textBetween(from, to, " ");
  };

  const getFullText = () => editor?.getText() ?? "";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        className={`toolbar-btn ${open ? "active" : ""}`}
        style={{
          width: "auto",
          padding: "0 10px",
          gap: 5,
          display: "flex",
          alignItems: "center",
          background: open ? "var(--bg-active)" : "linear-gradient(135deg, #2563eb20, #7c3aed20)",
          color: "var(--brand-primary)",
          border: "1px solid #2563eb30",
          borderRadius: 8,
          fontWeight: 600,
          fontSize: 13,
          minWidth: 90,
        }}
        onClick={() => setOpen(!open)}
        disabled={loading}
        title="AI Trợ lý viết văn"
        type="button"
      >
        {loading ? (
          <><Loader2 size={14} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
            {loadingAction}…</>
        ) : (
          <><Sparkles size={14} />AI<ChevronDown size={12} /></>
        )}
      </button>

      {open && (
        <div
          className="dropdown-content"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            minWidth: 230,
            zIndex: 500,
          }}
        >
          <div style={{ padding: "6px 10px 4px", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            ✨ AI Trợ lý Viết văn
          </div>

          <div className="dropdown-separator" />

          {/* Continue */}
          <button className="dropdown-item" type="button"
            onClick={() => run("Viết tiếp", () => continueWriting(getSelectedText() || getFullText()))}>
            <Edit3 size={14} />
            Viết tiếp văn bản
          </button>

          {/* Summarize */}
          <button className="dropdown-item" type="button"
            onClick={() => run("Tóm tắt", () => summarizeText(getSelectedText() || getFullText()))}>
            <Minimize2 size={14} />
            Tóm tắt nội dung
          </button>

          {/* Fix grammar */}
          <button className="dropdown-item" type="button"
            onClick={() => run("Sửa lỗi", () => fixGrammar(getSelectedText() || getFullText()))}>
            <Wand2 size={14} />
            Sửa lỗi ngữ pháp
          </button>

          <div className="dropdown-separator" />

          {/* Rewrite */}
          <div style={{ padding: "4px 10px", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Viết lại</div>
          <button className="dropdown-item" type="button"
            onClick={() => run("Ngắn hơn", () => rewriteText(getSelectedText() || getFullText(), "shorter"))}>
            <Minimize2 size={14} />Ngắn gọn hơn
          </button>
          <button className="dropdown-item" type="button"
            onClick={() => run("Chi tiết hơn", () => rewriteText(getSelectedText() || getFullText(), "longer"))}>
            <Maximize2 size={14} />Chi tiết hơn
          </button>
          <button className="dropdown-item" type="button"
            onClick={() => run("Trang trọng", () => rewriteText(getSelectedText() || getFullText(), "formal"))}>
            <AlignJustify size={14} />Văn phong trang trọng
          </button>
          <button className="dropdown-item" type="button"
            onClick={() => run("Thân thiện", () => rewriteText(getSelectedText() || getFullText(), "casual"))}>
            <AlignJustify size={14} />Văn phong thân thiện
          </button>

          <div className="dropdown-separator" />

          {/* Translate */}
          <div style={{ padding: "4px 10px", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Dịch thuật</div>
          {TRANSLATE_LANGS.map((lang) => (
            <button key={lang.value} className="dropdown-item" type="button"
              onClick={() => run(`Dịch → ${lang.label}`, () => translateText(getSelectedText() || getFullText(), lang.value))}>
              <Languages size={14} />{lang.label}
            </button>
          ))}

          {!isConfigured && (
            <div style={{ padding: "8px 12px", fontSize: 11, color: "#f59e0b", background: "#fffbeb", margin: "4px 4px 0", borderRadius: 6, lineHeight: 1.4 }}>
              ⚠ Cần thêm GEMINI_API_KEY vào .env.local
            </div>
          )}
        </div>
      )}
    </div>
  );
}
