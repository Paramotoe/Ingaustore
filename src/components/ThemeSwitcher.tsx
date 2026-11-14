"use client";

import { useTheme } from "./ThemeProvider";
import type { Theme } from "./ThemeProvider";

const swatches: Record<string, string> = {
  "aurora-light": "linear-gradient(135deg,#5B3FD6,#0E7490)",
  "ivory-luxe": "linear-gradient(135deg,#765633,#46665A)",
  "midnight-neon": "linear-gradient(135deg,#A995FF,#39D5F8)",
  "obsidian-gold": "linear-gradient(135deg,#D4B477,#9EC4BA)",
};

export default function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();
  return (
    <div className="flex items-center gap-2">
      <span
        aria-hidden
        className="inline-block h-4 w-4 shrink-0 rounded-full border border-border"
        style={{ background: swatches[theme] }}
      />
      <select
        aria-label="Pilih tema"
        value={theme}
        onChange={(e) => setTheme(e.target.value as Theme)}
        className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-focus-ring"
      >
        {themes.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>
    </div>
  );
}