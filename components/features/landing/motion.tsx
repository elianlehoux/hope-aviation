"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Landing motion, without an animation library:
 *  - `[data-reveal]` elements get `data-in` the first time they enter the viewport
 *    (CSS in globals.css does the transition; `--i` staggers siblings).
 *  - `[data-progress]` elements get a `--p` custom property (0 to 1) tied to scroll,
 *    which CSS uses for parallax, the training route and scroll-filled text.
 * Everything is gated on the `motion-ready` class, so without JavaScript or with
 * reduced motion the page simply renders in its final state.
 */

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export function MotionRoot() {
  React.useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    (window as unknown as { __hopeMotion?: boolean }).__hopeMotion = true;
    root.classList.add("motion-ready");

    const observed = new WeakSet<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-in", "");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );

    let tracked: HTMLElement[] = [];
    let frame = 0;

    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      for (const el of tracked) {
        const r = el.getBoundingClientRect();
        let p: number;
        switch (el.dataset.progress) {
          // 0 when the top edge enters near the bottom of the screen, 1 a bit above the middle.
          case "enter":
            p = (vh * 0.92 - r.top) / (vh * 0.55);
            break;
          // 0 when the top enters, 1 when the bottom edge has reached 60% of the screen.
          case "span":
            p = (vh * 0.85 - r.top) / (r.height + vh * 0.25);
            break;
          // 0 when it enters from below, 1 when it has left through the top.
          default:
            p = (vh - r.top) / (vh + r.height);
        }
        el.style.setProperty("--p", clamp01(p).toFixed(4));
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    let scanFrame = 0;
    const scan = () => {
      scanFrame = 0;
      document.querySelectorAll("[data-reveal]:not([data-in])").forEach((el) => {
        if (observed.has(el)) return;
        observed.add(el);
        io.observe(el);
      });
      tracked = Array.from(document.querySelectorAll<HTMLElement>("[data-progress]"));
      update();
    };
    scan();

    // Streamed sections (the course list) arrive after mount.
    const mo = new MutationObserver(() => {
      if (!scanFrame) scanFrame = requestAnimationFrame(scan);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    const onReduceChange = () => {
      if (reduce.matches) root.classList.remove("motion-ready");
    };
    reduce.addEventListener("change", onReduceChange);

    return () => {
      io.disconnect();
      mo.disconnect();
      cancelAnimationFrame(frame);
      cancelAnimationFrame(scanFrame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reduce.removeEventListener("change", onReduceChange);
      root.classList.remove("motion-ready");
    };
  }, []);

  return null;
}

/**
 * Text that rises word by word from behind a mask. Screen readers get the plain
 * sentence once; the split words are decorative.
 * `mode="scroll"` reveals when scrolled into view, `mode="load"` plays on page load
 * (for the hero, where waiting for JavaScript would flash).
 */
export function Words({
  text,
  highlight,
  mode = "scroll",
  emphasis = "color",
  className,
}: {
  text: string;
  /** Words to emphasize, matched without punctuation. */
  highlight?: string[];
  /** "color" paints them amber (dark backgrounds only); "underline" keeps the ink and adds an amber rule. */
  emphasis?: "color" | "underline";
  mode?: "scroll" | "load";
  className?: string;
}) {
  const words = text.split(" ");
  const marked = new Set((highlight ?? []).map((w) => w.toLowerCase()));
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span
        aria-hidden="true"
        className={mode === "load" ? "words-load" : undefined}
        data-reveal={mode === "scroll" ? "words" : undefined}
      >
        {words.map((word, i) => {
          const bare = word.replace(/[.,:;!?¡¿]/g, "").toLowerCase();
          return (
            <React.Fragment key={i}>
              <span className="word">
                <span
                  style={{ ["--i" as string]: i }}
                  className={cn(
                    marked.has(bare) &&
                      (emphasis === "color"
                        ? "font-normal text-highlight"
                        : "font-normal underline decoration-highlight decoration-[0.07em] underline-offset-[0.14em]"),
                  )}
                >
                  {word}
                </span>
              </span>
              {i < words.length - 1 ? " " : null}
            </React.Fragment>
          );
        })}
      </span>
    </span>
  );
}

/**
 * Sentence whose words light up as you scroll past it. Inherits `--p` from the
 * nearest `[data-progress]` ancestor; without it the text is simply fully opaque.
 */
export function ScrollFill({ text, className }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <span className={className} data-progress="enter" style={{ ["--n" as string]: words.length }}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <React.Fragment key={i}>
            <span className="fill-word" style={{ ["--i" as string]: i }}>
              {word}
            </span>
            {i < words.length - 1 ? " " : null}
          </React.Fragment>
        ))}
      </span>
    </span>
  );
}

/** Groups thousands with dots, the way the figure is written in Argentina. */
function groupThousands(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Counts up to a real figure the first time it scrolls into view. The server
 * renders the final value, so it is correct without JavaScript.
 */
export function CountUp({ value, duration = 1800 }: { value: number; duration?: number }) {
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = clamp01((now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 4);
          el.textContent = groupThousands(value * eased);
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      el.textContent = groupThousands(value);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {groupThousands(value)}
    </span>
  );
}

/** Endless horizontal strip. The second copy is hidden from assistive tech. */
export function Marquee({ items, className }: { items: string[]; className?: string }) {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {items.map((item) => (
        <li key={item} className="flex items-center whitespace-nowrap">
          <span className="px-6 md:px-10">{item}</span>
          <span className="size-2 shrink-0 rounded-full bg-highlight md:size-2.5" aria-hidden="true" />
        </li>
      ))}
    </ul>
  );
  return (
    <div className={cn("flex overflow-hidden", className)}>
      <div className="marquee-track flex shrink-0">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
