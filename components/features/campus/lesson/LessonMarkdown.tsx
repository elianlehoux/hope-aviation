"use client";

import * as React from "react";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { BookOpenText, Info, Lightbulb, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  parseCallout,
  parseChart,
  parseCheck,
  parseStats,
  parseSteps,
  preprocessLesson,
  type CalloutTone,
} from "@/lib/campus/lesson-blocks";
import { ChartBlock } from "./ChartBlock";
import { KnowledgeCheck } from "./KnowledgeCheck";

const CALLOUT: Record<CalloutTone, { icon: typeof Info; className: string; iconClass: string }> = {
  note: { icon: Info, className: "border-accent/20 bg-info/60", iconClass: "text-accent" },
  tip: { icon: Lightbulb, className: "border-highlight/30 bg-highlight/10", iconClass: "text-primary" },
  warning: { icon: TriangleAlert, className: "border-destructive/20 bg-destructive/5", iconClass: "text-destructive" },
  verse: { icon: BookOpenText, className: "border-primary/10 bg-paper-deep", iconClass: "text-primary/70" },
};

function Callout({ source }: { source: string }) {
  const { tone, title, body } = parseCallout(source);
  const { icon: Icon, className, iconClass } = CALLOUT[tone];
  return (
    <aside className={cn("my-6 flex gap-3 rounded-2xl border px-5 py-4", className)}>
      <Icon className={cn("mt-0.5 size-5 shrink-0", iconClass)} aria-hidden />
      <div className={cn("min-w-0 text-[15px] leading-relaxed text-primary/85", tone === "verse" && "italic")}>
        {title ? <p className="mb-1 font-semibold not-italic text-primary">{title}</p> : null}
        <Markdown remarkPlugins={[remarkGfm]} components={inline}>
          {body}
        </Markdown>
      </div>
    </aside>
  );
}

function Stats({ source }: { source: string }) {
  const items = parseStats(source);
  return (
    <dl className="my-8 grid gap-3 sm:grid-cols-3">
      {items.map((s) => (
        <div key={s.label} className="rounded-2xl bg-primary px-5 py-4 text-white">
          <dt className="sr-only">{s.label}</dt>
          <dd className="font-display text-2xl font-semibold tracking-tight text-highlight sm:text-3xl">{s.value}</dd>
          <dd className="mt-1 text-sm text-white/75">{s.label}</dd>
        </div>
      ))}
    </dl>
  );
}

function Steps({ source }: { source: string }) {
  const items = parseSteps(source);
  return (
    <ol className="my-8 space-y-0">
      {items.map((step, i) => (
        <li key={`${i}-${step.title}`} className="relative flex gap-4 pb-6 last:pb-0">
          {i < items.length - 1 ? (
            <span className="absolute left-4 top-9 h-[calc(100%-2.25rem)] w-px bg-primary/15" aria-hidden />
          ) : null}
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-highlight text-sm font-semibold text-primary">
            {i + 1}
          </span>
          <div className="pt-1">
            <p className="font-semibold text-primary">{step.title}</p>
            {step.description ? <p className="mt-0.5 text-[15px] text-primary/70">{step.description}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

function FencedBlock({ lang, meta, source }: { lang: string; meta?: string; source: string }) {
  switch (lang) {
    case "callout":
      return <Callout source={source} />;
    case "stats":
      return <Stats source={source} />;
    case "steps":
      return <Steps source={source} />;
    case "chart":
      return <ChartBlock data={parseChart(source, meta)} />;
    case "check": {
      const data = parseCheck(source);
      return data ? <KnowledgeCheck data={data} /> : null;
    }
    default:
      return (
        <pre className="my-6 overflow-x-auto rounded-xl bg-primary p-4 text-sm text-white/90">
          <code>{source}</code>
        </pre>
      );
  }
}

type HastNode = { type: string; tagName?: string; children?: HastNode[] };

/** Number of cells in a table's first row. */
function tableColumns(node: HastNode | undefined): number {
  const section = node?.children?.find((c) => c.tagName === "thead" || c.tagName === "tbody");
  const row = section?.children?.find((c) => c.tagName === "tr");
  return row?.children?.filter((c) => c.tagName === "th" || c.tagName === "td").length ?? 0;
}

/** Elements allowed inside callouts (no nested blocks). */
const inline: Components = {
  p: ({ children }) => <p className="[&:not(:last-child)]:mb-2">{children}</p>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noreferrer" className="font-medium text-accent underline underline-offset-2">
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="font-semibold text-primary">{children}</strong>,
};

const components: Components = {
  ...inline,
  h1: ({ children }) => <h2 className="mb-3 mt-10 font-display text-2xl font-semibold tracking-tight text-primary">{children}</h2>,
  h2: ({ children }) => <h2 className="mb-3 mt-10 font-display text-2xl font-semibold tracking-tight text-primary">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-2 mt-8 font-display text-xl font-semibold text-primary">{children}</h3>,
  p: ({ children }) => <p className="my-4">{children}</p>,
  ul: ({ children }) => <ul className="my-4 list-disc space-y-1.5 pl-6 marker:text-highlight">{children}</ul>,
  ol: ({ children }) => <ol className="my-4 list-decimal space-y-1.5 pl-6 marker:font-semibold marker:text-primary/60">{children}</ol>,
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-2 border-highlight pl-4 text-primary/75">{children}</blockquote>
  ),
  hr: () => <hr className="my-10 border-primary/10" />,
  img: ({ src, alt, title }) => (
    <figure className="my-8">
      {/* eslint-disable-next-line @next/next/no-img-element -- author-provided external images */}
      <img src={typeof src === "string" ? src : undefined} alt={alt ?? ""} loading="lazy" className="w-full rounded-2xl" />
      {title || alt ? <figcaption className="mt-2 text-center text-xs text-primary/55">{title || alt}</figcaption> : null}
    </figure>
  ),
  table: ({ children, node }) => (
    <div className="my-8 overflow-x-auto rounded-2xl border border-primary/10 bg-white">
      {/* Three or more columns get too narrow on phones: keep a readable width and scroll inside the frame. */}
      <table className={cn("w-full text-left text-sm", tableColumns(node) >= 3 && "min-w-[36rem]")}>{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-paper text-primary">{children}</thead>,
  th: ({ children }) => <th className="px-4 py-3 font-semibold">{children}</th>,
  td: ({ children }) => (
    <td className="border-t border-primary/10 px-4 py-3 align-top text-primary/80 first:font-medium first:text-primary">{children}</td>
  ),
  code: ({ children }) => <code className="rounded bg-paper-deep px-1.5 py-0.5 text-[0.9em]">{children}</code>,
  pre: ({ children, node }) => {
    const code = node?.children?.[0];
    if (code && code.type === "element" && code.tagName === "code") {
      const className = (code.properties?.className as string[] | undefined)?.[0] ?? "";
      const lang = className.replace(/^language-/, "");
      const source = code.children.map((c) => ("value" in c ? c.value : "")).join("").replace(/\n$/, "");
      const meta = (code.data as { meta?: string } | undefined)?.meta;
      return <FencedBlock lang={lang} meta={meta} source={source} />;
    }
    return <pre>{children}</pre>;
  },
};

/** Renders a lesson body written in campus Markdown (see lib/campus/lesson-blocks.ts). */
export function LessonMarkdown({ source }: { source: string }) {
  const prepared = React.useMemo(() => preprocessLesson(source), [source]);
  return (
    <div className="text-[17px] leading-[1.75] text-primary/85">
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {prepared}
      </Markdown>
    </div>
  );
}
