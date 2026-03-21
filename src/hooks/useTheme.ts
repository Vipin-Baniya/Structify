"use client";
import { useEffect, useState, useCallback } from "react";

export type ColorTheme = "onyx" | "aurora" | "slate" | "parchment" | "crimson" | "matrix";

export interface ThemeOption {
  value:       ColorTheme;
  label:       string;
  emoji:       string;
  description: string;
  preview:     { bg: string; accent: string };
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    value:       "onyx",
    label:       "Onyx",
    emoji:       "🟤",
    description: "Warm brown-black, amber gold accent",
    preview:     { bg: "#0E0C09", accent: "#E8A838" },
  },
  {
    value:       "aurora",
    label:       "Aurora",
    emoji:       "🟣",
    description: "Deep indigo, vivid violet accent",
    preview:     { bg: "#08061A", accent: "#A855F7" },
  },
  {
    value:       "slate",
    label:       "Slate",
    emoji:       "🔵",
    description: "Cool blue-grey, coral-orange accent",
    preview:     { bg: "#0D1117", accent: "#FF7043" },
  },
  {
    value:       "parchment",
    label:       "Parchment",
    emoji:       "📜",
    description: "Aged paper, forest teal accent",
    preview:     { bg: "#F5F0E6", accent: "#0F766E" },
  },
  {
    value:       "crimson",
    label:       "Crimson",
    emoji:       "🔴",
    description: "Deep red-black, crimson accent",
    preview:     { bg: "#0D0608", accent: "#E83848" },
  },
  {
    value:       "matrix",
    label:       "Matrix",
    emoji:       "💚",
    description: "Pure black, electric green",
    preview:     { bg: "#000300", accent: "#00FF41" },
  },
];

const STORAGE_KEY = "structify-color-theme";
const EVENT_NAME  = "structify:theme-change";
const isBrowser   = typeof window !== "undefined";

export function useTheme() {
  const [theme, setThemeState] = useState<ColorTheme>("onyx");

  useEffect(() => {
    const stored = isBrowser
      ? (localStorage.getItem(STORAGE_KEY) as ColorTheme | null)
      : null;
    const initial: ColorTheme = stored ?? "onyx";
    setThemeState(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  // Sync all hook instances when any one of them changes the theme
  useEffect(() => {
    if (!isBrowser) return;
    function handleChange(e: Event) {
      setThemeState((e as CustomEvent<ColorTheme>).detail);
    }
    window.addEventListener(EVENT_NAME, handleChange);
    return () => window.removeEventListener(EVENT_NAME, handleChange);
  }, []);

  const setTheme = useCallback((value: ColorTheme) => {
    setThemeState(value);
    if (isBrowser) {
      localStorage.setItem(STORAGE_KEY, value);
      document.documentElement.setAttribute("data-theme", value);
      window.dispatchEvent(new CustomEvent<ColorTheme>(EVENT_NAME, { detail: value }));
    }
  }, []);

  return { theme, setTheme };
}
