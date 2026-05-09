"use client";

import { useEffect, useState, useRef } from "react";
import { useDocumentStore } from "@/store/documentStore";
import { Check } from "lucide-react";

export default function Toast() {
  const { toast } = useDocumentStore();

  if (!toast) return null;

  const icon = toast.type === "success" ? "✓" : toast.type === "error" ? "✕" : "ℹ";
  const colors: Record<string, string> = {
    success: "#10b981",
    error: "#ef4444",
    info: "#2563eb",
  };

  return (
    <div className="toast-container">
      <div
        className={`toast ${toast.type}`}
        style={{ borderLeftColor: colors[toast.type] }}
      >
        <span style={{ color: colors[toast.type], fontWeight: 700 }}>{icon}</span>
        {toast.msg}
      </div>
    </div>
  );
}
