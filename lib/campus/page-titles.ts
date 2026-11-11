import type { Metadata } from "next";
import { cookies } from "next/headers";
import { parseUuidParam } from "@/lib/api/params";
import { getCourseOutline, getLearnerUser } from "@/lib/campus/learning";
import { getLocalizedText } from "@/lib/utils/i18n-helpers";
import type { TranslatedText } from "@/types/database";

/** Titles follow the visitor's language cookie; Spanish is the site default (see lib/i18n/context). */
async function titleLang(): Promise<"es" | "en"> {
  return (await cookies()).get("hope-lang")?.value === "en" ? "en" : "es";
}

/** Course overview tab title: the course name, or a generic label when it cannot be read. */
export async function courseTitle(rawCourseId: string): Promise<Metadata> {
  const courseId = parseUuidParam(rawCourseId);
  if (!courseId) return { title: "Curso" };
  const { supabase } = await getLearnerUser();
  const { data } = await supabase.from("courses").select("title").eq("id", courseId).maybeSingle();
  if (!data) return { title: "Curso" };
  return { title: getLocalizedText(data.title as TranslatedText, await titleLang()) };
}

/**
 * Classroom tab title, "Item · Course", for a lesson, a module exam or the final exam
 * (`itemId` is the class id, the exam id or "final-exam"). Reuses the request-cached outline
 * the page already loads, so it adds no query.
 */
export async function classroomTitle(rawCourseId: string, itemId: string): Promise<Metadata> {
  const courseId = parseUuidParam(rawCourseId);
  const outline = courseId ? await getCourseOutline(courseId) : null;
  if (!outline) return { title: "Campus" };
  const lang = await titleLang();
  const course = getLocalizedText(outline.title, lang);
  const item = outline.items.find((i) => i.id === itemId);
  return { title: item ? `${getLocalizedText(item.title, lang)} · ${course}` : course };
}
