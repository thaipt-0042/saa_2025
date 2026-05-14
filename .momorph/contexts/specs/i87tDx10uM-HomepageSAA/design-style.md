# Design Style: Homepage SAA

**Frame ID**: `i87tDx10uM`
**Frame Name**: `Homepage SAA`
**Figma File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**Extracted At**: 2026-05-14

---

## Design Tokens

### Colors

| Token Name | Value | Usage |
|------------|-------|-------|
| `--color-bg-base` | `#00101A` | Page background (already in globals.css) |
| `--color-header-bg` | `rgba(11,15,18,0.8)` | Header background translucent (already in globals.css) |
| `--color-cta-primary` | `#FFEA9E` (`rgba(255,234,158,1)`) | CTA button bg, active nav link, award title text, section title text (already in globals.css) |
| `--color-cta-text` | `#00101A` (`rgba(0,16,26,1)`) | CTA button label, Kudos "Chi tiết" text (already in globals.css) |
| `--color-divider` | `#2E3940` (`rgba(46,57,64,1)`) | Awards section header divider, footer border (already in globals.css) |
| `--color-badge` | `#D4271D` (`rgba(212,39,29,1)`) | Notification unread badge dot — **ADD to globals.css** |
| `--color-account-border` | `#998C5F` (`rgba(153,140,95,1)`) | Account icon button border — **ADD to globals.css** |
| `--color-card-glow` | `#FAE287` | Award card box-shadow glow colour — **ADD to globals.css** |
| `--color-countdown-tile-border` | `#FFEA9E` (`rgba(255,234,158,1)`) | Same as `--color-cta-primary`; countdown digit tile border |
| `--color-nav-glow` | `#FAE287` | Active nav link text-shadow glow component — **ADD to globals.css** |

### Typography

| Element | Font Family | Size | Weight | Line Height | Letter Spacing | Usage |
|---------|-------------|------|--------|-------------|----------------|-------|
| Nav link (normal/hover) | Montserrat | 14px | 700 | 20px | 0.1px | A1.2 / A1.3 / A1.5 text |
| Nav link (active/selected) | Montserrat | 14px | 700 | 20px | 0.1px | A1.2 selected; text-shadow: `0 4px 4px rgba(0,0,0,0.25), 0 0 6px #FAE287` |
| CTA button primary (B3.1) | Montserrat | 22px | 700 | 28px | 0px | "ABOUT AWARDS" / "ABOUT KUDOS" labels |
| CTA / Chi tiết button | Montserrat | 16px | 700 | 24px | 0.15px | D2.1 Kudos "Chi tiết" |
| Award card "Chi tiết" link | Montserrat | 16px | 500 | 24px | 0.15px | C2.x.4 "Chi tiết" |
| Coming soon label | Montserrat | 24px | 700 | 32px | 0px | B1.2 label |
| Countdown unit label | Montserrat | 24px | 700 | 32px | 0px | DAYS / HOURS / MINUTES labels |
| Countdown digit | Digital Numbers | ~49px | 400 | — | 0% | B1.3 digit tiles (custom font — see note) |
| Award card title | Montserrat | 24px | 400 | 32px | 0px | C2.x.2 award name |
| Award card description | Montserrat | 16px | 400 | 24px | 0.5px | C2.x.3 description (2-line max) |
| Awards section caption | Montserrat | 24px | 700 | 32px | 0px | C1 "Sun* annual awards 2025" |
| Awards section title | Montserrat | 57px | 700 | 64px | -0.25px | C1 "Hệ thống giải thưởng" in `#FFEA9E` |
| Root Further body | Montserrat | 24px | 700 | 32px | 0px | B4 paragraphs (white) |
| Root Further quote | Montserrat | 20px | 700 | 32px | — | B4 English quote (white, text-align center) |
| Footer copyright | Montserrat Alternates | 16px | 700 | 24px | — | Footer right text |
| Footer nav links | Montserrat | 14px | 700 | 20px | 0.1px | Same as header nav links |

> **Digital Numbers font**: The countdown digits use the "Digital Numbers" font (a 7-segment style display font). It must be loaded via `next/font/google` or as a local font. Check if available on Google Fonts; if not, embed as a local web font in `public/fonts/`. Variable: `--font-digital`.

### Spacing

| Component | Padding | Gap / Notes |
|-----------|---------|-------------|
| Header (A1) | `12px 144px` | — |
| A1.2 selected button | `16px` all sides | bottom border separates from header bottom |
| A1.3 hover button | `16px` all sides | border-radius 4px |
| A1.6 notification button | `10px` | 40×40px total |
| A1.8 account button | `10px` | 40×40px total |
| Hero content area | — | Starts at y≈424 (below header 80px + padding) |
| Countdown container (B1.3) | — | gap: 40px between units |
| Countdown unit | — | gap: 14px between digit tiles and label |
| Countdown digit tile | — | width: 51px, height: 82px |
| B3.1 CTA button | `16px 24px` | width: 276px, height: 60px |
| D2.1 Kudos button | `16px` all sides | width: 126px, height: 56px |
| Award grid rows | — | gap: 80px between rows |
| Award grid columns | — | gap: 80px between cards, justify-content: space-between |
| Award card C2.x | — | gap: 24px (image to text area) |
| Award card text area | — | gap: 4px between title / description / button |
| Award card "Chi tiết" button | `16px 0` (top/bottom) | height: 56px |
| C1 awards header | — | gap: 16px between caption / divider / title |
| Content column | `0 144px` (left/right) | content width: 1224px |
| Footer | `40px 90px` | border-top: 1px solid `--color-divider` |

### Border & Radius

| Element | Value |
|---------|-------|
| A1.3 / A1.5 nav button (hover) | `border-radius: 4px` |
| A1.8 account button | `border: 1px solid #998C5F; border-radius: 4px` |
| A1.6 notification button | `border-radius: 4px` |
| Active nav link (A1.2) | `border-bottom: 1px solid #FFEA9E` (no border-radius) |
| B3.1 CTA button | `border-radius: 8px` |
| D2.1 Kudos button | `border-radius: 4px` |
| Countdown tile | `border: 0.5px solid #FFEA9E; border-radius: 8px; backdrop-filter: blur(16.64px)` |
| Award card image (C2.x.1) | `border: ~1px solid #FFEA9E; border-radius: 24px` |
| Notification badge dot | `border-radius: 100px` (fully round); size: 8×8px |

---

## Layout Structure (ASCII)

```
┌──────────────────────────────── 1512px ────────────────────────────────┐
│  A1: Header  80px  bg rgba(11,15,18,0.8) + backdrop-blur   pad 12px 144px │
│   [Logo 52×48] ── [About SAA 2025★] [Awards Info] [Kudos] ── [🔔] [👤] [VN▼] │
├──────────────────────────────── hero ──────────────────────────────────┤
│  Keyvisual BG (1512×1392px) – absolute, behind content                 │
│  ┌────────────────── content col 144px → 1368px ──────────────────┐    │
│  │ B1.2  "Comming soon"  24px/700  white                          │    │
│  │ B1.3  Countdown   gap:40px                                     │    │
│  │   [0][0]DAYS  [0][0]HOURS  [0][0]MINUTES  (51×82px tiles)     │    │
│  │ B2   18h30 | Nhà hát NTQĐ | Facebook note  (static text)       │    │
│  │ B3.1 [ABOUT AWARDS 276×60 #FFEA9E]                            │    │
│  │ B3.2 [ABOUT KUDOS  #FFEA9E]                                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
├──────────────────────────────── B4 ────────────────────────────────────┤
│  Root Further paragraphs  (180px left, 1152px wide)                    │
│  24px/700 Montserrat white, text-align justified                       │
├──────────────────────────────── C1 ────────────────────────────────────┤
│  "Sun* annual awards 2025"  24px/700  white                            │
│  ──── divider #2E3940 ──────────────────────────────────────────────  │
│  "Hệ thống giải thưởng"  57px/700  #FFEA9E                            │
├──────────────────────────────── C2 ────────────────────────────────────┤
│  Award Grid  1224px  (content col 144px–1368px)                        │
│  Row 1 [C2.1 336px][gap 80px][C2.2 336px][gap 80px][C2.3 336px]       │
│    Card: [Image 336×336 rounded-24 border #FFEA9E glow]               │
│           Title 24px/400 #FFEA9E                                       │
│           Description 16px/400 white 2-line-clamp                     │
│           [Chi tiết ↗]  16px/500 white                                │
│  Row 2 [C2.4 336px][gap 80px][C2.5 336px][gap 80px][C2.6 336px]       │
├──────────────────────────────── D1/D2 ─────────────────────────────────┤
│  Sun* Kudos  bg-image 1120×500px                                       │
│  Kudos logo + description + [Chi tiết 126×56 #FFEA9E border-rad:4px]  │
├──────────────────────────────── Widget ────────────────────────────────┤
│  Fixed bottom-right  pill button  bg #FFEA9E                           │
│  Pen icon | / | Kudos icon                                             │
├──────────────────────────────── Footer ────────────────────────────────┤
│  pad 40px 90px  border-top 1px #2E3940                                 │
│  [Logo 69×64] │ About SAA | Awards Info | Kudos | Tiêu chuẩn chung    │
│                                                │ Bản quyền thuộc về... │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Component Specs

### A1 — Header

- **Node**: `I2167:9091;186:2166` (header INSTANCE)
- Height: 80px; `position: fixed; top: 0`; `padding: 12px 144px`
- Background: `var(--color-header-bg)` + `backdrop-filter: blur(4px)`
- Layout: flex row, space-between; logo left, nav center, controls right

### A1.1 — Logo

- Size: 52×48px; `position: absolute; left: 144px; top: 16px`
- Asset: `MM_MEDIA_Logo` (node `I2167:9091;178:1033;178:1030`)
- Click: navigate to `/`, scroll-to-top

### A1.2 — "About SAA 2025" (active state)

- `padding: 16px; gap: 4px`
- `border-bottom: 1px solid var(--color-cta-primary)`
- Text: `color: var(--color-cta-primary); font-size: 14px; font-weight: 700; text-shadow: 0 4px 4px rgba(0,0,0,0.25), 0 0 6px var(--color-nav-glow)`

### A1.3 / A1.5 — Nav links (hover state)

- `padding: 16px; border-radius: 4px; gap: 4px`
- Background: transparent in normal state; implementation should add semi-transparent bg on hover
- Text: `color: #FFFFFF; font-size: 14px; font-weight: 700; line-height: 20px; letter-spacing: 0.1px`

### A1.6 — Notification Bell

- Button: 40×40px; `padding: 10px; border-radius: 4px; background: transparent`
- Icon: `MM_MEDIA_Noti?=True` (node `I2167:9091;186:2101;186:2020;186:1420`), 24×24px
- Badge: 8×8px; `border-radius: 100%; background: var(--color-badge)` (`#D4271D`); positioned top-right of icon

### A1.8 — Account Icon Button

- Button: 40×40px; `padding: 10px; border-radius: 4px`
- `border: 1px solid var(--color-account-border)` (`#998C5F`); `background: transparent`
- Icon: `MM_MEDIA_User Profile` (node `I2167:9091;186:1597;186:1420`), 24×24px

### B1.2 — "Coming soon" label

- Node: `2167:9036`
- `font-family: Montserrat; font-size: 24px; font-weight: 700; line-height: 32px; color: #FFFFFF`
- Position: left: 144px; visible when `eventStarted === false`

### B1.3 — Countdown Timer

- Node: `2167:9037`; container: `width: 429px; height: 128px; gap: 40px; flex-direction: row`
- Each unit (DAYS/HOURS/MINUTES): `width: 116px; height: 128px; gap: 14px; flex-col`
- Two digit tiles per unit, each: `width: 51px; height: 82px`
  - Tile background: `linear-gradient(180deg, #FFF 0%, rgba(255,255,255,0.10) 100%); opacity: 0.5`
  - Tile border: `0.5px solid var(--color-cta-primary)`; `border-radius: 8px`; `backdrop-filter: blur(16.64px)`
  - Digit text: `font-family: var(--font-digital, 'Digital Numbers'); font-size: 49px; font-weight: 400; color: #FFFFFF`
- Unit label (DAYS/HOURS/MINUTES): `font-size: 24px; font-weight: 700; font-family: Montserrat; line-height: 32px; color: #FFFFFF`

### B3.1 — "ABOUT AWARDS" CTA Button

- Node: `2167:9063`
- `width: 276px; height: 60px; padding: 16px 24px; gap: 8px; border-radius: 8px`
- `background: var(--color-cta-primary)` (`#FFEA9E`)
- Text: `font-size: 22px; font-weight: 700; font-family: Montserrat; line-height: 28px; color: var(--color-cta-text)` (`#00101A`)
- Trailing arrow icon: `MM_MEDIA_Up` 24×24px

### B3.2 — "ABOUT KUDOS" CTA Button

- Same styles as B3.1; text: "ABOUT KUDOS"

### B4 — Root Further Paragraph

- Node: `5001:14827`; container 1152px wide; positioned at `left: 180px`
- Body paragraphs: `font-size: 24px; font-weight: 700; font-family: Montserrat; line-height: 32px; color: #FFFFFF; text-align: justify`
- English quote: `font-size: 20px; font-weight: 700; color: #FFFFFF; text-align: center`

### C1 — Awards Section Header

- Node: `2167:9069`; content-col width 1224px; `gap: 16px; flex-col`
- Caption "Sun* annual awards 2025": `font-size: 24px; font-weight: 700; line-height: 32px; color: #FFFFFF`
- Divider: `height: 1px; background: var(--color-divider)` (`#2E3940`)
- Section title: `font-size: 57px; font-weight: 700; line-height: 64px; letter-spacing: -0.25px; color: var(--color-cta-primary)` (`#FFEA9E`)

### C2 — Award Card Grid

- Node: `5005:14974`; `width: 1224px`
- Two rows (`Frame 491` and `Frame 493`), each: `gap: 80px; flex-direction: row; justify-content: space-between`
- Each card: `width: 336px; gap: 24px; flex-col`

#### C2.x.1 — Card Image

- `width: 336px; height: 336px; border-radius: 24px`
- `border: ~1px solid var(--color-cta-primary)`
- `box-shadow: 0 4px 4px rgba(0,0,0,0.25), 0 0 6px var(--color-card-glow)` (mix-blend-mode: screen)
- Asset: `MM_MEDIA_Award BG` (unique per card, 336×336px square)
- Award name overlay: positioned center (as image asset, not text)

#### C2.x.2 — Card Title

- `font-size: 24px; font-weight: 400; font-family: Montserrat; line-height: 32px; color: var(--color-cta-primary)`

#### C2.x.3 — Card Description

- `font-size: 16px; font-weight: 400; font-family: Montserrat; line-height: 24px; letter-spacing: 0.5px; color: #FFFFFF`
- Max 2 lines — Tailwind: `line-clamp-2`

#### C2.x.4 — "Chi tiết" Link

- `padding: 16px 0; gap: 4px; height: 56px`
- Text: `font-size: 16px; font-weight: 500; font-family: Montserrat; line-height: 24px; letter-spacing: 0.15px; color: #FFFFFF`
- Arrow icon: `MM_MEDIA_Up` 24×24px (white)

### D2.1 — Kudos "Chi tiết" Button

- Node: `I3390:10349;313:8426`
- `width: 126px; height: 56px; padding: 16px; gap: 8px; border-radius: 4px`
- `background: var(--color-cta-primary)` (`#FFEA9E`)
- Text: `font-size: 16px; font-weight: 700; font-family: Montserrat; line-height: 24px; letter-spacing: 0.15px; color: var(--color-cta-text)`

### Widget Button (6)

- Position: `fixed; bottom: right;` (exact position from Figma: bottom-right corner)
- Shape: pill button with `background: var(--color-cta-primary)` (`#FFEA9E`)
- Contains: Pen icon + `/` separator + Kudos logo icon
- Assets: `MM_MEDIA_Pen`, `MM_MEDIA_Kudos Logo`

### Footer (7)

- `padding: 40px 90px; border-top: 1px solid var(--color-divider); background: var(--color-bg-base)`
- Layout: flex row, space-between (logo left, nav links center, copyright right)
- Logo (7.1): 69×64px; asset `MM_MEDIA_Logo` (footer variant)
- Nav link text: same styles as A1.3 (14px/700 Montserrat white)
- Copyright: `font-family: var(--font-montserrat-alt); font-size: 16px; font-weight: 700; line-height: 24px; color: #FFFFFF`

---

## Assets Map

| Asset Name | Node ID | Dimensions | Destination | Usage |
|------------|---------|------------|-------------|-------|
| Keyvisual Background | `2167:9028` | 1512×1392px | `public/assets/homepage/images/keyvisual-bg.webp` | Hero section full-bleed background |
| SAA Logo (header) | `I2167:9091;178:1033;178:1030` | 52×48px | `public/assets/login/logos/saa-logo.png` | Header (already exists from Login) |
| Root Further Logo | `2788:12911` | 451×200px | `public/assets/login/logos/root-further-logo.png` | Hero (already exists from Login) |
| Award BG — Top Talent | `I2167:9075;214:1019;81:2442` | 336×336px | `public/assets/homepage/images/award-top-talent.webp` | C2.1 card image |
| Award BG — Top Project | `I2167:9076;214:1019;81:2442` | 336×336px | `public/assets/homepage/images/award-top-project.webp` | C2.2 card image |
| Award BG — Top Project Leader | `I2167:9077;214:1019;81:2442` | 336×336px | `public/assets/homepage/images/award-top-project-leader.webp` | C2.3 card image |
| Award BG — Best Manager | `I2167:9079;214:1019;81:2442` | 336×336px | `public/assets/homepage/images/award-best-manager.webp` | C2.4 card image |
| Award BG — Signature 2025 Creator | `I2167:9080;214:1019;81:2442` | 336×336px | `public/assets/homepage/images/award-signature-2025-creator.webp` | C2.5 card image |
| Award BG — MVP | `I2167:9081;214:1019;81:2442` | 336×336px | `public/assets/homepage/images/award-mvp.webp` | C2.6 card image |
| Award Name — Top Talent | `I2167:9075;214:1019;214:666;10:951` | ~221×35px | `public/assets/homepage/icons/award-name-top-talent.svg` | C2.1 name overlay |
| Award Name — Top Project | `I2167:9076;214:1019;214:666;214:654` | 232×35px | `public/assets/homepage/icons/award-name-top-project.svg` | C2.2 name overlay |
| Award Name — Top Project Leader | `I2167:9077;214:1019;214:666;214:655` | 232×64px | `public/assets/homepage/icons/award-name-top-project-leader.svg` | C2.3 name overlay |
| Award Name — Best Manager | `I2167:9079;214:1019;214:666;214:656` | 232×30px | `public/assets/homepage/icons/award-name-best-manager.svg` | C2.4 name overlay |
| Award Name — Signature 2025 Creator | `I2167:9080;214:1019;214:666;214:657` | 232×54px | `public/assets/homepage/icons/award-name-signature-2025-creator.svg` | C2.5 name overlay |
| Award Name — MVP | `I2167:9081;214:1019;214:666;214:653` | 116×52px | `public/assets/homepage/icons/award-name-mvp.svg` | C2.6 name overlay |
| Kudos Background | `I3390:10349;313:8416` | 1120×500px | `public/assets/homepage/images/kudos-bg.webp` | D1/D2 section background |
| Kudos Logo | `I3390:10349;329:2948` | 364×72px | `public/assets/homepage/logos/kudos-logo.svg` | D2 logo |
| Footer Logo | `I5001:14800;342:1408;178:1030` | 69×64px | `public/assets/login/logos/saa-logo.png` | Footer (same asset as header — already exists) |
| Notification Icon | `I2167:9091;186:2101;186:2020;186:1420` | 24×24px | `public/assets/homepage/icons/notification.svg` | A1.6 bell |
| User Profile Icon | `I2167:9091;186:1597;186:1420` | 24×24px | `public/assets/homepage/icons/user-profile.svg` | A1.8 account |
| Chevron Down (lang) | `I2167:9091;186:1696;186:1821;186:1441` | 24×24px | `public/assets/login/icons/chevron-down.svg` | A1.7 (already exists) |
| Flag VN | `I2167:9091;186:1696;186:1821;186:1709;178:1010` | 20×15px | `public/assets/login/icons/flag-vn.svg` | A1.7 (already exists) |

---

## globals.css Updates Required

Add these tokens to `app/globals.css` `:root` block:

```css
/* Homepage SAA additions */
--color-badge: #D4271D;          /* notification unread dot */
--color-account-border: #998C5F; /* account icon button border */
--color-card-glow: #FAE287;      /* award card box-shadow glow */
--color-nav-glow: #FAE287;       /* active nav link text-shadow glow */
```

---

## Font Setup Required

The countdown digits use **"Digital Numbers"** — a 7-segment LED display font.

- Check availability on Google Fonts first. If unavailable, use a self-hosted web font.
- If self-hosted: place in `public/fonts/digital-numbers.woff2` and add `@font-face` to `globals.css`.
- Reference in `layout.tsx` CSS variable: `--font-digital`.
- Fallback: `monospace`.

---

## Implementation Notes

1. **Responsive grid**: Award grid is 3-col on desktop (≥1024px) / 2-col on tablet & mobile. Tailwind: `grid-cols-2 lg:grid-cols-3`.
2. **Keyvisual**: Use `<Image>` with `loading="lazy"` (NOT priority) — constitutionally mandated LCP target, hero keyvisual is below-the-fold relative to LCP.
3. **Award card box-shadow glow**: `mix-blend-mode: screen` — apply this to the image element, not the card wrapper, to replicate the Figma glow effect.
4. **Countdown tile opacity**: The tile rectangle has `opacity: 0.5` over the gradient — use a separate `<div>` for the tile bg at 50% opacity, and the digit text at full opacity on top.
5. **"Comming soon" typo**: Figma design says "Comming soon" (double-m typo). Preserve this exact text from the translation file — do not "fix" it without explicit approval.
6. **B4 text**: The Root Further paragraphs are very long (Vietnamese text). The text should come from the i18n `homepage` namespace, not be hardcoded in the component.
7. **Footer logo size**: Footer logo is 69×64px (slightly larger than header's 52×48px) — use separate `<Image width={69} height={64}>`.
