"use client";

import { useState } from "react";
import { useDocumentStore } from "@/store/documentStore";
import { X, Layout } from "lucide-react";

interface PageSetupModalProps {
  onClose: () => void;
}

export default function PageSetupModal({ onClose }: PageSetupModalProps) {
  const { currentDoc, updatePageSettings, updateHeaderFooter, showToast } = useDocumentStore();

  const [pageSize, setPageSize] = useState<"a4" | "letter">(currentDoc?.pageSize || "a4");
  const [pageOrientation, setPageOrientation] = useState<"portrait" | "landscape">(currentDoc?.pageOrientation || "portrait");
  const [pageMargin, setPageMargin] = useState<"normal" | "narrow" | "wide">(currentDoc?.pageMargin || "normal");
  const [headerText, setHeaderText] = useState(currentDoc?.headerText || "");
  const [footerText, setFooterText] = useState(currentDoc?.footerText || "");

  const handleApply = () => {
    updatePageSettings({
      pageSize,
      pageOrientation,
      pageMargin,
    });
    updateHeaderFooter(headerText, footerText);
    showToast("Đã áp dụng thiết lập trang!", "success");
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 460 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Layout size={18} style={{ color: "var(--brand-primary)" }} />
            <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>Thiết lập trang</span>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} type="button" style={{ width: 28, height: 28 }}>
            <X size={16} />
          </button>
        </div>

        {/* Form Settings */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Page Size */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
              Khổ giấy
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {(["a4", "letter"] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  className={`btn ${pageSize === size ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => setPageSize(size)}
                  style={{
                    flex: 1,
                    border: "1px solid var(--border-default)",
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Orientation */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
              Hướng giấy
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {([
                { label: "Dọc (Portrait)", value: "portrait" },
                { label: "Ngang (Landscape)", value: "landscape" },
              ] as const).map((orient) => (
                <button
                  key={orient.value}
                  type="button"
                  className={`btn ${pageOrientation === orient.value ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => setPageOrientation(orient.value)}
                  style={{
                    flex: 1,
                    border: "1px solid var(--border-default)",
                    fontWeight: 500,
                  }}
                >
                  {orient.label}
                </button>
              ))}
            </div>
          </div>

          {/* Margins */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
              Căn lề
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {([
                { label: "Bình thường", value: "normal" },
                { label: "Hẹp", value: "narrow" },
                { label: "Rộng", value: "wide" },
              ] as const).map((margin) => (
                <button
                  key={margin.value}
                  type="button"
                  className={`btn ${pageMargin === margin.value ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => setPageMargin(margin.value)}
                  style={{
                    flex: 1,
                    border: "1px solid var(--border-default)",
                    fontSize: 12,
                    fontWeight: 500,
                    padding: "8px 4px",
                  }}
                >
                  {margin.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: 1, background: "var(--border-default)", margin: "4px 0" }} />

          {/* Headers & Footers */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
              Tiêu đề đầu trang (Header)
            </label>
            <input
              type="text"
              value={headerText}
              onChange={(e) => setHeaderText(e.target.value)}
              placeholder="Nhập chữ hiển thị ở đầu mỗi trang..."
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
              Tiêu đề cuối trang (Footer)
            </label>
            <input
              type="text"
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              placeholder="Nhập chữ hiển thị ở cuối mỗi trang..."
              style={inputStyle}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
          <button className="btn btn-ghost" onClick={onClose} type="button" style={{ border: "1px solid var(--border-default)" }}>
            Đóng
          </button>
          <button className="btn btn-primary" onClick={handleApply} type="button" style={{ padding: "8px 24px" }}>
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  border: "1px solid var(--border-default)",
  borderRadius: 8,
  background: "var(--bg-input)",
  color: "var(--text-primary)",
  fontSize: 13,
  outline: "none",
  fontFamily: "Inter, sans-serif",
};
