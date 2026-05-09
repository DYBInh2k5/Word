import { create } from "zustand";
import { Document } from "@/types/document";
import { getDocuments, saveDocument as storageSave, deleteDocument as storageDelete, createDocument } from "@/lib/storage";

interface DocumentStore {
  documents: Document[];
  currentDoc: Document | null;
  theme: "light" | "dark";
  zoom: number;
  isSaving: boolean;
  lastSaved: Date | null;
  toast: { msg: string; type: "success" | "error" | "info" } | null;

  loadDocuments: () => void;
  setCurrentDoc: (doc: Document | null) => void;
  saveCurrentDoc: (content: string, wordCount: number, charCount: number) => void;
  updateTitle: (title: string) => void;
  createNewDoc: () => Document;
  deleteDoc: (id: string) => void;
  toggleTheme: () => void;
  setZoom: (zoom: number) => void;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  documents: [],
  currentDoc: null,
  theme: "light",
  zoom: 100,
  isSaving: false,
  lastSaved: null,
  toast: null,

  loadDocuments: () => {
    const docs = getDocuments();
    set({ documents: docs });
  },

  setCurrentDoc: (doc) => {
    set({ currentDoc: doc });
  },

  saveCurrentDoc: (content, wordCount, charCount) => {
    const { currentDoc } = get();
    if (!currentDoc) return;
    const updated = { ...currentDoc, content, wordCount, charCount };
    storageSave(updated);
    const docs = getDocuments();
    set({ currentDoc: updated, documents: docs, isSaving: false, lastSaved: new Date() });
  },

  updateTitle: (title) => {
    const { currentDoc } = get();
    if (!currentDoc) return;
    const updated = { ...currentDoc, title };
    storageSave(updated);
    set({ currentDoc: updated, documents: getDocuments() });
  },

  createNewDoc: () => {
    const doc = createDocument();
    storageSave(doc);
    const docs = getDocuments();
    set({ documents: docs });
    return doc;
  },

  deleteDoc: (id) => {
    storageDelete(id);
    const docs = getDocuments();
    const { currentDoc } = get();
    if (currentDoc?.id === id) {
      set({ currentDoc: null });
    }
    set({ documents: docs });
  },

  toggleTheme: () => {
    const { theme } = get();
    const next = theme === "light" ? "dark" : "light";
    set({ theme: next });
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("wordflow_theme", next);
    }
  },

  setZoom: (zoom) => {
    set({ zoom });
  },

  showToast: (msg, type = "success") => {
    set({ toast: { msg, type } });
    setTimeout(() => set({ toast: null }), 3000);
  },
}));
