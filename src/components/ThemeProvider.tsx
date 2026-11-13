"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "aurora-light" | "ivory-luxe" | "midnight-neon" | "obsidian-gold";

const STORAGE_KEY = "ingaustore-theme";

const themes: { id: Theme; label: string; dark: boolean }[] = [
  { id: "aurora-light", label: "Aurora Light", dark: false },
  { id: "ivory-luxe", label: "Ivory Luxe", dark: false },
  { id: "midnight-neon", label: "Midnight Neon", dark: true },
  { id: "obsidian-gold", label: "Obsidian Gold", dark: true },
];

export function isDark(theme: Theme) {
  return themes.find((t) => t.id === theme)?.dark ?? false;
}

type Ctx = { theme: Theme; setTheme: (t: Theme) => void; themes: typeof themes };
const ThemeContext = createContext<Ctx | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("aurora-light");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored && themes.some((t) => t.id === stored)) {
      setThemeState(stored);
      document.documentElement.setAttribute("data-theme", stored);
      return;
    }
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial: Theme = prefersDark ? "midnight-neon" : "aurora-light";
    setThemeState(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    document.documentElement.setAttribute("data-theme", t);
    window.localStorage.setItem(STORAGE_KEY, t);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}