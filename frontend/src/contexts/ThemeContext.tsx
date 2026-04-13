"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

const THEME_KEY = "storybank-theme";

/** Temporarily force light theme in production (hide toggle + ignore stored/system dark). */
export const THEME_FORCE_LIGHT = process.env.NODE_ENV === "production";

export type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (next: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return null;
}

function applyTheme(next: Theme) {
  if (THEME_FORCE_LIGHT) {
    document.documentElement.classList.remove("dark");
    localStorage.setItem(THEME_KEY, "light");
    return;
  }
  document.documentElement.classList.toggle("dark", next === "dark");
  localStorage.setItem(THEME_KEY, next);
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  if (THEME_FORCE_LIGHT) return "light";
  return getStoredTheme() ?? getSystemTheme();
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  const setTheme = useCallback((next: Theme) => {
    if (THEME_FORCE_LIGHT) {
      setThemeState("light");
      applyTheme("light");
      return;
    }
    setThemeState(next);
    applyTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    if (THEME_FORCE_LIGHT) return;
    setThemeState((prev) => {
      const next = prev === "light" ? "dark" : "light";
      applyTheme(next);
      return next;
    });
  }, []);

  const value: ThemeContextValue = {
    theme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
