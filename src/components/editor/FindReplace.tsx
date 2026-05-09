"use client";

import { useState, useEffect, useRef } from "react";
import { type Editor } from "@tiptap/react";
import { Search, X, ChevronUp, ChevronDown, Replace, ReplaceAll } from "lucide-react";

interface FindReplaceProps {
  editor: Editor | null;
  onClose: () => void;
}

export default function FindReplace({ editor, onClose }: FindReplaceProps) {
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [showReplace, setShowReplace] = useState(false);
  const [matches, setMatches] = useState(0);
  const [current, setCurrent] = useState(0);
  const findRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    findRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!editor || !find) {
      setMatches(0);
      setCurrent(0);
      return;
    }
    const text = editor.getText();
    const flags = caseSensitive ? "g" : "gi";
    try {
      const regex = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags);
      const found = text.match(regex);
      setMatches(found ? found.length : 0);
      setCurrent(found ? 1 : 0);
    } catch {
      setMatches(0);
    }
  }, [find, caseSensitive, editor]);

  const handleReplace = () => {
    if (!editor || !find) return;
    const html = editor.getHTML();
    const flags = caseSensitive ? "g" : "gi";
    try {
      const regex = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags);
      // Replace only first occurrence
      const newHtml = html.replace(regex, (match, offset, str) => {
        // Simple: replace first match
        return replace;
      });
      // Use replaceAll-like behavior: replace one by one
      const firstReplaced = html.replace(
        new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), caseSensitive ? "" : "i"),
        replace
      );
      editor.commands.setContent(firstReplaced);
    } catch {}
  };

  const handleReplaceAll = () => {
    if (!editor || !find) return;
    const html = editor.getHTML();
    const flags = caseSensitive ? "g" : "gi";
    try {
      const regex = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags);
      const newHtml = html.replace(regex, replace);
      editor.commands.setContent(newHtml);
      setMatches(0);
    } catch {}
  };

  return (
    <div style={{
      position: "fixed", top: 110, right: 24, zIndex: 300,
      background: "var(--bg-card)",
      border: "1px solid var(--border-default)",
      borderRadius: 12,
      boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
      padding: 14,
      width: 340,
      animation: "dropdownIn 0.15s ease",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            onClick={() => setShowReplace(false)}
            style={{ fontSize: 12, color: !showReplace ? "var(--brand-primary)" : "var(--text-muted)", background: "none", border: "none", cursor: "pointer", fontWeight: !showReplace ? 600 : 400, fontFamily: "Inter, sans-serif" }}
            type="button"
          >Tìm kiếm</button>
          <span style={{ color: "var(--border-default)" }}>|</span>
          <button
            onClick={() => setShowReplace(true)}
            style={{ fontSize: 12, color: showReplace ? "var(--brand-primary)" : "var(--text-muted)", background: "none", border: "none", cursor: "pointer", fontWeight: showReplace ? 600 : 400, fontFamily: "Inter, sans-serif" }}
            type="button"
          >Thay thế</button>
        </div>
        <button className="btn btn-ghost btn-icon" style={{ width: 24, height: 24 }} onClick={onClose} type="button">
          <X size={14} />
        </button>
      </div>

      {/* Find input */}
      <div style={{ position: "relative", marginBottom: 8 }}>
        <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        <input
          ref={findRef}
          type="text"
          placeholder="Tìm văn bản..."
          value={find}
          onChange={(e) => setFind(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
          style={{
            width: "100%", padding: "8px 60px 8px 32px",
            border: "1px solid var(--border-default)",
            borderRadius: 8, background: "var(--bg-input)",
            color: "var(--text-primary)", fontSize: 13,
            outline: "none", fontFamily: "Inter, sans-serif",
          }}
        />
        {/* Match count */}
        {find && (
          <span style={{
            position: "absolute", right: 36, top: "50%", transform: "translateY(-50%)",
            fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap",
          }}>
            {matches > 0 ? `${current}/${matches}` : "0"}
          </span>
        )}
        <div style={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)", display: "flex", gap: 2 }}>
          <button className="btn btn-ghost btn-icon" style={{ width: 22, height: 22, borderRadius: 4 }} type="button">
            <ChevronUp size={12} />
          </button>
          <button className="btn btn-ghost btn-icon" style={{ width: 22, height: 22, borderRadius: 4 }} type="button">
            <ChevronDown size={12} />
          </button>
        </div>
      </div>

      {/* Replace input */}
      {showReplace && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ position: "relative" }}>
            <Replace size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Thay thế bằng..."
              value={replace}
              onChange={(e) => setReplace(e.target.value)}
              style={{
                width: "100%", padding: "8px 14px 8px 32px",
                border: "1px solid var(--border-default)",
                borderRadius: 8, background: "var(--bg-input)",
                color: "var(--text-primary)", fontSize: 13,
                outline: "none", fontFamily: "Inter, sans-serif",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <button className="btn btn-ghost" onClick={handleReplace} type="button"
              style={{ flex: 1, fontSize: 12, padding: "6px 8px", border: "1px solid var(--border-default)" }}>
              <Replace size={12} />Thay thế
            </button>
            <button className="btn btn-primary" onClick={handleReplaceAll} type="button"
              style={{ flex: 1, fontSize: 12, padding: "6px 8px" }}>
              <ReplaceAll size={12} />Thay thế tất cả
            </button>
          </div>
        </div>
      )}

      {/* Options */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={(e) => setCaseSensitive(e.target.checked)}
            style={{ accentColor: "var(--brand-primary)", width: 13, height: 13 }}
          />
          Phân biệt hoa/thường
        </label>
      </div>
    </div>
  );
}
