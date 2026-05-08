"use client";

import * as React from "react";
import { translations, type Lang } from "./translations";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Lookup a translation key like "navbar.courses" */
  t: (key: string) => string;
}

const LanguageContext = React.createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "hope-lang";

/**
 * Detect the user's preferred language from the browser.
 * Returns "es" if the primary language starts with "es", otherwise "en".
 */
function detectBrowserLanguage(): Lang {
  if (typeof window === "undefined") return "en";
  const browserLang = navigator.language || (navigator as any).userLanguage || "en";
  return browserLang.toLowerCase().startsWith("es") ? "es" : "en";
}

/**
 * Get stored language from localStorage, or detect from browser.
 */
function getInitialLanguage(): Lang {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "es") return stored;
  return detectBrowserLanguage();
}

/**
 * Traverse the translations object using a dot-separated key.
 * Example: t("navbar.courses") → translations.navbar.courses[lang]
 */
function resolveKey(key: string, lang: Lang): string {
  const parts = key.split(".");
  let current: any = translations;

  for (const part of parts) {
    if (current == null || typeof current !== "object") return key;
    current = current[part];
  }

  if (current && typeof current === "object" && lang in current) {
    return current[lang];
  }

  return key;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Always start with "en" to match server-rendered HTML and avoid hydration mismatch.
  // The useEffect below will correct to the user's preferred language after mount.
  const [lang, setLangState] = React.useState<Lang>("en");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setLangState(getInitialLanguage());
    setMounted(true);
  }, []);

  const setLang = React.useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem(STORAGE_KEY, newLang);
    // Update the HTML lang attribute for accessibility / SEO
    document.documentElement.lang = newLang;
    // Set cookie for server-side language detection
    document.cookie = `${STORAGE_KEY}=${newLang}; path=/; max-age=31536000`; // 1 year
  }, []);

  const t = React.useCallback(
    (key: string) => resolveKey(key, lang),
    [lang]
  );

  const value = React.useMemo(
    () => ({ lang, setLang, t }),
    [lang, setLang, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to access the current language and translation function.
 * Must be used within a <LanguageProvider>.
 */
export function useTranslation() {
  const ctx = React.useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within a <LanguageProvider>");
  }
  return ctx;
}

/**
 * Inline translation component for Server Components.
 * Renders a small client boundary that reads the current language.
 * Usage: <T k="navbar.courses" />
 */
export function T({ k, className }: { k: string; className?: string }) {
  const { t } = useTranslation();
  if (className) {
    return <span className={className}>{t(k)}</span>;
  }
  return <>{t(k)}</>;
}
