# Implementation Plan: Hệ thống giải (Awards Information)

**Frame**: `zFYDgyj_pD-HeThongGiai`
**Date**: 2026-05-14
**Spec**: `specs/zFYDgyj_pD-HeThongGiai/spec.md`

---

## Summary

Trang `/awards-information` hiển thị tĩnh 6 hạng mục giải thưởng SAA 2025. Trang yêu cầu đăng nhập (SSR redirect). Menu bên trái sticky với scrollspy (`IntersectionObserver`) cho phép điều hướng nhanh đến từng hạng mục. Dữ liệu giải thưởng là static config — không cần API fetch.

---

## Technical Context

**Language/Framework**: TypeScript / Next.js 16 App Router
**Primary Dependencies**: React 19, Tailwind CSS 4, next-intl, @supabase/ssr
**Database**: N/A (static data only)
**Testing**: Vitest (unit/integration), Playwright (E2E)
**State Management**: Local React state (`useState`, `useEffect`, `IntersectionObserver`)
**API Style**: N/A — no API calls for this page

---

## Constitution Compliance Check

| Requirement | Rule | Status |
|---|---|---|
| Server Component default | Principle I | ✅ `page.tsx` và `award-info-block.tsx` là Server Components |
| `'use client'` chỉ khi cần | Principle I | ✅ Chỉ `awards-nav.tsx` là Client Component |
| Design tokens qua CSS vars | Principle II | ✅ Không hardcode hex/px trong component files |
| TDD — test trước implement | Principle III | 📋 Theo plan: test files viết trước |
| SSR auth guard | Principle VI | ✅ `getUser()` trong `page.tsx`, redirect nếu null |
| TypeScript strict | Principle V | ✅ Không dùng `any` |
| WCAG 2.1 AA | Principle VII | ✅ `aria-current`, `aria-label`, `alt` texts |
| Responsive (mobile-first) | Principle VII | ✅ Tailwind responsive prefixes (`lg:`) cho 2-column layout |

**Violations**: Không có.

---

## Architecture Decisions

### Frontend Approach

- **Component Structure**: Feature-based (`app/awards-information/_components/`)
- **Server vs Client split**:
  - `page.tsx` — Server Component: auth guard, static data assembly
  - `award-info-block.tsx` — Server Component: read-only display (no interactivity)
  - `awards-nav.tsx` — **Client Component**: sticky left nav, active state, scrollspy, smooth scroll
- **Styling Strategy**: Tailwind CSS utilities + CSS custom properties (`var(--color-*)`)
- **Page Layout** (`page.tsx` renders theo thứ tự):
  1. `<Header>` — sticky top, pass `currentPath="/awards-information"`, `user`, `role`
  2. Keyvisual hero banner (`313:8437`) — static, decorative
  3. Title section (`313:8453`) — sub-text + main title, static
  4. 2-column content section: `<AwardsNav>` (sticky left) + 6× `<AwardInfoBlock>` (scrollable right)
  5. `<KudosSection>` — reuse from `app/_components/kudos-section.tsx`
  6. `<Footer>`
- **2-Column Layout**: `flex` row trên `lg:` breakpoint; mobile: nav ẩn hoặc xuống top, content full width. Left column sticky với `position: sticky; top: 80px` (header height).
- **Data Fetching**: Không có — import static từ `lib/homepage/awards.config.ts` (extended)

### Backend Approach

- **Auth guard**: `createClient().auth.getUser()` trong Server Component → `redirect('/login')` nếu null
- **No API**: Award data là static TypeScript config, không cần route handler
- **Data extension**: Mở rộng `AwardConfig` interface và `AWARDS` array trong `lib/homepage/awards.config.ts` với các trường mới (`quantity`, `unit`, `value`, `valueLabel`)

### Integration Points

- **Shared Components**:
  - `app/components/header.tsx` — pass `currentPath="/awards-information"`, `user`, `role`
  - `app/components/footer.tsx`
  - `app/_components/kudos-section.tsx` — reuse trực tiếp (cùng layout)
- **Shared Config**: `lib/homepage/awards.config.ts` — extend thêm trường, backward-compatible với Homepage
- **Auth**: `lib/supabase/server.ts` — `createClient()` pattern (đã có)

---

## Project Structure

### Documentation

```text
.momorph/contexts/specs/zFYDgyj_pD-HeThongGiai/
├── spec.md       ✅ Reviewed
├── plan.md       ← This file
└── tasks.md      (next step)
```

### Source Code

```text
# New files
app/awards-information/
├── page.tsx                          # Server Component: auth + layout
└── _components/
    ├── awards-nav.tsx                # Client Component: sticky nav + scrollspy
    ├── awards-nav.test.tsx           # Unit tests (TDD first)
    ├── award-info-block.tsx          # Server Component: single award display
    └── award-info-block.test.tsx     # Unit tests (TDD first)

tests/e2e/
└── awards-information.spec.ts        # E2E: auth guard, nav click, scrollspy, kudos CTA

# Modified files
lib/homepage/awards.config.ts         # Add optional fields to AwardConfig interface:
                                      #   quantity?: string
                                      #   unit?: string
                                      #   value?: string | string[]
                                      #   valueLabel?: string | string[]
                                      # Fill canonical values in AWARDS array (see Phase 1 data table)
```

### Dependencies

Không cần thêm package mới. `IntersectionObserver` là browser native API.

---

## Implementation Strategy

### Phase 0: Asset Verification

**Resolved**: Reuse `imageBg` từ `AwardConfig` làm ảnh đại diện trong `award-info-block.tsx`. Không cần thêm trường `image` mới — `imageBg` là `/assets/homepage/images/award-bg.png` (chung cho tất cả awards hiện tại). Khi có asset riêng 336×336px, chỉ cần update `imageBg` per-award trong config.

Không cần download asset mới — `imageBg` đã có sẵn.

### Phase 1: Data Foundation (không có UI)

Mở rộng `AwardConfig` và `AWARDS` với:
- `quantity: string` — "10", "02", "01"...
- `unit: string` — "Đơn vị", "Tập thể", "Cá nhân", "" (empty cho Signature/MVP)
- `value: string | string[]` — single string hoặc mảng cho Signature 2025
- `valueLabel: string | string[]` — "cho mỗi giải thưởng", ["cá nhân", "tập thể"]

Canonical data (từ spec):

| Slug | Qty | Unit | Value |
|---|---|---|---|
| `top-talent` | "10" | "Đơn vị" | "7.000.000 VNĐ" |
| `top-project` | "02" | "Tập thể" | "15.000.000 VNĐ" |
| `top-project-leader` | "03" | "Cá nhân" | "7.000.000 VNĐ" |
| `best-manager` | "01" | "Cá nhân" | "10.000.000 VNĐ" |
| `signature-2025-creator` | "01" | "" | ["5.000.000 VNĐ", "8.000.000 VNĐ"] |
| `mvp-most-valuable-person` | "01" | "" | "15.000.000 VNĐ" |

### Phase 2: US1 — Award List (P1)

**TDD order**:
1. Viết `award-info-block.test.tsx` (failing) — kiểm tra title, quantity, unit, value render
2. Implement `award-info-block.tsx`
3. Viết `awards-information.spec.ts` E2E — 6 awards hiển thị, auth redirect
4. Implement `app/awards-information/page.tsx` — SSR auth + render 6 blocks

### Phase 3: US2 — Left Navigation + Scrollspy (P1)

**TDD order**:
1. Viết `awards-nav.test.tsx` (failing) — click → activeSlug changes, aria-current, hover, invalid section no-op
2. Implement `awards-nav.tsx`:
   - `useState<string>('top-talent')` cho `activeSlug`
   - `useState<boolean>(false)` cho `isScrolling`
   - `useEffect` với `IntersectionObserver` cho scrollspy
   - `scrollIntoView({ behavior: 'smooth', block: 'start' })` on click
   - `isScrolling` flag debounce ~100ms để tránh scrollspy ghi đè khi click
   - URL hash on mount: đọc `window.location.hash`, set activeSlug + scroll
   - `position: sticky; top: <header-height>` cho sticky behavior
3. Thêm `id={award.slug}` và `scroll-margin-top` trên mỗi section `award-info-block`

### Phase 4: US3 — Sun* Kudos CTA (P2)

Reuse `app/_components/kudos-section.tsx` trực tiếp. Kiểm tra "Chi tiết" link → `/sun-kudos`.

### Phase 5: Polish

- Accessibility audit: `aria-current="true"` trên active nav item, `aria-label` trên nav và button
- Kiểm tra keyboard navigation (Tab focus qua nav items)
- `scroll-margin-top` trên mỗi section để bù chiều cao header sticky (80px)

---

## Integration Testing Strategy

### Test Scope

| Category | Applicable? | Key Scenarios |
|---|---|---|
| UI ↔ Logic | Yes | Click nav → scroll + active state; scrollspy → auto active |
| App ↔ Auth | Yes | Unauthenticated → redirect `/login` |
| UI ↔ Data | Yes | 6 awards render đúng data |
| Navigation | Yes | Chi tiết → `/sun-kudos` same tab |

### Test Scenarios

**Unit (`awards-nav.test.tsx`)**:
- Click menu item → `activeSlug` changes
- `aria-current="true"` chỉ trên item active
- Click với section không tồn tại → không throw error
- Default active = `'top-talent'`

**Unit (`award-info-block.test.tsx`)**:
- Render đúng title, quantity, unit, value
- Signature 2025: render 2 mức giá trị
- `id` prop = slug (anchor target)
- Image alt text đúng

**E2E (`awards-information.spec.ts`)**:
- Unauthenticated → redirect `/login`
- 6 awards hiển thị đúng thứ tự
- Click nav "Best Manager" → cuộn tới section, active state
- URL hash `#top-project` → section active on load
- Click "Chi tiết" → navigate `/sun-kudos`

### Mocking Strategy

| Dependency | Strategy | Rationale |
|---|---|---|
| Supabase auth | Mock trong unit tests | Không cần real auth cho component tests |
| `window.location.hash` | Set trong test | JSDOM/Happy-dom support |
| `IntersectionObserver` | Mock trong unit tests | Không có real scroll trong JSDOM |
| `scrollIntoView` | `vi.fn()` mock | JSDOM không implement |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| `IntersectionObserver` mock phức tạp trong JSDOM | Medium | Medium | Mock global `IntersectionObserver` trong test setup; E2E cover behavior thật |
| `scrollend` event chưa support rộng | Low | Low | Fallback: `setTimeout(100ms)` reset `isScrolling` |
| `kudos-section.tsx` có hardcoded inline styles | Low | Low | Reuse as-is; refactor riêng nếu cần |
| Award images 336x336 chưa có asset | Medium | Low | Fallback: reuse `imageBg` từ homepage config; update khi có asset |

---

## Dependencies & Prerequisites

- [x] `constitution.md` reviewed
- [x] `spec.md` approved (Reviewed status)
- [x] `lib/homepage/awards.config.ts` exists — ready to extend
- [x] `header.tsx`, `footer.tsx`, `kudos-section.tsx` — reusable as-is
- [ ] design-style.md — chưa có; implementer fetch via `query_section` at implementation time
- [ ] Award images 336x336 — verify assets hoặc download via `get_media_files`

---

## Notes

- `kudos-section.tsx` hiện có hardcoded inline styles (pixel values). Không refactor trong scope này — reuse as-is.
- Homepage `award-card.tsx` chỉ dùng `slug`, `title`, `description`, `imageBg`, `imageNameOverlay` — thêm fields mới vào `AwardConfig` là backward-compatible.
- Không thêm `/awards-information` vào `middleware.ts` — SSR redirect trong `page.tsx` là đủ và nhất quán với pattern hiện tại.
- `scroll-margin-top` trên section elements cần bằng header height (80px) + buffer nhỏ.

## Next Steps

1. Run `/momorph.tasks` để tạo task breakdown
2. Review `tasks.md` cho parallel opportunities
3. Begin TDD implementation theo phase order
