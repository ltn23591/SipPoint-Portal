import { create } from "zustand";

export const useUiStore = create((set) => ({
  sidebarCollapsed: false,
  globalLoading: false,

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarCollapsed: (value) => set({ sidebarCollapsed: !!value }),

  setGlobalLoading: (value) => set({ globalLoading: !!value }),
}));
