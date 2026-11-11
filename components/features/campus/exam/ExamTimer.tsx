"use client";

import * as React from "react";
import { AlarmClock, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";

function format(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(h ? 2 : 1, "0");
  const ss = String(s).padStart(2, "0");
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/**
 * Countdown to the server deadline. `offsetMs` corrects the local clock against the server
 * (server now − local now). Calls `onExpire` once when it reaches zero.
 */
export function ExamTimer({
  deadline,
  offsetMs,
  onExpire,
}: {
  deadline: string;
  offsetMs: number;
  onExpire: () => void;
}) {
  const { lang } = useTranslation();
  const es = lang === "es";
  const end = React.useMemo(() => Date.parse(deadline), [deadline]);
  const [now, setNow] = React.useState(() => Date.now() + offsetMs);
  const expired = React.useRef(false);
  const onExpireRef = React.useRef(onExpire);

  React.useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  React.useEffect(() => {
    const tick = () => {
      const current = Date.now() + offsetMs;
      setNow(current);
      if (!expired.current && current >= end) {
        expired.current = true;
        onExpireRef.current();
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [end, offsetMs]);

  const left = end - now;
  const warning = left < 60_000;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold tabular-nums transition-colors",
        warning ? "bg-warning/25 text-primary ring-1 ring-warning" : "bg-white text-primary/75 ring-1 ring-primary/10",
      )}
    >
      {warning ? <AlarmClock className="size-4" aria-hidden /> : <Clock className="size-4" aria-hidden />}
      <span className="sr-only">{es ? "Tiempo restante" : "Time left"}</span>
      <span>{format(left)}</span>
      {warning ? <span className="font-medium">{es ? "· menos de 1 min" : "· under 1 min"}</span> : null}
      <span className="sr-only" aria-live="polite">
        {warning ? (es ? "Queda menos de un minuto" : "Less than a minute left") : ""}
      </span>
    </div>
  );
}
