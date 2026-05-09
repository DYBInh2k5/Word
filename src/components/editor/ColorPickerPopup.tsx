"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const COLORS = [
  "#000000", "#434343", "#666666", "#999999", "#b7b7b7", "#cccccc", "#d9d9d9", "#ffffff",
  "#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#9900ff", "#ff00ff",
  "#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#cfe2f3", "#d9d2e9", "#ead1dc",
  "#ea9999", "#f9cb9c", "#ffe599", "#b6d7a8", "#a2c4c9", "#9fc5e8", "#b4a7d6", "#d5a6bd",
  "#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6fa8dc", "#8e7cc3", "#c27ba0",
  "#cc0000", "#e69138", "#f1c232", "#6aa84f", "#45818e", "#3d85c8", "#674ea7", "#a64d79",
  "#990000", "#b45f06", "#bf9000", "#38761d", "#134f5c", "#1155cc", "#351c75", "#741b47",
  "#660000", "#783f04", "#7f6000", "#274e13", "#0c343d", "#1c4587", "#20124d", "#4c1130",
];

const HIGHLIGHT_COLORS = [
  "#ffff00", "#00ff00", "#00ffff", "#ff69b4", "#ff9900",
  "#c0c0c0", "#ffffff", "#ffcccc", "#ccffcc", "#ccccff",
];

interface ColorPickerPopupProps {
  onSelect: (color: string) => void;
  icon: React.ReactNode;
  title?: string;
  currentColor?: string;
  isHighlight?: boolean;
}

export default function ColorPickerPopup({
  onSelect, icon, title, currentColor = "#000000", isHighlight = false,
}: ColorPickerPopupProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const colors = isHighlight ? HIGHLIGHT_COLORS : COLORS;

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-flex" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <button
          className="toolbar-btn"
          title={title}
          onClick={() => onSelect(currentColor)}
          style={{ position: "relative" }}
          type="button"
        >
          {icon}
          <span style={{
            position: "absolute",
            bottom: 3,
            left: "50%",
            transform: "translateX(-50%)",
            width: 16,
            height: 3,
            background: currentColor,
            borderRadius: 1,
          }} />
        </button>
        <button
          className="toolbar-btn"
          style={{ width: 14, padding: 0 }}
          onClick={() => setOpen(!open)}
          type="button"
          title="Chọn màu"
        >
          <ChevronDown size={10} />
        </button>
      </div>

      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 4px)",
          left: 0,
          zIndex: 1000,
          background: "var(--bg-card)",
          border: "1px solid var(--border-default)",
          borderRadius: 10,
          boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
          padding: 8,
          minWidth: isHighlight ? 130 : 220,
        }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, paddingLeft: 4 }}>
            {isHighlight ? "Màu highlight" : "Màu chữ"}
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${isHighlight ? 5 : 8}, 24px)`,
            gap: 3,
          }}>
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => { onSelect(c); setOpen(false); }}
                style={{
                  width: 24, height: 24, borderRadius: 4,
                  background: c,
                  border: c === "#ffffff" || c === currentColor
                    ? "2px solid var(--border-default)"
                    : "2px solid transparent",
                  cursor: "pointer",
                  transition: "transform 0.1s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                title={c}
              />
            ))}
          </div>
          {!isHighlight && (
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Tùy chỉnh:</label>
              <input
                type="color"
                defaultValue={currentColor}
                onChange={(e) => onSelect(e.target.value)}
                style={{ width: 28, height: 24, border: "none", padding: 0, cursor: "pointer" }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
