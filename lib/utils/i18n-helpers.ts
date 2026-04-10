import { TranslatedText } from "@/types/database";

/**
 * Extracts the appropriate text from a TranslatedText JSONB object based on the current language.
 * Falls back to the other language if the target language is missing.
 *
 * @param text The TranslatedText object from Supabase (e.g. { en: "Hello", es: "Hola" })
 * @param lang The current active language ("es" or "en")
 * @returns The localized string or a fallback placeholder if both are missing.
 */
export function getLocalizedText(
  text: TranslatedText | null,
  lang: "es" | "en" = "es"
): string {
  if (!text) return "—";
  
  // Try to get the requested language
  if (text[lang]?.trim()) return text[lang]!;
  
  // Fallback to the other language
  const fallback = lang === "es" ? "en" : "es";
  if (text[fallback]?.trim()) return text[fallback]!;
  
  // Final fallback or empty placeholder
  return "—";
}
