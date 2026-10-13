// Device-level display preferences (theme + text size), kept in this browser.
export type Theme = "light" | "dark";
export const FONT_SCALES = [1, 1.15, 1.3] as const;

const KEY = "financhat-prefs";

export function readPrefs(): { theme: Theme; fontScale: number } {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { theme: "light", fontScale: 1, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  const dark = typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  return { theme: dark ? "dark" : "light", fontScale: 1 };
}

export function applyPrefs(p: { theme: Theme; fontScale: number }) {
  const root = document.documentElement;
  root.classList.toggle("dark", p.theme === "dark");
  root.style.setProperty("--font-scale", String(p.fontScale));
}

export function savePrefs(p: { theme: Theme; fontScale: number }) {
  localStorage.setItem(KEY, JSON.stringify(p));
  applyPrefs(p);
}
