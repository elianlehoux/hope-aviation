import { cn } from "@/lib/utils";

/**
 * Stable 32-bit hash (FNV-1a plus a final mix), so each course keeps the same artwork on
 * every render and ids that differ in a single character still get different covers.
 */
function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

/**
 * Course artwork: the uploaded thumbnail, or a branded navy cover with amber flight
 * paths so cards never show a broken image. `seed` (the course id) bends the paths
 * and moves the waypoint, so a row of courses without thumbnails doesn't repeat.
 */
export function CourseCover({
  src,
  alt,
  seed = "",
  className,
}: {
  src: string | null;
  alt: string;
  seed?: string;
  className?: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- thumbnails may live on any host
      <img src={src} alt={alt} loading="lazy" className={cn("h-full w-full object-cover", className)} />
    );
  }
  const h = hashSeed(seed);
  const bend = (h % 61) - 30;
  const dotX = 240 + ((h >>> 8) % 110);
  const dotY = 52 + ((h >>> 16) % 48);
  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-primary", className)} aria-hidden>
      <svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path
            key={i}
            d={`M -20 ${190 - i * 22} C 120 ${150 - i * 26 + bend}, 240 ${210 - i * 30 - bend}, 420 ${120 - i * 24}`}
            fill="none"
            stroke="#ffaa00"
            strokeOpacity={0.18 + i * 0.07}
            strokeWidth={1.25}
          />
        ))}
        <circle cx={dotX} cy={dotY} r="3.5" fill="#ffaa00" />
      </svg>
    </div>
  );
}
