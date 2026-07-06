import { create } from "zustand";
import { persist } from "zustand/middleware";

type Mode = "light" | "dark";

interface ThemeState {
  mode: Mode;
  toggle: () => void;
  apply: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: "light",
      toggle: () => {
        const next = get().mode === "light" ? "dark" : "light";
        set({ mode: next });
        get().apply();
      },
      apply: () => {
        const root = document.documentElement;
        if (get().mode === "dark") root.classList.add("dark");
        else root.classList.remove("dark");
      },
    }),
    { name: "wecan-theme" },
  ),
);
