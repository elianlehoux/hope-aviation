"use client";

import { useEffect, useRef, useState } from "react";
import createGlobe from "cobe";
import { cn } from "@/lib/utils";

const MARKERS = [
  { location: [-34.6037, -58.3816] as [number, number], size: 0.05 },
  { location: [-16.5, -68.15] as [number, number], size: 0.05 },
  { location: [-12.04, -77.04] as [number, number], size: 0.05 },
  { location: [14.6, 120.98] as [number, number], size: 0.05 },
  { location: [-18.14, 178.44] as [number, number], size: 0.05 },
  { location: [12.13, 15.05] as [number, number], size: 0.05 },
  { location: [-15.41, 28.28] as [number, number], size: 0.05 },
  { location: [-6.314993, 143.95555] as [number, number], size: 0.05 },
  { location: [9.7489, -83.7534] as [number, number], size: 0.05 },
  { location: [36.7783, -119.4179] as [number, number], size: 0.05 },
  { location: [56.1304, -106.3468] as [number, number], size: 0.05 },
  { location: [-15.3767, 166.9592] as [number, number], size: 0.05 },
];

export function Globe({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  // Track container width
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Create globe and animate via update() loop (COBE v2 API)
  useEffect(() => {
    if (!canvasRef.current || width === 0) return;

    let phi = 0;
    let frameId: number;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [23 / 255, 73 / 255, 255 / 255], // Hope Vibrant Blue
      markerColor: [1, 1, 1], // White for markers
      glowColor: [1, 1, 1],
      markers: MARKERS,
    });

    // Animation loop using globe.update() — the v2 way
    function animate() {
      phi += 0.001;
      globe.update({ phi });
      frameId = requestAnimationFrame(animate);
    }
    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      globe.destroy();
    };
  }, [width]);

  return (
    <div ref={containerRef} className={cn("w-full aspect-square relative", className)}>
      {/* Simple 2D Orbit Ring (Behind Globe) */}
      <div
        className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center"
        style={{ perspective: "1000px" }}
        aria-hidden="true"
      >
        <div style={{ transform: "rotateX(0deg)", width: "155%", height: "155%" }} className="will-change-transform">
          <div className="w-full h-full animate-[spin_120s_linear_infinite] will-change-transform">
            <svg className="w-full h-full" viewBox="0 0 300 300">
              <defs>
                <path id="orbitPath" d="M 150,150 m -145,0 a 145,145 0 1,0 290,0 a 145,145 0 1,0 -290,0" />
              </defs>
              <text className="fill-white/20 text-[10.38px] font-bold tracking-[0.3em] uppercase">
                <textPath href="#orbitPath">
                  Learning to reach · We do not teach how to fly · Learning to reach · We do not teach how to fly ·
                </textPath>
              </text>
            </svg>
          </div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-full relative z-10"
        style={{
          contain: "layout paint size",
          opacity: 1,
          transition: "opacity 1s ease",
          cursor: "grab",
        }}
      />
    </div>
  );
}
