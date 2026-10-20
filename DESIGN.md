# Hope Aviation Design System

This is the single source of truth for visual design across the landing site (`/`) and the virtual campus (`/campus`).

It combines two layers:

1. **Hope identity (custom, original)** — taken from the brand materials: the "Hope 0" coming-soon site, the 2025 brochure ("Bringing hope where roads can't reach") and the 2026 summary deck. It defines the logo, colors, photography and tone.
2. **Structural system (adapted from the Meta Store / FDS system)** — fills what the original identity never defined: spacing grid, radii, elevation, component states, form fields, responsive rules and UI neutrals.

Rule of thumb: **identity decides _what it looks like_, structure decides _how it behaves_.** When the two conflict, identity wins.

---

## 1. Brand Identity

### Who we are (tone)

Hope Aviation is a non-profit, faith-based humanitarian project that prepares pilots and volunteers to serve isolated communities. It is **not a flight school** and does not issue licenses. The tone is human, hopeful and honest: real people, real places, real aircraft. Never "cockpit tech", fake live dashboards or invented numbers.

Tagline: **"Bringing hope where roads can't reach."** — Spanish: *"Llevando esperanza donde los caminos no llegan."*

### Logo

- Mark: a slanted parallelogram "H" with an aircraft cut through it, plus the "Hope Aviation" wordmark.
- Files: `public/logos/Hope Black.svg` (on light), `public/logos/Hope Aviation White.webp|png` (on dark/blue/photo), `public/logos/Hope Aviation Small White.webp` (compact).
- On color, the logo is always **white on Hope Blue** or **white on dark/photo**; on white surfaces it is black. Never recolor it orange or place it on busy photography without a scrim.
- Minimum clear space: the height of the "H" mark on every side.

### Photography

Photography is the protagonist: small aircraft in real landscapes (jungle, delta, mountains, Patagonia), people on the ground, missions. Prefer daylight, natural color, a little grain (see the original hero: a plane small in a wide sky, framed by people watching).

- Text over photos always sits on a scrim: `linear-gradient(rgba(0,38,62,0) 0%, rgba(0,38,62,0.65) 100%)` (navy) or 50% black (original "texture-darken").
- Rounded images (20–24px) inside light sections; full-bleed in heroes.
- Circular crops are allowed for collage moments (as in the brochure's financial section).

### Signature graphics

- **Flight-path / contour lines**: thin topographic lines in amber over Hope Blue (2026 deck header). Use as decoration in heroes and section bands only, never behind body text.
- **Alternating color bands**: sections alternate white → amber → photo → blue → black, exactly like the brochure. This replaces Meta's "light/dark product sections".

---

## 2. Color

### Brand colors (identity layer)

| Token | Hex | Tailwind | Role |
|-------|-----|----------|------|
| Hope Navy | `#00263E` | `primary` | Main text on light, headings, primary dark UI surfaces, scrims |
| Hope Blue | `#1749FF` | `accent` | Brand color and **the action color**: primary buttons, links, focus rings, active nav, progress, blue section bands |
| Hope Blue Hover | `#1541E6` | `accent-hover` | Hover on blue buttons |
| Hope Blue Pressed | `#1238C7` | `accent-pressed` | Pressed / active state |
| Hope Amber | `#FFAA00` | `highlight` | "Hope" color: the highlighted word in headlines, amber section bands, contour lines, badges for achievements/certificates |
| Ink | `#0B0F15` | `ink` | Deep dark sections (financial / footer bands), immersive photo sections |
| White | `#FFFFFF` | `background` | Page canvas, cards |

Usage rules:

- **Blue is for doing, amber is for hoping.** Blue marks what you can click; amber marks what matters emotionally (one word in a headline, a milestone, a section band). Amber is never used for a primary button's background in the campus UI.
- On the landing, use amber as the highlight and keep blue mostly for CTAs, the logo tile and one blue band (e.g. Education / Campus). Do not paint large areas blue *and* amber in the same viewport.
- Amber text on white fails contrast for body copy; use it only for display sizes (≥ 28px) or on navy/ink/blue backgrounds.

### UI neutrals (structural layer)

| Token | Hex | Tailwind | Role |
|-------|-----|----------|------|
| Secondary surface | `#F1F4F7` | `secondary` | Section backgrounds, secondary buttons |
| Muted surface | `#F0F2F5` | `muted` | Deemphasized areas, table headers, skeleton base |
| Baby Blue | `#E8F3FF` | `info` | Informational tint (callouts, notices) |
| Muted text | `#65676B` | `muted-foreground` | Labels, metadata, placeholders |
| Divider / input border | `#CED0D4` | `border`, `input` | Borders, separators, input outlines |
| Dark surface | `#1C1E21` | — | Dark cards inside dark sections |

### Semantic

| Token | Hex | Tailwind | Role |
|-------|-----|----------|------|
| Success | `#007D1E` | `success` | Completed lessons, passed exams |
| Warning | `#FFAA00` | `warning` | Shares Hope Amber |
| Destructive | `#E41E3F` | `destructive` | Errors, delete actions |

Always use the Tailwind tokens (`bg-accent`, `text-primary`, `bg-highlight/10`…) instead of hardcoded hex values. Opacity modifiers work on every token.

---

## 3. Typography

**Family:** Montserrat (loaded via `next/font/google` as `--font-montserrat`, exposed as `font-sans`). It matches the 2026 deck headings and the original identity. Fallbacks: Helvetica, Arial, sans-serif.

Two voices from the same family:

- **Editorial (landing, heroes, section titles):** large and *light* — weight 300 at display sizes, as in the brochure ("Who we are?", "Financial Overview"). Highlight one word in amber.
- **Interface (campus, forms, tables):** compact and confident — weight 600–700 with `tracking-tight`.

| Role | Size | Weight | Line height | Notes |
|------|------|--------|-------------|-------|
| Display 1 | 64px (→48→36) | 300 | 1.1 | Landing hero only |
| Display 2 | 48px (→36) | 300 | 1.15 | Section heroes |
| Heading 1 | 32–36px | 700 | 1.2 | Page titles in campus (`Title` component) |
| Heading 2 | 24–28px | 600 | 1.25 | Section titles |
| Heading 3 | 18px | 700 | 1.4 | Card titles |
| Body | 16–18px | 400 | 1.5 | Paragraphs |
| UI label | 14px | 500 | 1.43 | Nav, buttons, form labels |
| Caption | 12–13px | 400–500 | 1.33 | Metadata, legal |

Rules: never use weight 300 below 28px; keep paragraphs to 2–4 lines on the landing; campus copy can be longer but stays within `max-w-2xl` per text column.

---

## 4. Components

All base components live in `components/ui/` and `components/shared/`. Reuse them; the reference page is `/componentsdev`.

### Buttons (`components/ui/button.tsx`)

- **Primary:** pill (`rounded-full`), `bg-accent`, white text, `hover:bg-accent-hover`, `active:bg-accent-pressed active:scale-[0.98]`.
- **Secondary:** pill, `bg-secondary text-primary`, hover darkens slightly.
- **Outline:** pill, 1px `border-border`, transparent background.
- **Ghost / link:** no background, `text-accent`.
- **On dark/photo:** white pill with navy text, or outline white.
- **Destructive:** `bg-destructive` white text.
- Disabled: `bg-[#DEE3E9] text-[#8595A4]`, no hover.
- Focus: `ring-[3px] ring-accent/20`. Min height 40px (44px on touch).

### Cards & containers

- Radius 20px (`rounded-[20px]`), 24px for feature/photo cards.
- White background with 1px `border-border/60`, or `bg-secondary` flat.
- Elevation only on hover or overlays (see §6). No shadows inside dark sections.

### Inputs & forms

- Radius 8–12px, 1px `border-input`, white background, 16px text (prevents iOS zoom).
- Focus: `border-accent` + `ring-[3px] ring-accent/20`. Error: `border-destructive`.
- Placeholder `text-muted-foreground`. Labels above the field, 14px/500.

### Badges

Pill, small (12px/600). Variants map to tokens: `accent/10 + text-accent` (info), `success/10 + text-success`, `highlight/15 + text-primary` (achievement), `destructive/10 + text-destructive`.

### Navigation

- Landing navbar: transparent over the hero photo with the white logo; turns into `bg-white/80 backdrop-blur-xl` with the black logo after scroll. CTA is a blue pill.
- Campus: left sidebar (`CampusSidebar`) on white with `border-r`, active item `bg-accent/10 text-accent`; mobile uses `CampusMobileNav`.

### Progress & learning

- Progress bars: track `bg-muted`, fill `bg-accent`; at 100% switch to `bg-success`.
- Completed lesson: `text-success` check icon. Certificates and final-exam achievements use amber.

---

## 5. Layout & Spacing

- Base unit **8px**. Common steps: 4, 8, 12, 16, 24, 32, 40, 48, 64, 80.
- Section vertical padding: 80px desktop → 64px tablet → 48px mobile.
- Max content width: 1280–1440px centered; text columns `max-w-2xl`.
- Grids: 3 columns desktop → 2 tablet → 1 mobile; gap 24px (16px mobile).
- Mobile gutter: 16px minimum.

### Radius scale

| Value | Use |
|-------|-----|
| 8px | Small controls, chips, inner elements |
| 12px | Inputs, dropdown items |
| 20px | Cards, popovers, sheets |
| 24px | Photo / feature cards |
| full | Buttons, badges, avatars, tags |

---

## 6. Elevation

Mostly flat — separation comes from color bands and borders.

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat | none | Default cards and sections |
| 1 | `0 2px 4px rgba(0,0,0,0.08)` | Hover on interactive cards |
| 2 | `0 12px 28px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)` | Dropdowns, popovers, modals |
| Overlay | `rgba(0,38,62,0.6)` + `backdrop-blur-sm` | Modal backdrop |

---

## 7. Do's and Don'ts

**Do**

- Lead with real photography of aircraft, places and people.
- Use Hope Blue for every primary action and Hope Amber for the emotional highlight.
- Alternate section bands (white / amber / photo / blue / ink) on the landing.
- Keep the honest tone: "examples", "in construction", no fake counters or "LIVE" badges.
- Write every UI string through the i18n system (`es` / `en`).

**Don't**

- Don't use Meta Blue `#0064E0` or any other blue — the only blue is `#1749FF`.
- Don't use amber as a button background in the campus, or amber body text on white.
- Don't recreate cockpit / instrument / dark-tech aesthetics.
- Don't put text on photography without a scrim.
- Don't hardcode hex colors in components — use the tokens in `app/globals.css`.

---

## 8. Responsive

| Breakpoint | Width | Notes |
|------------|-------|-------|
| Mobile | < 768px | 1 column, hamburger nav, display 36px, 48px section padding |
| Tablet | 768–1024px | 2 columns, display 48px |
| Desktop | 1024–1440px | 3 columns, display 64px, 80px section padding; campus sidebar from `xl` |
| Large | > 1440px | Centered max-width container |

Touch targets ≥ 44×44px. Images use `next/image` (or WebP with fallback) and `loading="lazy"` below the fold.
