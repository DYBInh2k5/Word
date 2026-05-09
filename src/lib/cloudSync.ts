import { getSupabaseClient } from "@/lib/supabase";
import { Document } from "@/types/document";

// ── Cloud CRUD ──────────────────────────────────────────────────────
export async function fetchCloudDocuments(): Promise<Document[]> {
  const sb = getSupabaseClient();
  const { data, error } = await sb
    .from("documents")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(toDocument);
}

export async function fetchCloudDocument(id: string): Promise<Document | null> {
  const sb = getSupabaseClient();
  const { data, error } = await sb
    .from("documents")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return toDocument(data);
}

export async function upsertCloudDocument(doc: Document): Promise<void> {
  const sb = getSupabaseClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await sb.from("documents").upsert({
    id: doc.id,
    user_id: user.id,
    title: doc.title,
    content: doc.content,
    word_count: doc.wordCount,
    char_count: doc.charCount,
    updated_at: new Date().toISOString(),
  } as any);

  if (error) throw error;
}

export async function deleteCloudDocument(id: string): Promise<void> {
  const sb = getSupabaseClient();
  const { error } = await sb.from("documents").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadImage(file: File, userId: string): Promise<string> {
  const sb = getSupabaseClient();
  const ext = file.name.split(".").pop();
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error } = await sb.storage.from("doc-images").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;

  const { data } = sb.storage.from("doc-images").getPublicUrl(path);
  return data.publicUrl;
}

// ── Helper ──────────────────────────────────────────────────────────
function toDocument(row: Record<string, unknown>): Document {
  return {
    id: row.id as string,
    title: row.title as string,
    content: row.content as string,
    wordCount: (row.word_count as number) ?? 0,
    charCount: (row.char_count as number) ?? 0,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}
