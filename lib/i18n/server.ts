import { cookies } from "next/headers";
import { Lang } from "./translations";

const STORAGE_KEY = "hope-lang";

/**
 * Get the current language on the server side using cookies.
 * Falls back to "en" if not set.
 */
export async function getServerLang(): Promise<Lang> {
  const cookieStore = await cookies();
  const lang = cookieStore.get(STORAGE_KEY)?.value;
  return (lang === "es" || lang === "en") ? lang : "en";
}
