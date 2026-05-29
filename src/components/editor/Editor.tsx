"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import FontFamily from "@tiptap/extension-font-family";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import SubScript from "@tiptap/extension-subscript";
import SuperScript from "@tiptap/extension-superscript";
import { createLowlight } from "lowlight";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";

import Toolbar from "./Toolbar";
import MenuBar from "./MenuBar";
import StatusBar from "./StatusBar";
import FindReplace from "./FindReplace";
import TableControls from "./TableControls";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useDocumentStore } from "@/store/documentStore";
import { Document } from "@/types/document";
import { FontSize } from "@/lib/fontSizeExtension";
import { LineHeight } from "@/lib/lineHeightExtension";

// Lowlight setup
const lowlight = createLowlight();
lowlight.register("javascript", javascript);
lowlight.register("typescript", typescript);
lowlight.register("python", python);
lowlight.register("html", xml);
lowlight.register("css", css);

interface EditorProps {
  document: Document;
}

export default function Editor({ document }: EditorProps) {
  const { zoom } = useDocumentStore();
  const [wordCount, setWordCount] = useState(document.wordCount || 0);
  const [charCount, setCharCount] = useState(document.charCount || 0);
  const [showFindReplace, setShowFindReplace] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      FontFamily,
      TextStyle,
      FontSize,
      LineHeight,
      Color,
      Highlight.configure({ multicolor: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false }),
      TaskList,
      TaskItem.configure({ nested: true }),
      CodeBlockLowlight.configure({ lowlight }),
      SubScript,
      SuperScript,
      Placeholder.configure({ placeholder: "Bắt đầu gõ văn bản của bạn..." }),
    ],
    content: document.content || "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
      setCharCount(text.length);
    },
    editorProps: {
      attributes: { class: "ProseMirror", spellcheck: "false" },
    },
  });

  // Auto-save
  useAutoSave(editor);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (editor) {
          const html = editor.getHTML();
          const text = editor.getText();
          useDocumentStore.getState().saveCurrentDoc(
            html,
            text.trim().split(/\s+/).length,
            text.length,
          );
          useDocumentStore.getState().showToast("Đã lưu!", "success");
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setShowFindReplace((v) => !v);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [editor]);

  const scale = zoom / 100;
  const marginCorrection = scale < 1 ? `${(1 - scale) * -500}px` : "0px";

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <MenuBar editor={editor} />
      <Toolbar editor={editor} onToggleFindReplace={() => setShowFindReplace((v) => !v)} />

      <div className="editor-container" style={{ paddingBottom: 48 }}>
        <div
          className="page-canvas"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top center",
            marginBottom: marginCorrection,
          }}
        >
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Floating controls */}
      <TableControls editor={editor} />

      {/* Find & Replace floating panel */}
      {showFindReplace && (
        <FindReplace editor={editor} onClose={() => setShowFindReplace(false)} />
      )}

      <StatusBar wordCount={wordCount} charCount={charCount} />
    </div>
  );
}
