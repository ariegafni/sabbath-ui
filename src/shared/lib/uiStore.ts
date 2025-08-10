import { create } from "zustand";
type UIState = { isSidebarOpen: boolean; setSidebar: (v: boolean) => void };
export const useUI = create<UIState>((set) => ({
  isSidebarOpen: false,
  setSidebar: (v) => set({ isSidebarOpen: v })
}));
