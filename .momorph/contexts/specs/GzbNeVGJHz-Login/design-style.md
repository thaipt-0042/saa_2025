# Design Style: Login

**Frame ID**: `GzbNeVGJHz`
**Frame Name**: `Login`
**Figma File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**Extracted At**: 2026-05-14

---

## Design Tokens

### Colors

| Token Name | Value | Usage |
|------------|-------|-------|
| `--color-bg-base` | `#00101A` (`rgba(0,16,26,1)`) | Page background |
| `--color-header-bg` | `rgba(11,15,18,0.8)` | Header background (translucent) |
| `--color-cta-primary` | `#FFEA9E` (`rgba(255,234,158,1)`) | Login button background |
| `--color-cta-text` | `#00101A` (`rgba(0,16,26,1)`) | Login button text color |
| `--color-text-primary` | `#FFFFFF` | All body/header/footer text |
| `--color-divider` | `#2E3940` | Footer top border |

### Typography

| Token Name | Font Family | Size | Weight | Line Height | Letter Spacing | Usage |
|------------|-------------|------|--------|-------------|----------------|-------|
| `--font-montserrat` | `Montserrat` | — | — | — | — | Base font variable |
| `--font-montserrat-alt` | `Montserrat Alternates` | — | — | — | — | Footer only |
| Button text | Montserrat | 22px | 700 | 28px | 0px | B.3 button label |
| Tagline | Montserrat | 20px | 700 | 40px | 0.5px | B.2 tagline |
| Language label | Montserrat | 16px | 700 | 24px | 0.15px | A.2 "VN" text |
| Footer text | Montserrat Alternates | 16px | 700 | 24px | 0% | D footer copyright |

> **Both fonts must be loaded via `next/font/google`** (`Montserrat` weight 700, `Montserrat_Alternates` weight 700).

### Spacing

| Component | Padding | Gap |
|-----------|---------|-----|
| Header (A) | `12px 144px` | 238px between logo and lang |
| Content panel (B) | `96px 144px` | 120px between sections |
| B content stack (Frame 550) | `0 0 0 16px` | 24px |
| Login button (B.3) | `16px 24px` | 8px (text ↔ icon) |
| Footer (D) | `40px 90px` | — |

### Border & Radius

| Element | Value |
|---------|-------|
| Login button border-radius | `8px` |
| Language switcher button border-radius | `4px` |
| Footer border-top | `1px solid #2E3940` |

---

## Layout Structure (ASCII)

```
┌─────────────────────────────────────────── 1440px ──────────────────────────────────────────┐
│  A: Header  1440×80px  bg rgba(11,15,18,0.8)  padding 12px 144px                            │
│  ┌──── 52×48 ────┐                                          ┌──── 108×56 ────┐               │
│  │  A.1 Logo     │ ←──────────────────────────────────────→ │  A.2 Language  │              │
│  └───────────────┘  gap: 238px                              └────────────────┘              │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│  C: Background image (1441×1022px, lazy, absolute, full-width)                               │
│  + Rectangle 57 gradient: linear-gradient(90deg, #00101A 0%, #00101A 25.41%, transparent)   │
│  + Cover gradient:        linear-gradient(0deg,  #00101A 22.48%, transparent 51.74%)         │
│                                                                                              │
│  B: Content panel  1440×845px  padding 96px 144px  gap 120px                                │
│  │                                                                                           │
│  │  Frame 487 (1152×653px, gap 80px)                                                        │
│  │  ┌────── B.1: mms_B.1_Key Visual  1152×200px ──────────────────────────────────────────┐ │
│  │  │  ROOT FURTHER logo image  451×200px                                                  │ │
│  │  └──────────────────────────────────────────────────────────────────────────────────────┘ │
│  │                                                                                           │
│  │  ┌────── Frame 550  496×164px  padding 0 0 0 16px  gap 24px ──────────────────────────┐  │
│  │  │  B.2: tagline text  480×80px                                                        │  │
│  │  │  B.3: login button  305×60px                                                        │  │
│  │  │    [LOGIN With Google ]  [G icon 24×24]                                             │  │
│  │  │    └── text 225×28, left-aligned ──┘  └─ icon right side ┘                         │  │
│  │  └────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                              │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│  D: Footer  1440×91px  padding 40px 90px  border-top 1px solid #2E3940                      │
│  "Bản quyền thuộc về Sun* © 2025"   Montserrat Alternates 700 16px                          │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Style Details

### A — Header (`mms_A_Header`, node `662:14391`)

| Property | Value |
|----------|-------|
| Size | 1440×80px |
| Background | `rgba(11,15,18,0.8)` |
| Padding | `12px 144px` |
| Display | flex, row, space-between, center |
| Gap | 238px |
| Position | absolute, z-index 1 |

### A.1 — Logo (`mms_A.1_Logo`, node `I662:14391;186:2166`)

| Property | Value |
|----------|-------|
| Container size | 52×56px |
| Image node | `I662:14391;178:1033;178:1030` |
| Image size | 52×48px |
| Asset | `public/assets/login/logos/saa-logo.png` |
| Next.js | `<Image priority width={52} height={48}>` |

### A.2 — Language Switcher (`mms_A.2_Language`, node `I662:14391;186:1601`)

| Property | Value |
|----------|-------|
| Container size | 108×56px |
| Inner button border-radius | `4px` |
| Inner button padding | `16px` |
| Flag icon | `MM_MEDIA_VN` 24×24px |
| Label font | Montserrat 700, 16px, 24px lh, 0.15px ls, white |
| Chevron icon | `MM_MEDIA_Down` 24×24px |

### C — Background (`mms_C_Keyvisual`, node `662:14388`)

| Layer | Node | CSS |
|-------|------|-----|
| Background image | `662:14389` | `object-fit: cover`, lazy-loaded, absolute, full-screen |
| Horizontal gradient | `662:14392` | `linear-gradient(90deg, #00101A 0%, #00101A 25.41%, rgba(0,16,26,0) 100%)` |
| Vertical gradient | `662:14390` | `linear-gradient(0deg, #00101A 22.48%, rgba(0,19,32,0) 51.74%)` |

> Both gradient overlays are decorative `<div>` elements, `position: absolute`, `inset: 0`, `pointer-events: none`, `z-index` between image and content.

### B.1 — Key Visual (`mms_B.1_Key Visual`, node `662:14395`)

| Property | Value |
|----------|-------|
| Container size | 1152×200px |
| Logo image node | `2939:9548` |
| Logo size | 451×200px |
| Asset | `public/assets/login/logos/root-further-logo.png` |
| Next.js | `<Image priority width={451} height={200}>` |

### B.2 — Tagline (`mms_B.2_content`, node `662:14753`)

| Property | Value |
|----------|-------|
| Size | 480×80px |
| Font | Montserrat 700, 20px, 40px line-height, 0.5px letter-spacing |
| Color | white |
| Text (VN) | `Bắt đầu hành trình của bạn cùng SAA 2025.\nĐăng nhập để khám phá!` |
| i18n key | `login.tagline` |

### B.3 — Login Button (`mms_B.3_Login`, button node `662:14426`)

| Property | Value |
|----------|-------|
| Size | 305×60px |
| Background | `#FFEA9E` |
| Border-radius | `8px` |
| Padding | `16px 24px` |
| Gap (text ↔ icon) | `8px` |
| Display | flex, row, flex-start, center |
| Text | "LOGIN With Google" — 225×28px, left side |
| Text font | Montserrat 700, 22px, 28px line-height, color `#00101A` |
| Google icon | `I662:14426;186:1766`, 24×24px, **right side** |
| Icon asset | `public/assets/login/icons/google-icon.svg` |
| **Layout** | **Text on LEFT, icon on RIGHT** (non-standard — matches Figma) |

**States:**

| State | Changes |
|-------|---------|
| Default | bg `#FFEA9E`, cursor pointer |
| Hover | bg `#FFEA9E` darkened ~10% (`#E6D18C`) |
| Disabled (pending OAuth) | opacity reduced, `cursor: not-allowed` |
| Focus | outline 2px |

### B.err — Error Alert (behavior-only, not in Figma)

Not a Figma node — constructed from spec only. Renders inline above B.3 when `?error=auth_failed`.
- `role="alert"` for screen-reader announcement
- Dismiss button → `router.replace('/login')`

### D — Footer (`mms_D_Footer`, node `662:14447`)

| Property | Value |
|----------|-------|
| Size | 1440×91px |
| Padding | `40px 90px` |
| Border-top | `1px solid #2E3940` |
| Justify-content | space-between |
| Copyright text | "Bản quyền thuộc về Sun* © 2025" |
| Text font | **Montserrat Alternates** 700, 16px, 24px line-height, white |
| i18n key | `footer.copyright` |

---

## Responsive Specifications

| Breakpoint | Changes |
|------------|---------|
| Mobile ≥ 375px | Login card (B content) reflows full-width; button 100% width; header padding reduced |
| Desktop ≥ 1440px | Baseline design (spec dimensions apply) |

---

## Implementation Mapping

| Design Element | Figma Node ID | Asset / Component |
|----------------|---------------|-------------------|
| Page bg | `662:14387` | `bg-[#00101A]` on `<main>` |
| Header | `662:14391` | `app/components/header.tsx` |
| SAA logo image | `I662:14391;178:1033;178:1030` | `public/assets/login/logos/saa-logo.png` |
| Language switcher | `I662:14391;186:1601` | `app/components/language-switcher.tsx` |
| Background image | `662:14389` | `public/assets/login/images/key-visual-bg.jpg` |
| H-gradient overlay | `662:14392` | Decorative `<div>` with CSS gradient |
| V-gradient overlay | `662:14390` | Decorative `<div>` with CSS gradient |
| ROOT FURTHER logo | `2939:9548` | `public/assets/login/logos/root-further-logo.png` |
| Tagline | `662:14753` | `<p>` with `useTranslations('login')` |
| Login button | `662:14426` | `app/login/_components/login-button.tsx` |
| Google icon | `I662:14426;186:1766` | `public/assets/login/icons/google-icon.svg` |
| Footer | `662:14447` | `app/components/footer.tsx` |
