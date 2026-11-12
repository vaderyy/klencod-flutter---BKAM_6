"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { dict, type DictKey, type FontSize, type Lang, type Theme } from "@/lib/i18n";

const K_LANG = "bikam.lang";
const K_CHOSEN = "bikam.chosen";
const K_THEME = "bikam.theme";
const K_FONT = "bikam.font";

interface SettingsValue {
  lang: Lang;
  theme: Theme;
  fontSize: FontSize;
  langChosen: boolean;
  hydrated: boolean;
  isRTL: boolean;
  setLang: (l: Lang) => void;
  chooseLanguage: (l: Lang) => void;
  setTheme: (t: Theme) => void;
  setFontSize: (f: FontSize) => void;
  t: (key: DictKey) => string;
  marketName: (m: { ar: string; en: string }) => string;
}

const SettingsCtx = createContext<SettingsValue | null>(null);

function safeRead<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const v = window.localStorage.getItem(key) as T | null;
  return v && allowed.includes(v) ? v : fallback;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");
  const [theme, setThemeState] = useState<Theme>("sunny");
  const [fontSize, setFontSizeState] = useState<FontSize>("md");
  const [langChosen, setLangChosen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLangState(safeRead(K_LANG, ["ar", "en"] as const, "ar"));
    setThemeState(safeRead(K_THEME, ["sunny", "dark"] as const, "sunny"));
    setFontSizeState(safeRead(K_FONT, ["sm", "md", "lg"] as const, "md"));
    setLangChosen(window.localStorage.getItem(K_CHOSEN) === "1");
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.dataset.font = fontSize;
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
  }, [hydrated, theme, fontSize, lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem(K_LANG, l);
  }, []);

  const chooseLanguage = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem(K_LANG, l);
    window.localStorage.setItem(K_CHOSEN, "1");
    setLangChosen(true);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    window.localStorage.setItem(K_THEME, t);
  }, []);

  const setFontSize = useCallback((f: FontSize) => {
    setFontSizeState(f);
    window.localStorage.setItem(K_FONT, f);
  }, []);

  const t = useCallback((key: DictKey) => dict[lang][key] ?? key, [lang]);
  const marketName = useCallback(
    (m: { ar: string; en: string }) => (lang === "ar" ? m.ar : m.en),
    [lang],
  );

  const value = useMemo<SettingsValue>(
    () => ({
      lang,
      theme,
      fontSize,
      langChosen,
      hydrated,
      isRTL: lang === "ar",
      setLang,
      chooseLanguage,
      setTheme,
      setFontSize,
      t,
      marketName,
    }),
    [lang, theme, fontSize, langChosen, hydrated, setLang, chooseLanguage, setTheme, setFontSize, t, marketName],
  );

  return <SettingsCtx.Provider value={value}>{children}</SettingsCtx.Provider>;
}

export function useSettings(): SettingsValue {
  const ctx = useContext(SettingsCtx);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}
