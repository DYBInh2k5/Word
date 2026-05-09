"use client";

import { create } from "zustand";
import { getSupabaseClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface AuthStore {
  user: User | null;
  loading: boolean;
  initialized: boolean;

  initialize: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<string | null>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    const sb = getSupabaseClient();
    const { data } = await sb.auth.getSession();
    set({ user: data.session?.user ?? null, initialized: true });

    sb.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null });
    });
  },

  signInWithGoogle: async () => {
    const sb = getSupabaseClient();
    set({ loading: true });
    await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    set({ loading: false });
  },

  signInWithEmail: async (email, password) => {
    const sb = getSupabaseClient();
    set({ loading: true });
    const { error } = await sb.auth.signInWithPassword({ email, password });
    set({ loading: false });
    return error ? error.message : null;
  },

  signUpWithEmail: async (email, password, fullName) => {
    const sb = getSupabaseClient();
    set({ loading: true });
    const { error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    set({ loading: false });
    return error ? error.message : null;
  },

  signOut: async () => {
    const sb = getSupabaseClient();
    await sb.auth.signOut();
    set({ user: null });
  },
}));
