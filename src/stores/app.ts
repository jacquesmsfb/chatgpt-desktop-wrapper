import { create } from "zustand";

export interface AppState {
  theme: "light" | "dark" | "system";
  sidebarOpen: boolean;
  sidebarWidth: number;
  setTheme: (theme: "light" | "dark" | "system") => void;
  toggleSidebar: () => void;
  setSidebarWidth: (width: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: "system",
  sidebarOpen: true,
  sidebarWidth: 240,
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarWidth: (width) => set({ sidebarWidth: width }),
}));
