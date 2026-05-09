"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDocumentStore } from "@/store/documentStore";
import { useAuthStore } from "@/store/authStore";
import { Document } from "@/types/document";
import { formatDate } from "@/lib/storage";
import { fetchCloudDocuments, upsertCloudDocument, deleteCloudDocument } from "@/lib/cloudSync";
import Toast from "@/components/ui/Toast";
import AuthModal from "@/components/auth/AuthModal";
import {
  FileText, Plus, Trash2, Sun, Moon, Search, Clock,
  LayoutGrid, List as ListIcon, Cloud, CloudOff, LogOut,
  User, Sparkles, Upload, RefreshCw,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { documents, loadDocuments, createNewDoc, deleteDoc, theme, toggleTheme, showToast } = useDocumentStore();
  const { user, initialize, signOut, loading: authLoading } = useAuthStore();

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [cloudDocs, setCloudDocs] = useState<Document[]>([]);

  // Init theme + auth + local docs
  useEffect(() => {
    const savedTheme = localStorage.getItem("wordflow_theme") as "light" | "dark" | null;
    if (savedTheme) {
      document.documentElement.setAttribute("data-theme", savedTheme);
      useDocumentStore.setState({ theme: savedTheme });
    }
    loadDocuments();
    initialize();
  }, []);

  // Load cloud docs when logged in
  useEffect(() => {
    if (user) loadCloud();
  }, [user]);

  const loadCloud = async () => {
    try {
      const docs = await fetchCloudDocuments();
      setCloudDocs(docs);
    } catch {}
  };

  const handleNew = () => {
    const doc = createNewDoc();
    router.push(`/editor/${doc.id}`);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (deleteConfirm === id) {
      deleteDoc(id);
      if (user) deleteCloudDocument(id).catch(() => {});
      showToast("Đã xóa tài liệu", "info");
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handleSyncToCloud = async () => {
    if (!user) { setShowAuth(true); return; }
    setSyncing(true);
    try {
      await Promise.all(documents.map((d) => upsertCloudDocument(d)));
      await loadCloud();
      showToast(`Đã đồng bộ ${documents.length} tài liệu lên cloud!`, "success");
    } catch {
      showToast("Lỗi đồng bộ cloud. Kiểm tra kết nối.", "error");
    } finally {
      setSyncing(false);
    }
  };

  // Merge local + cloud (local takes priority)
  const allDocs = (() => {
    const localIds = new Set(documents.map((d) => d.id));
    const onlyCloud = cloudDocs.filter((d) => !localIds.has(d.id));
    return [...documents, ...onlyCloud];
  })();

  const filtered = allDocs.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-app)" }}>
      {/* ── Header ── */}
      <header className="header-bar" style={{ position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="7" fill="#2563eb" />
            <path d="M6 7h12M6 12h12M6 17h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span style={{ fontWeight: 700, fontSize: 18, color: "var(--brand-primary)", letterSpacing: "-0.5px" }}>
            WordFlow
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Cloud sync */}
          {user ? (
            <button
              className="btn btn-ghost"
              onClick={handleSyncToCloud}
              disabled={syncing}
              title="Đồng bộ lên Supabase cloud"
              type="button"
              style={{ fontSize: 13, gap: 6 }}
            >
              {syncing
                ? <RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} />
                : <Cloud size={15} />}
              {syncing ? "Đồng bộ..." : "Cloud sync"}
            </button>
          ) : (
            <button
              className="btn btn-ghost"
              onClick={() => setShowAuth(true)}
              title="Đăng nhập để lưu cloud"
              type="button"
              style={{ fontSize: 13, gap: 6 }}
            >
              <CloudOff size={15} />
              Đăng nhập
            </button>
          )}

          {/* User / auth */}
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "linear-gradient(135deg,#2563eb,#7c3aed)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontSize: 13, fontWeight: 700,
              }}>
                {user.email?.[0]?.toUpperCase()}
              </div>
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => { signOut(); showToast("Đã đăng xuất", "info"); }}
                title="Đăng xuất"
                type="button"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : null}

          <button className="btn btn-ghost btn-icon" onClick={toggleTheme} title="Đổi theme" type="button">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="btn btn-primary" onClick={handleNew} id="new-doc-btn" type="button">
            <Plus size={16} />
            Tài liệu mới
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 80px" }}>
        {/* ── Hero ── */}
        <div style={{
          background: "linear-gradient(135deg,#2563eb 0%,#7c3aed 55%,#0ea5e9 100%)",
          borderRadius: 20, padding: "40px 48px", marginBottom: 40,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 220, height: 220, background: "rgba(255,255,255,0.06)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", bottom: -30, right: 100, width: 130, height: 130, background: "rgba(255,255,255,0.04)", borderRadius: "50%" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h1 style={{ fontSize: 30, fontWeight: 700, color: "white", marginBottom: 8, letterSpacing: "-0.8px" }}>
              Chào mừng đến với <span style={{ opacity: 0.95 }}>WordFlow</span> ✨
            </h1>
            <p style={{ color: "rgba(255,255,255,0.82)", fontSize: 15, marginBottom: 24, maxWidth: 520, lineHeight: 1.6 }}>
              Soạn thảo văn bản chuyên nghiệp với <strong style={{ color: "white" }}>AI Gemini</strong>, lưu cloud với <strong style={{ color: "white" }}>Supabase</strong>, không cần cài đặt.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                className="btn"
                onClick={handleNew}
                style={{ background: "white", color: "#2563eb", fontWeight: 600, padding: "11px 22px", fontSize: 14, borderRadius: 10, boxShadow: "0 4px 15px rgba(0,0,0,0.15)" }}
                type="button"
              >
                <Plus size={16} /> Tạo tài liệu mới
              </button>
              {!user && (
                <button
                  className="btn"
                  onClick={() => setShowAuth(true)}
                  style={{ background: "rgba(255,255,255,0.15)", color: "white", fontWeight: 600, padding: "11px 22px", fontSize: 14, borderRadius: 10, backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)" }}
                  type="button"
                >
                  <Cloud size={16} /> Đăng nhập lưu cloud
                </button>
              )}
            </div>
          </div>

          {/* Stats pills */}
          <div style={{ position: "absolute", right: 40, bottom: 28, display: "flex", gap: 10 }}>
            {[
              { label: "Tài liệu", value: allDocs.length },
              { label: "Tổng từ", value: allDocs.reduce((s, d) => s + (d.wordCount || 0), 0) },
            ].map((s) => (
              <div key={s.label} style={{
                background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)",
                borderRadius: 10, padding: "8px 16px", textAlign: "center",
                border: "1px solid rgba(255,255,255,0.18)",
              }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "white" }}>{s.value.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Search + view toggle ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ flex: 1, position: "relative", maxWidth: 380 }}>
            <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Tìm kiếm tài liệu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="search-docs"
              style={{
                width: "100%", padding: "9px 14px 9px 36px",
                border: "1px solid var(--border-default)", borderRadius: 10,
                background: "var(--bg-input)", color: "var(--text-primary)",
                fontSize: 13, outline: "none", fontFamily: "Inter, sans-serif",
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--border-focus)"}
              onBlur={(e) => e.target.style.borderColor = "var(--border-default)"}
            />
          </div>
          <div style={{ display: "flex", gap: 3, marginLeft: "auto" }}>
            {(["grid", "list"] as const).map((m) => (
              <button
                key={m}
                className="btn btn-ghost btn-icon"
                onClick={() => setViewMode(m)}
                type="button"
                style={{ background: viewMode === m ? "var(--bg-active)" : undefined, color: viewMode === m ? "var(--brand-primary)" : undefined }}
              >
                {m === "grid" ? <LayoutGrid size={17} /> : <ListIcon size={17} />}
              </button>
            ))}
          </div>
        </div>

        {/* ── Cloud indicator ── */}
        {user && cloudDocs.length > 0 && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8, marginBottom: 16,
            padding: "8px 14px", background: "var(--bg-active)", borderRadius: 8,
            border: "1px solid #2563eb30", fontSize: 13, color: "var(--brand-primary)",
          }}>
            <Cloud size={14} />
            <span>Đã kết nối cloud · {cloudDocs.length} tài liệu trên Supabase</span>
            <button onClick={loadCloud} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--brand-primary)", padding: "0 4px" }} type="button">
              <RefreshCw size={12} />
            </button>
          </div>
        )}

        {/* ── Empty state ── */}
        {allDocs.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📄</div>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Chưa có tài liệu nào</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>Tạo tài liệu đầu tiên của bạn để bắt đầu!</p>
            <button className="btn btn-primary" onClick={handleNew} type="button" style={{ padding: "12px 24px" }}>
              <Plus size={16} /> Tạo ngay
            </button>
          </div>
        )}

        {/* ── Documents ── */}
        {filtered.length > 0 && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <FileText size={16} style={{ color: "var(--text-muted)" }} />
              <h2 style={{ fontSize: 15, fontWeight: 600 }}>
                Tất cả tài liệu
                <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 400, color: "var(--text-muted)" }}>({filtered.length})</span>
              </h2>
            </div>

            {viewMode === "grid" ? (
              <div className="doc-grid">
                <button className="new-doc-card" onClick={handleNew} type="button" id="new-doc-card">
                  <Plus size={30} />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>Tài liệu mới</span>
                </button>
                {filtered.map((doc) => (
                  <DocCard
                    key={doc.id} doc={doc}
                    isCloud={!documents.find((d) => d.id === doc.id)}
                    onDelete={(e) => handleDelete(doc.id, e)}
                    deleteConfirm={deleteConfirm === doc.id}
                    onClick={() => router.push(`/editor/${doc.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {filtered.map((doc) => (
                  <DocListItem
                    key={doc.id} doc={doc}
                    isCloud={!documents.find((d) => d.id === doc.id)}
                    onDelete={(e) => handleDelete(doc.id, e)}
                    deleteConfirm={deleteConfirm === doc.id}
                    onClick={() => router.push(`/editor/${doc.id}`)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      <Toast />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ── DocCard ──────────────────────────────────────────────────────────
function DocCard({ doc, isCloud, onDelete, deleteConfirm, onClick }: {
  doc: Document; isCloud?: boolean;
  onDelete: (e: React.MouseEvent) => void;
  deleteConfirm: boolean; onClick: () => void;
}) {
  return (
    <div className="doc-card" onClick={onClick}>
      <div className="doc-card-preview">
        <div style={{ width: "80%", padding: "8px 12px", background: "rgba(255,255,255,0.75)", borderRadius: 6, backdropFilter: "blur(4px)" }}>
          <div style={{ height: 6, background: "#94a3b8", borderRadius: 3, marginBottom: 6, width: "65%", opacity: 0.5 }} />
          {[100, 85, 70].map((w, i) => (
            <div key={i} style={{ height: 3.5, background: "#94a3b8", borderRadius: 2, marginBottom: 4, width: `${w}%`, opacity: 0.25 }} />
          ))}
        </div>
        {isCloud && (
          <div style={{ position: "absolute", top: 8, left: 8, background: "#2563eb", borderRadius: 4, padding: "2px 6px", display: "flex", alignItems: "center", gap: 3 }}>
            <Cloud size={10} style={{ color: "white" }} />
            <span style={{ fontSize: 10, color: "white", fontWeight: 600 }}>Cloud</span>
          </div>
        )}
        <button
          onClick={onDelete}
          style={{
            position: "absolute", top: 8, right: 8,
            width: 28, height: 28, borderRadius: 6,
            background: deleteConfirm ? "#ef4444" : "rgba(0,0,0,0.12)",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: deleteConfirm ? "white" : "#64748b",
            transition: "all 0.15s", zIndex: 5,
          }}
          title={deleteConfirm ? "Xác nhận xóa" : "Xóa"}
          type="button"
        >
          <Trash2 size={12} />
        </button>
      </div>
      <div className="doc-card-info">
        <div className="doc-card-title">{doc.title}</div>
        <div className="doc-card-meta">
          <Clock size={10} style={{ display: "inline", marginRight: 3 }} />
          {formatDate(doc.updatedAt)}
          {doc.wordCount > 0 && ` · ${doc.wordCount} từ`}
        </div>
      </div>
    </div>
  );
}

// ── DocListItem ──────────────────────────────────────────────────────
function DocListItem({ doc, isCloud, onDelete, deleteConfirm, onClick }: {
  doc: Document; isCloud?: boolean;
  onDelete: (e: React.MouseEvent) => void;
  deleteConfirm: boolean; onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "11px 14px",
        background: "var(--bg-card)", border: "1px solid var(--border-default)",
        borderRadius: 10, cursor: "pointer", transition: "all 0.15s",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--brand-primary)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 3px 12px rgba(37,99,235,0.1)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
    >
      <div style={{ width: 38, height: 46, background: "var(--bg-hover)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid var(--border-default)" }}>
        {isCloud ? <Cloud size={16} style={{ color: "#2563eb" }} /> : <FileText size={16} style={{ color: "var(--brand-primary)" }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {doc.title}
          {isCloud && <span style={{ marginLeft: 6, fontSize: 10, color: "#2563eb", fontWeight: 600, background: "#eff6ff", padding: "1px 5px", borderRadius: 4 }}>CLOUD</span>}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", gap: 10 }}>
          <span><Clock size={10} style={{ display: "inline", marginRight: 2 }} />{formatDate(doc.updatedAt)}</span>
          {doc.wordCount > 0 && <span>{doc.wordCount} từ</span>}
        </div>
      </div>
      <button
        onClick={onDelete}
        style={{ width: 30, height: 30, borderRadius: 7, background: deleteConfirm ? "#ef4444" : "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: deleteConfirm ? "white" : "var(--text-muted)", transition: "all 0.15s" }}
        title={deleteConfirm ? "Xác nhận xóa" : "Xóa"}
        type="button"
        onMouseEnter={(e) => { if (!deleteConfirm) { (e.currentTarget as HTMLElement).style.background = "#fee2e2"; (e.currentTarget as HTMLElement).style.color = "#ef4444"; } }}
        onMouseLeave={(e) => { if (!deleteConfirm) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; } }}
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
