"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDocumentStore } from "@/store/documentStore";

export default function NewEditorPage() {
  const router = useRouter();
  const { createNewDoc } = useDocumentStore();

  useEffect(() => {
    const doc = createNewDoc();
    router.replace(`/editor/${doc.id}`);
  }, []);

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100vh", background: "var(--bg-app)",
    }}>
      <div className="loading-spinner" />
    </div>
  );
}
