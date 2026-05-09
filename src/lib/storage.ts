import { Document } from "@/types/document";

const STORAGE_KEY = "wordflow_documents";
const SETTINGS_KEY = "wordflow_settings";

export function getDocuments(): Document[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveDocument(doc: Document): void {
  if (typeof window === "undefined") return;
  const docs = getDocuments();
  const idx = docs.findIndex((d) => d.id === doc.id);
  if (idx >= 0) {
    docs[idx] = { ...doc, updatedAt: new Date().toISOString() };
  } else {
    docs.unshift({ ...doc, updatedAt: new Date().toISOString() });
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

export function getDocument(id: string): Document | null {
  const docs = getDocuments();
  return docs.find((d) => d.id === id) || null;
}

export function deleteDocument(id: string): void {
  if (typeof window === "undefined") return;
  const docs = getDocuments().filter((d) => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

export function createDocument(title?: string): Document {
  return {
    id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: title || "Tài liệu không có tiêu đề",
    content: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    wordCount: 0,
    charCount: 0,
  };
}

export function getSettings(): { theme: string; zoom: number } {
  if (typeof window === "undefined") return { theme: "light", zoom: 100 };
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : { theme: "light", zoom: 100 };
  } catch {
    return { theme: "light", zoom: 100 };
  }
}

export function saveSettings(settings: { theme: string; zoom: number }): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function formatDate(isoStr: string): string {
  const date = new Date(isoStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  return date.toLocaleDateString("vi-VN");
}
