/**
 * Campus lesson Markdown extensions.
 *
 * Lessons are plain Markdown (GFM: headings, lists, tables, images, links) plus fenced
 * blocks that render as rich components. Authors only need to remember these:
 *
 *   > [!NOTE] Optional title         callout (NOTE | TIP | WARNING | VERSE)
 *   > Body text, **markdown** ok
 *
 *   ```stats                         big numbers
 *   18 | natural regions
 *   ```
 *
 *   ```steps                         numbered process ("Title: description" per line)
 *   Plan: check weight and balance
 *   ```
 *
 *   ```chart                         bar (default) or line chart
 *   type: line
 *   title: Takeoff distance
 *   unit: m
 *   800 kg: 210
 *   ```
 *
 *   ```check                         knowledge check (not graded)
 *   ? Question
 *   - wrong option
 *   + correct option
 *   > explanation shown after answering
 *   ```
 */

export const CALLOUT_TONES = ["note", "tip", "warning", "verse"] as const;
export type CalloutTone = (typeof CALLOUT_TONES)[number];

export type ChartData = {
  type: "bar" | "line";
  title?: string;
  unit?: string;
  caption?: string;
  points: { label: string; value: number }[];
};

export type StatItem = { value: string; label: string };
export type StepItem = { title: string; description?: string };
export type CheckData = {
  question: string;
  options: { text: string; correct: boolean }[];
  explanation?: string;
};

const lines = (source: string) =>
  source
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

/**
 * Turns GitHub-style callout blockquotes into ```callout fences so a single code-block
 * renderer handles every extension. The body keeps its Markdown.
 */
export function preprocessLesson(markdown: string): string {
  const out: string[] = [];
  const src = markdown.replace(/\r\n/g, "\n").split("\n");

  for (let i = 0; i < src.length; i++) {
    const match = src[i].match(/^\s*>\s*\[!(NOTE|TIP|WARNING|VERSE)\]\s*(.*)$/i);
    if (!match) {
      out.push(src[i]);
      continue;
    }
    const body: string[] = [];
    while (i + 1 < src.length && /^\s*>/.test(src[i + 1])) {
      i++;
      body.push(src[i].replace(/^\s*>\s?/, ""));
    }
    out.push("````callout", `${match[1].toLowerCase()}|${match[2].trim()}`, ...body, "````");
  }

  return out.join("\n");
}

export function parseCallout(source: string): { tone: CalloutTone; title: string; body: string } {
  const [head = "", ...rest] = source.split("\n");
  const [tone, title = ""] = head.split("|");
  return {
    tone: (CALLOUT_TONES as readonly string[]).includes(tone) ? (tone as CalloutTone) : "note",
    title: title.trim(),
    body: rest.join("\n").trim(),
  };
}

/** "Label: value" — the value is after the last colon so labels may contain colons. */
function splitPair(line: string): [string, string] | null {
  const idx = line.lastIndexOf(":");
  if (idx <= 0) return null;
  return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
}

export function parseChart(source: string, meta?: string): ChartData {
  const data: ChartData = { type: meta?.trim() === "line" ? "line" : "bar", points: [] };
  for (const line of lines(source)) {
    const pair = splitPair(line);
    if (!pair) continue;
    const [key, value] = pair;
    const lower = key.toLowerCase();
    if (lower === "type") data.type = value === "line" ? "line" : "bar";
    else if (lower === "title") data.title = value;
    else if (lower === "unit") data.unit = value;
    else if (lower === "caption") data.caption = value;
    else {
      const n = Number(value.replace(/\s/g, "").replace(",", "."));
      if (Number.isFinite(n)) data.points.push({ label: key, value: n });
    }
  }
  return data;
}

export function parseStats(source: string): StatItem[] {
  return lines(source).map((line) => {
    const [value, ...label] = line.split("|");
    return { value: value.trim(), label: label.join("|").trim() };
  });
}

export function parseSteps(source: string): StepItem[] {
  return lines(source).map((line) => {
    const clean = line.replace(/^(\d+[.)]|[-*])\s*/, "");
    const idx = clean.indexOf(":");
    if (idx <= 0) return { title: clean };
    return { title: clean.slice(0, idx).trim(), description: clean.slice(idx + 1).trim() || undefined };
  });
}

export function parseCheck(source: string): CheckData | null {
  const data: CheckData = { question: "", options: [] };
  const explanation: string[] = [];
  for (const line of lines(source)) {
    if (line.startsWith("?")) data.question = line.slice(1).trim();
    else if (line.startsWith("+")) data.options.push({ text: line.slice(1).trim(), correct: true });
    else if (line.startsWith("-")) data.options.push({ text: line.slice(1).trim(), correct: false });
    else if (line.startsWith(">")) explanation.push(line.slice(1).trim());
  }
  if (!data.question || data.options.length < 2) return null;
  if (explanation.length) data.explanation = explanation.join(" ");
  return data;
}

/** Approximate reading time in minutes (200 words per minute, minimum 1). */
export function readingMinutes(markdown: string): number {
  const words = markdown.replace(/```[\s\S]*?```/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
