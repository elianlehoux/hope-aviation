import QRCode from "qrcode";
import { CERTIFICATE_SHEET as SHEET } from "./format";

/**
 * Vector geometry shared by the PDF renderer and the on-screen sheet, so both draw the
 * same contour lines and QR code. Server-side only (pulls in `qrcode`): pages compute the
 * paths and pass plain strings to client components.
 */

export { SHEET };

/** Closed smooth loop through points (Catmull-Rom converted to cubic Béziers). */
function smoothLoop(points: [number, number][]): string {
  const n = points.length;
  const p = (i: number) => points[(i + n) % n];
  let d = `M${p(0)[0].toFixed(2)} ${p(0)[1].toFixed(2)} `;
  for (let i = 0; i < n; i++) {
    const [x0, y0] = p(i - 1);
    const [x1, y1] = p(i);
    const [x2, y2] = p(i + 1);
    const [x3, y3] = p(i + 2);
    const c1x = x1 + (x2 - x0) / 6;
    const c1y = y1 + (y2 - y0) / 6;
    const c2x = x2 - (x3 - x1) / 6;
    const c2y = y2 - (y3 - y1) / 6;
    d += `C${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(2)} `;
  }
  return `${d}Z`;
}

export type ContourRing = { d: string; width: number; opacity: number };

/**
 * Topographic "flight-path" rings for the navy band, in top-down SVG coordinates of the
 * sheet (points). Deterministic, so every certificate looks the same.
 */
export function bandContours(): ContourRing[] {
  const cx = SHEET.band * 0.5;
  const cy = SHEET.height * 0.44;
  const rings: ContourRing[] = [];
  const steps = 64;
  for (let k = 0; k < 13; k++) {
    const r = 16 + k * 19;
    const ox = cx + k * 2.4;
    const oy = cy - k * 3.1;
    const pts: [number, number][] = [];
    for (let i = 0; i < steps; i++) {
      const t = (i / steps) * Math.PI * 2;
      const wobble =
        1 + 0.16 * Math.sin(3 * t + k * 0.55) + 0.08 * Math.sin(5 * t - k * 0.9) + 0.05 * Math.cos(2 * t + k * 0.35);
      pts.push([ox + Math.cos(t) * r * wobble * 1.18, oy + Math.sin(t) * r * wobble * 0.86]);
    }
    rings.push({
      d: smoothLoop(pts),
      width: k % 4 === 0 ? 0.9 : 0.5,
      opacity: Math.max(0.18, 0.75 - k * 0.04),
    });
  }
  return rings;
}

/** QR modules as one path in module units (runs of dark modules merged per row). */
export function qrModulesPath(text: string): { d: string; size: number } {
  const qr = QRCode.create(text, { errorCorrectionLevel: "M" });
  const size = qr.modules.size;
  const data = qr.modules.data;
  let d = "";
  for (let r = 0; r < size; r++) {
    let c = 0;
    while (c < size) {
      if (!data[r * size + c]) {
        c++;
        continue;
      }
      const start = c;
      while (c < size && data[r * size + c]) c++;
      d += `M${start} ${r}h${c - start}v1h-${c - start}Z`;
    }
  }
  return { d, size };
}
