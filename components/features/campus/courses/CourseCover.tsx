import { cn } from "@/lib/utils";

/**
 * Course artwork: the uploaded thumbnail, or a branded navy cover with amber flight
 * paths so cards never show a broken image.
 */
export function CourseCover({
  src,
  alt,
  className,
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- thumbnails may live on any host
      <img src={src} alt={alt} loading="lazy" className={cn("h-full w-full object-cover", className)} />
    );
  }
  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-primary", className)} aria-hidden>
      <svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path
            key={i}
            d={`M -20 ${190 - i * 22} C 120 ${150 - i * 26}, 240 ${210 - i * 30}, 420 ${120 - i * 24}`}
            fill="none"
            stroke="#ffaa00"
            strokeOpacity={0.18 + i * 0.07}
            strokeWidth={1.25}
          />
        ))}
        <circle cx="318" cy="78" r="3.5" fill="#ffaa00" />
      </svg>
    </div>
  );
}
