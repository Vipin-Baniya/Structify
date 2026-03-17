import type { OS } from "@/hooks/useOS";

export interface OSTheme {
  label:       string;
  emoji:       string;
  description: string;
}

export const OS_THEMES: Record<OS, OSTheme> = {
  default: { label: "Spotify",  emoji: "🎧", description: "Spotify-inspired dark theme" },
  macos:   { label: "macOS",    emoji: "🍎", description: "Glassmorphism, dock navigation" },
  windows: { label: "Windows",  emoji: "🪟", description: "Fluent UI, acrylic blur, tiles" },
  linux:   { label: "Linux",    emoji: "🐧", description: "Terminal / hacker style" },
  android: { label: "Android",  emoji: "📱", description: "Material Design 3" },
  ios:     { label: "iOS",      emoji: "📲", description: "Apple-style minimal" },
};

export const OS_OPTIONS: Array<{ value: string; label: string; emoji: string }> = [
  { value: "auto",    label: "Auto Detect", emoji: "🔮" },
  { value: "default", label: "Spotify",     emoji: "🎧" },
  { value: "macos",   label: "macOS",       emoji: "🍎" },
  { value: "windows", label: "Windows",     emoji: "🪟" },
  { value: "linux",   label: "Linux",       emoji: "🐧" },
  { value: "android", label: "Android",     emoji: "📱" },
  { value: "ios",     label: "iOS",         emoji: "📲" },
];
