import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import type { Flashcard } from "@/types";

interface FlashcardsState {
  flashcards: Flashcard[];
  loading: boolean;
  error: string | null;
  loadFlashcards: () => Promise<void>;
  createFlashcard: (flashcard: Flashcard) => Promise<void>;
  updateFlashcard: (flashcard: Flashcard) => Promise<void>;
  deleteFlashcard: (id: string) => Promise<void>;
}

export const useFlashcardsStore = create<FlashcardsState>((set) => ({
  flashcards: [],
  loading: false,
  error: null,

  loadFlashcards: async () => {
    set({ loading: true, error: null });
    try {
      const flashcards = await invoke<Flashcard[]>("list_flashcards");
      set({ flashcards, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  createFlashcard: async (flashcard) => {
    try {
      await invoke("create_flashcard", { flashcard });
      set((s) => ({ flashcards: [flashcard, ...s.flashcards] }));
    } catch (e) {
      set({ error: String(e) });
    }
  },

  updateFlashcard: async (flashcard) => {
    try {
      await invoke("update_flashcard", { flashcard });
      set((s) => ({
        flashcards: s.flashcards.map((f) =>
          f.id === flashcard.id ? flashcard : f
        ),
      }));
    } catch (e) {
      set({ error: String(e) });
    }
  },

  deleteFlashcard: async (id) => {
    try {
      await invoke("delete_flashcard", { id });
      set((s) => ({
        flashcards: s.flashcards.filter((f) => f.id !== id),
      }));
    } catch (e) {
      set({ error: String(e) });
    }
  },
}));
