"use client";

import { useDocumentStore } from "@/store/documentStore";
import { FileText, Clock, Check } from "lucide-react";

interface StatusBarProps {
  wordCount: number;
  charCount: number;
}

export default function StatusBar({ wordCount, charCount }: StatusBarProps) {
  const { lastSaved, isSaving, zoom } = useDocumentStore();

  return (
    <div className="status-bar" id="status-bar">
      <div className="status-bar-item">
        <FileText size={12} />
        <span>{wordCount} từ</span>
      </div>
      <div className="status-bar-item">
        <span>{charCount} ký tự</span>
      </div>
      <div style={{ flex: 1 }} />
      <div className="status-bar-item">
        {isSaving ? (
          <>
            <div className="loading-spinner" style={{ width: 10, height: 10, borderWidth: 1.5 }} />
            <span>Đang lưu...</span>
          </>
        ) : lastSaved ? (
          <>
            <Check size={12} />
            <span>Đã lưu {formatTime(lastSaved)}</span>
          </>
        ) : (
          <>
            <Clock size={12} />
            <span>Chưa lưu</span>
          </>
        )}
      </div>
      <div className="status-bar-item">
        <span>{zoom}%</span>
      </div>
    </div>
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}
