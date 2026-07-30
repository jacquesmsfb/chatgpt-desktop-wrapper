import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import type { SearchResult } from "@/types";

interface SearchState {
  results: SearchResult[];
  loading: boolean;
  query: string;
  error: string | null;
  search: (query: string) => Promise<void>;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  results: [],
  loading: false,
  query: "",
  error: null,

  search: async (query) => {
    if (!query.trim()) {
      set({ results: [], loading: false, query });
      return;
    }
    set({ loading: true, error: null, query });
    try {
      const results = await invoke<SearchResult[]>("search_conversations", {
        query,
      });
      set({ results, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  clearSearch: () => set({ results: [], query: "", loading: false, error: null }),
}));
