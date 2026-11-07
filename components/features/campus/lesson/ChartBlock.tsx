"use client";

import * as React from "react";
import type { ChartData } from "@/lib/campus/lesson-blocks";

const fmt = (n: number) => new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(n);

/** Single-series chart for lessons: horizontal bars or a line, with an accessible table. */
export function ChartBlock({ data }: { data: ChartData }) {
  if (data.points.length === 0) return null;
  const unit = data.unit ? ` ${data.unit}` : "";

  return (
    <figure className="my-8 rounded-2xl border border-primary/10 bg-white p-5 sm:p-6">
      {data.title ? (
        <figcaption className="mb-4 text-sm font-semibold text-primary">{data.title}</figcaption>
      ) : null}
      {data.type === "line" ? <LineChart data={data} unit={unit} /> : <BarChart data={data} unit={unit} />}
      {data.caption ? <p className="mt-3 text-xs text-primary/65">{data.caption}</p> : null}
      <table className="sr-only">
        <caption>{data.title}</caption>
        <tbody>
          {data.points.map((p) => (
            <tr key={p.label}>
              <th scope="row">{p.label}</th>
              <td>
                {fmt(p.value)}
                {unit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

function BarChart({ data, unit }: { data: ChartData; unit: string }) {
  const max = Math.max(...data.points.map((p) => p.value), 0) || 1;
  return (
    <ul className="space-y-3" aria-hidden>
      {data.points.map((p) => (
        <li key={p.label} className="grid grid-cols-[minmax(6rem,38%)_1fr] items-center gap-3 sm:grid-cols-[minmax(8rem,32%)_1fr]">
          <span className="text-sm text-primary/75">{p.label}</span>
          <span className="flex items-center gap-2" title={`${p.label}: ${fmt(p.value)}${unit}`}>
            <span
              className="h-4 rounded-r-[4px] bg-accent transition-[width] duration-700"
              style={{ width: `${Math.max(2, (p.value / max) * 85)}%` }}
            />
            <span className="text-sm font-semibold tabular-nums text-primary">
              {fmt(p.value)}
              {unit}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function LineChart({ data, unit }: { data: ChartData; unit: string }) {
  const [hover, setHover] = React.useState<number | null>(null);
  const W = 600;
  const H = 240;
  const pad = { top: 24, right: 24, bottom: 36, left: 16 };
  const values = data.points.map((p) => p.value);
  const max = Math.max(...values);
  const min = Math.min(0, ...values);
  const span = max - min || 1;
  const n = data.points.length;
  const x = (i: number) => pad.left + (n === 1 ? (W - pad.left - pad.right) / 2 : (i / (n - 1)) * (W - pad.left - pad.right));
  const y = (v: number) => pad.top + (1 - (v - min) / span) * (H - pad.top - pad.bottom);
  const path = data.points.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.value)}`).join(" ");
  const area = `${path} L${x(n - 1)},${y(min)} L${x(0)},${y(min)} Z`;
  const last = n - 1;
  const shown = hover ?? last;

  return (
    <div className="relative" aria-hidden>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full overflow-visible" onMouseLeave={() => setHover(null)}>
        <line x1={pad.left} x2={W - pad.right} y1={y(min)} y2={y(min)} className="stroke-primary/15" strokeWidth={1} />
        <path d={area} className="fill-accent/10" />
        <path d={path} fill="none" className="stroke-accent" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {data.points.map((p, i) => (
          <g key={p.label}>
            <rect
              x={x(i) - (W / n) / 2}
              y={0}
              width={W / n}
              height={H}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
            <circle cx={x(i)} cy={y(p.value)} r={i === shown ? 5 : 4} className="fill-accent stroke-white" strokeWidth={2} pointerEvents="none" />
            <text x={x(i)} y={H - 10} textAnchor="middle" className="fill-primary/60 text-[12px]">
              {p.label}
            </text>
          </g>
        ))}
        <text
          x={x(shown)}
          y={y(data.points[shown].value) - 12}
          textAnchor={shown === last ? "end" : shown === 0 ? "start" : "middle"}
          className="fill-primary text-[13px] font-semibold"
        >
          {fmt(data.points[shown].value)}
          {unit}
        </text>
      </svg>
    </div>
  );
}
