import { readFile } from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import {
  PDFDocument,
  clip,
  endPath,
  popGraphicsState,
  pushGraphicsState,
  rectangle,
  rgb,
  setCharacterSpacing,
} from "pdf-lib";
import type { Color, PDFFont, PDFPage } from "pdf-lib";
import { SHEET, bandContours, qrModulesPath } from "@/components/features/campus/certificate/geometry";

/**
 * Server-side certificate PDF (A4 landscape) drawn with pdf-lib.
 *
 * Callers pass already-localized strings; this module only lays them out. Contours and
 * the QR come from the shared geometry module so the on-screen sheet matches.
 */

export type CertificatePdfInput = {
  lang: "es" | "en";
  fullName: string;
  courseTitle: string;
  dateLabel: string;
  code: string;
  verifyUrl: string;
  copy: {
    title: string;
    eyebrow: string;
    awardedTo: string;
    forCompleting: string;
    date: string;
    code: string;
    issuedBy: string;
    issuer: string;
    issuerSub: string;
    verify: string;
    scan: string;
  };
};

// Brand tokens (DESIGN.md). Hex is unavoidable here: PDF has no CSS variables.
const NAVY = rgb(0, 38 / 255, 62 / 255);
const AMBER = rgb(1, 170 / 255, 0);
const PAPER = rgb(247 / 255, 244 / 255, 238 / 255);
const WHITE = rgb(1, 1, 1);

/** Navy blended toward paper, for secondary text without transparency groups. */
function navyTint(alpha: number): Color {
  const mix = (a: number, b: number) => a * alpha + b * (1 - alpha);
  return rgb(mix(0, 247 / 255), mix(38 / 255, 244 / 255), mix(62 / 255, 238 / 255));
}

const PAGE_W = SHEET.width;
const PAGE_H = SHEET.height;
const BAND_W = SHEET.band;
const FRAME = SHEET.frame;

type Assets = { display: Uint8Array; body: Uint8Array; bodyBold: Uint8Array; logoSvg: string };

let assetsPromise: Promise<Assets> | null = null;

function loadAssets(): Promise<Assets> {
  if (!assetsPromise) {
    const root = process.cwd();
    assetsPromise = Promise.all([
      readFile(path.join(root, "app/api/certificates/_assets/BricolageGrotesque-Bold.ttf")),
      readFile(path.join(root, "app/api/certificates/_assets/InstrumentSans-Regular.ttf")),
      readFile(path.join(root, "app/api/certificates/_assets/InstrumentSans-Bold.ttf")),
      readFile(path.join(root, "public/logos/hope-logo.svg"), "utf8"),
    ])
      .then(([display, body, bodyBold, logoSvg]) => ({ display, body, bodyBold, logoSvg }))
      .catch((err) => {
        assetsPromise = null;
        throw err;
      });
  }
  return assetsPromise;
}

/** Splits the logo SVG into the "H" mark (polygons) and the wordmark (paths). */
function parseLogo(svg: string): { mark: string[]; wordmark: string[] } {
  const wordmark = [...svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1]);
  const mark = [...svg.matchAll(/<polygon[^>]*\spoints="([^"]+)"/g)].map((m) => {
    const nums = m[1].trim().split(/[\s,]+/).map(Number);
    let d = "";
    for (let i = 0; i + 1 < nums.length; i += 2) d += `${i === 0 ? "M" : "L"}${nums[i]} ${nums[i + 1]} `;
    return `${d}Z`;
  });
  return { mark, wordmark };
}

// hope-logo.svg viewBox: "120 702 1680 516"
const LOGO_BOX = { x: 120, y: 702, w: 1680, h: 516 };

function drawLogo(
  page: PDFPage,
  logo: { mark: string[]; wordmark: string[] },
  opts: { left: number; top: number; width: number; color: Color },
) {
  const s = opts.width / LOGO_BOX.w;
  const x = opts.left - LOGO_BOX.x * s;
  // `top` is measured from the top edge of the page; SVG y grows downwards from (x, y).
  const y = PAGE_H - opts.top + LOGO_BOX.y * s;
  for (const d of [...logo.mark, ...logo.wordmark]) {
    page.drawSvgPath(d, { x, y, scale: s, color: opts.color });
  }
}

/** Replaces characters the embedded subset cannot draw (accents are kept when present). */
function makeSafeText(font: PDFFont) {
  const supported = new Set(font.getCharacterSet());
  const extra: Record<string, string> = { "ł": "l", "Ł": "L", "đ": "d", "Đ": "D", "ħ": "h", "ŧ": "t" };
  return (text: string) =>
    Array.from(text.normalize("NFC"))
      .map((ch) => {
        if (supported.has(ch.codePointAt(0)!)) return ch;
        const base = (extra[ch] ?? ch.normalize("NFD").replace(/[̀-ͯ]/g, "")) || "";
        if (base && Array.from(base).every((c) => supported.has(c.codePointAt(0)!))) return base;
        return /\s/.test(ch) ? " " : "?";
      })
      .join("");
}

function drawTracked(
  page: PDFPage,
  text: string,
  opts: { x: number; y: number; size: number; font: PDFFont; color: Color; tracking: number },
) {
  page.pushOperators(setCharacterSpacing(opts.tracking));
  page.drawText(text, { x: opts.x, y: opts.y, size: opts.size, font: opts.font, color: opts.color });
  page.pushOperators(setCharacterSpacing(0));
}

/** Greedy word wrap. */
function wrap(font: PDFFont, text: string, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (!line || font.widthOfTextAtSize(next, size) <= maxWidth) line = next;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function ellipsize(font: PDFFont, text: string, size: number, maxWidth: number) {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && font.widthOfTextAtSize(`${t}…`, size) > maxWidth) t = t.slice(0, -1);
  return `${t.trimEnd()}…`;
}

/** Shrinks a single line until it fits. */
function fitSize(font: PDFFont, text: string, maxWidth: number, start: number, min: number) {
  let size = start;
  while (size > min && font.widthOfTextAtSize(text, size) > maxWidth) size -= 0.5;
  return size;
}

function clipRect(page: PDFPage, x: number, y: number, w: number, h: number) {
  page.pushOperators(pushGraphicsState(), rectangle(x, y, w, h), clip(), endPath());
}

export async function renderCertificatePdf(input: CertificatePdfInput): Promise<Uint8Array> {
  const assets = await loadAssets();
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  pdf.setTitle(`${input.copy.title} — ${input.fullName}`);
  pdf.setAuthor("Hope Aviation");
  pdf.setSubject(input.courseTitle);
  pdf.setCreator("Hope Aviation Campus");
  pdf.setProducer("Hope Aviation Campus");
  pdf.setLanguage(input.lang === "es" ? "es-AR" : "en-US");

  const display = await pdf.embedFont(assets.display, { subset: true });
  const body = await pdf.embedFont(assets.body, { subset: true });
  const bold = await pdf.embedFont(assets.bodyBold, { subset: true });
  const safeDisplay = makeSafeText(display);
  const safeBody = makeSafeText(body);
  const safeBold = makeSafeText(bold);
  const logo = parseLogo(assets.logoSvg);

  const page = pdf.addPage([PAGE_W, PAGE_H]);

  // Navy page (frame + band), then the paper panel.
  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: NAVY });
  const panel = { x: BAND_W, y: FRAME, w: PAGE_W - BAND_W - FRAME, h: PAGE_H - 2 * FRAME };
  page.drawRectangle({ x: panel.x, y: panel.y, width: panel.w, height: panel.h, color: PAPER });

  // Band: amber contour lines (clipped to the band).
  clipRect(page, 0, 0, BAND_W, PAGE_H);
  for (const ring of bandContours()) {
    page.drawSvgPath(ring.d, {
      x: 0,
      y: PAGE_H,
      borderColor: AMBER,
      borderWidth: ring.width,
      borderOpacity: ring.opacity,
    });
  }
  page.pushOperators(popGraphicsState());

  // Band: logo.
  drawLogo(page, logo, { left: 34, top: 40, width: 148, color: WHITE });

  // Band: verification block (QR tile + URL).
  const qr = qrModulesPath(input.verifyUrl);
  const tile = 92;
  const tileX = 34;
  const tileY = 58;
  page.drawRectangle({ x: tileX, y: tileY, width: tile, height: tile, color: WHITE });
  const quiet = 6;
  const moduleSize = (tile - quiet * 2) / qr.size;
  page.drawSvgPath(qr.d, { x: tileX + quiet, y: tileY + tile - quiet, scale: moduleSize, color: NAVY });

  const bandTextW = BAND_W - 34 * 2;
  drawTracked(page, safeBold(input.copy.verify.toUpperCase()), {
    x: tileX,
    y: tileY + tile + 14,
    size: 7,
    font: bold,
    color: AMBER,
    tracking: 1.2,
  });
  const urlText = safeBody(input.verifyUrl.replace(/^https?:\/\//, ""));
  const urlSize = fitSize(body, urlText, bandTextW, 7.5, 5.5);
  page.drawText(safeBody(input.copy.scan), { x: tileX, y: 40, size: 7.5, font: body, color: rgb(0.78, 0.83, 0.87) });
  page.drawText(urlText, { x: tileX, y: 28, size: urlSize, font: body, color: WHITE });

  // Seam accent between band and panel.
  page.drawRectangle({ x: BAND_W, y: FRAME, width: 3, height: panel.h, color: AMBER });

  // Panel watermark: the "H" mark, very faint, bleeding off the bottom-right corner.
  clipRect(page, panel.x, panel.y, panel.w, panel.h);
  {
    const markW = 330;
    const s = markW / 500; // the mark spans roughly x 120..620 in logo units
    const x = PAGE_W - FRAME - markW * 0.78 - 120 * s;
    const y = FRAME + 260 + 702 * s;
    for (const d of logo.mark) page.drawSvgPath(d, { x, y, scale: s, color: NAVY, opacity: 0.035 });
  }
  page.pushOperators(popGraphicsState());

  // Panel content.
  const left = panel.x + 58;
  const right = panel.x + panel.w - 58;
  const maxW = right - left;
  const top = panel.y + panel.h;

  // Eyebrow with a short amber rule.
  const eyebrowY = top - 58;
  page.drawRectangle({ x: left, y: eyebrowY + 2, width: 22, height: 2.2, color: AMBER });
  drawTracked(page, safeBold(input.copy.eyebrow.toUpperCase()), {
    x: left + 32,
    y: eyebrowY,
    size: 8,
    font: bold,
    color: navyTint(0.6),
    tracking: 1.6,
  });

  const titleText = safeDisplay(input.copy.title);
  const titleSize = fitSize(display, titleText, maxW, 30, 20);
  page.drawText(titleText, { x: left, y: eyebrowY - 42, size: titleSize, font: display, color: NAVY });

  // Recipient.
  const awardedY = top - 184;
  page.drawText(safeBody(input.copy.awardedTo), { x: left, y: awardedY, size: 12, font: body, color: navyTint(0.62) });

  const name = safeDisplay(input.fullName);
  let nameLines = [name];
  let nameSize = fitSize(display, name, maxW, 50, 30);
  if (display.widthOfTextAtSize(name, nameSize) > maxW) {
    // Long names wrap to two lines, shrinking until every word fits; never drop a word
    // unless even the minimum size cannot hold it (then the tail is ellipsized).
    nameSize = 38;
    nameLines = wrap(display, name, nameSize, maxW);
    while (nameLines.length > 2 && nameSize > 22) {
      nameSize -= 1;
      nameLines = wrap(display, name, nameSize, maxW);
    }
    if (nameLines.length > 2) nameLines = [nameLines[0], nameLines.slice(1).join(" ")];
    nameLines = nameLines.map((l) => ellipsize(display, l, nameSize, maxW));
  }
  const nameLead = nameSize * 1.04;
  let cursor = awardedY - 14 - nameSize * 0.78;
  for (const line of nameLines) {
    page.drawText(line, { x: left, y: cursor, size: nameSize, font: display, color: NAVY });
    cursor -= nameLead;
  }
  cursor += nameLead;

  // Rule under the name: hairline with an amber lead segment.
  const ruleY = cursor - 20;
  page.drawRectangle({ x: left, y: ruleY, width: maxW, height: 0.6, color: navyTint(0.18) });
  page.drawRectangle({ x: left, y: ruleY - 0.8, width: 56, height: 2.2, color: AMBER });

  // Course.
  const forY = ruleY - 30;
  page.drawText(safeBody(input.copy.forCompleting), { x: left, y: forY, size: 12, font: body, color: navyTint(0.62) });
  const course = safeBody(input.courseTitle);
  let courseSize = 20;
  let courseLines = wrap(body, course, courseSize, maxW);
  while (courseLines.length > 2 && courseSize > 15) {
    courseSize -= 1;
    courseLines = wrap(body, course, courseSize, maxW);
  }
  if (courseLines.length > 2) {
    courseLines = [courseLines[0], ellipsize(body, courseLines.slice(1).join(" "), courseSize, maxW)];
  }
  let courseY = forY - 12 - courseSize;
  for (const line of courseLines) {
    page.drawText(line, { x: left, y: courseY, size: courseSize, font: body, color: NAVY });
    courseY -= courseSize * 1.25;
  }

  // Footer: date, code, issuer.
  const footerRuleY = panel.y + 92;
  page.drawRectangle({ x: left, y: footerRuleY, width: maxW, height: 0.6, color: navyTint(0.14) });
  const labelY = footerRuleY - 24;
  const valueY = labelY - 19;
  const columns: { label: string; value: string; x: number; w: number; valueFont: PDFFont; sub?: string }[] = [
    { label: input.copy.date, value: input.dateLabel, x: left, w: maxW * 0.36, valueFont: body },
    { label: input.copy.code, value: input.code, x: left + maxW * 0.38, w: maxW * 0.3, valueFont: body },
    {
      label: input.copy.issuedBy,
      value: input.copy.issuer,
      x: left + maxW * 0.7,
      w: maxW * 0.3,
      valueFont: display,
      sub: input.copy.issuerSub,
    },
  ];
  for (const col of columns) {
    drawTracked(page, safeBold(col.label.toUpperCase()), {
      x: col.x,
      y: labelY,
      size: 7,
      font: bold,
      color: navyTint(0.5),
      tracking: 1.4,
    });
    const safe = col.valueFont === display ? safeDisplay : safeBody;
    const value = safe(col.value);
    const size = fitSize(col.valueFont, value, col.w, col.valueFont === display ? 13 : 12, 8);
    page.drawText(value, { x: col.x, y: valueY, size, font: col.valueFont, color: NAVY });
    if (col.sub) {
      page.drawText(safeBody(col.sub), { x: col.x, y: valueY - 13, size: 8.5, font: body, color: navyTint(0.6) });
    }
  }

  return pdf.save();
}
