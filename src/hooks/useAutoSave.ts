"use client";

import { useEffect, useRef } from "react";
import { Editor } from "@tiptap/react";
import { useDocumentStore } from "@/store/documentStore";

export function useAutoSave(editor: Editor | null) {
  const { saveCurrentDoc, currentDoc } = useDocumentStore();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!editor || !currentDoc) return;

    const save = () => {
      const html = editor.getHTML();
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const chars = text.length;
      saveCurrentDoc(html, words, chars);
    };

    // Auto-save every 30 seconds
    timerRef.current = setInterval(save, 30000);

    // Also save on editor update with debounce
    const handleUpdate = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setTimeout(() => {
        save();
        timerRef.current = setInterval(save, 30000);
      }, 2000);
    };

    editor.on("update", handleUpdate);

    return () => {
      editor.off("update", handleUpdate);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [editor, currentDoc, saveCurrentDoc]);
}
