# Feature Specification: Hệ thống giải (Awards Information)

**Frame ID**: `zFYDgyj_pD`
**Frame Name**: `Hệ thống giải`
**File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**Created**: 2026-05-14
**Status**: Reviewed

---

## Overview

Trang `/awards-information` liệt kê toàn bộ 6 hạng mục giải thưởng SAA 2025. Mỗi hạng mục hiển thị
ảnh đại diện, tiêu đề, mô tả, số lượng và giá trị giải. Menu điều hướng cố định bên trái cho phép
nhảy nhanh tới từng hạng mục. Cuối trang có khối quảng bá Sun* Kudos với nút điều hướng.

**Người dùng mục tiêu**: Nhân viên Sun* đã đăng nhập (authenticated).  
**Quyền truy cập**: Yêu cầu đăng nhập — truy cập không xác thực bị chuyển hướng về `/login`.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Xem danh sách hạng mục giải thưởng (Priority: P1)

Nhân viên Sun* đã đăng nhập muốn đọc thông tin về 6 hạng mục giải thưởng SAA 2025 (tiêu chí, số
lượng, giá trị) để hiểu cơ cấu giải thưởng của công ty.

**Why this priority**: Đây là nội dung cốt lõi duy nhất của trang; không có story này thì trang không có giá trị.

**Independent Test**: Truy cập `/awards-information` với session hợp lệ → 6 thẻ giải thưởng hiển thị với đầy đủ tiêu đề, mô tả, số lượng, giá trị.

**Acceptance Scenarios**:

1. **Given** người dùng đã đăng nhập, **When** truy cập `/awards-information`, **Then** trang hiển thị 6 thẻ giải thưởng theo thứ tự: Top Talent, Top Project, Top Project Leader, Best Manager, Signature 2025 - Creator, MVP.
2. **Given** trang đã tải, **When** người dùng đọc thẻ Top Talent, **Then** thấy: tiêu đề "Top Talent", mô tả tiêu chí, số lượng "10", đơn vị "Đơn vị", giá trị "7.000.000 VNĐ".
3. **Given** trang đã tải, **When** người dùng đọc thẻ Top Project, **Then** thấy: số lượng "02", đơn vị "Tập thể", giá trị "15.000.000 VNĐ".
4. **Given** trang đã tải, **When** người dùng đọc thẻ Top Project Leader, **Then** thấy: số lượng "03", đơn vị "Cá nhân", giá trị "7.000.000 VNĐ".
5. **Given** trang đã tải, **When** người dùng đọc thẻ Best Manager, **Then** thấy: số lượng "01", đơn vị "Cá nhân", giá trị "10.000.000 VNĐ".
6. **Given** trang đã tải, **When** người dùng đọc thẻ Signature 2025 - Creator, **Then** thấy: số lượng "01", hai mức giá trị "5.000.000 VNĐ" (cá nhân) và "8.000.000 VNĐ" (tập thể).
7. **Given** trang đã tải, **When** người dùng đọc thẻ MVP, **Then** thấy: tiêu đề "MVP (Most Valuable Person)", số lượng "01", giá trị "15.000.000 VNĐ".
8. **Given** người dùng CHƯA đăng nhập, **When** truy cập `/awards-information`, **Then** được chuyển hướng về `/login`.
9. **Given** người dùng đã đăng nhập, **When** truy cập `/awards-information#top-project` (URL có hash), **Then** trang tự động cuộn tới section Top Project và menu item "Top Project" ở trạng thái active.

---

### User Story 2 — Điều hướng nhanh tới hạng mục bằng menu bên trái (Priority: P1)

Nhân viên muốn nhảy trực tiếp tới hạng mục giải cụ thể mà không cần cuộn thủ công.

**Why this priority**: Với 6 hạng mục dài, menu điều hướng là UX cốt lõi để trải nghiệm không gián đoạn.

**Independent Test**: Click từng item trong menu → trang cuộn tới đúng section, item được active.

**Acceptance Scenarios**:

1. **Given** trang đã tải, **When** click "Top Talent" trong menu, **Then** trang cuộn tới section Top Talent và menu item "Top Talent" chuyển sang trạng thái active (indicator được bật: highlighted + underlined); các item khác không active.
2. **Given** "Top Talent" đang active, **When** click "MVP" trong menu, **Then** trang cuộn tới section MVP, "MVP" active, "Top Talent" mất active.
3. **Given** trang đã tải, **When** di chuột (hover) qua bất kỳ menu item, **Then** item đó được highlight.
4. **Given** người dùng click menu item hợp lệ, **When** section tương ứng tồn tại, **Then** không có lỗi JavaScript nào xảy ra và trang không reload.
5. **Given** menu item bị trỏ tới section không tồn tại (edge case), **When** click, **Then** không có lỗi JS, trang giữ nguyên vị trí.
6. **Given** trang đã tải, **When** người dùng cuộn thủ công đến section "Best Manager", **Then** menu item "Best Manager" tự động chuyển sang active, các item khác mất active.
7. **Given** người dùng vừa click menu item "Top Project" (programmatic scroll), **When** trang đang cuộn tới section Top Project, **Then** scrollspy không trigger ghi đè — `activeSlug` giữ nguyên "top-project" cho đến khi scroll dừng.

---

### User Story 3 — Điều hướng tới Sun* Kudos (Priority: P2)

Nhân viên muốn tìm hiểu thêm về chương trình Sun* Kudos từ banner cuối trang.

**Why this priority**: Secondary CTA — quan trọng nhưng không chặn trải nghiệm chính.

**Independent Test**: Click "Chi tiết" trong banner Sun* Kudos → điều hướng tới `/sun-kudos`.

**Acceptance Scenarios**:

1. **Given** trang đã tải và người dùng cuộn xuống cuối, **When** thấy banner Sun* Kudos, **Then** banner hiển thị: label "Phong trào ghi nhận", tiêu đề "Sun* Kudos", mô tả ngắn, nút "Chi tiết".
2. **Given** banner Sun* Kudos hiển thị, **When** click nút "Chi tiết", **Then** người dùng được điều hướng tới `/sun-kudos` trong cùng tab (Next.js client-side navigation, không mở tab mới).
3. **Given** URL `/sun-kudos` không khả dụng, **When** click "Chi tiết", **Then** hiển thị trang lỗi thân thiện (404) thay vì crash.

---

### Edge Cases

- Nếu dữ liệu giải thưởng được load từ API và API trả về lỗi → hiển thị fallback (data tĩnh hoặc thông báo lỗi không phá vỡ layout).
- Nếu anchor ID của section không tồn tại trong DOM → `scrollIntoView` không được gọi, trang giữ nguyên.
- Nếu người dùng đã đăng nhập nhưng session hết hạn giữa chừng → page refresh sẽ redirect về `/login`.

---

## UI/UX Requirements *(from Figma)*

### Screen Components

| Node ID | Component | Type | Interactions |
|---|---|---|---|
| `313:8437` | Keyvisual (Banner chính) | Hero banner | Trang trí, không interactive. Alt text: "Keyvisual Sun* Annual Award 2025" |
| `313:8453` | Title hệ thống giải thưởng | Label | Static. Hiển thị sub-text + tiêu đề chính |
| `313:8459` | Menu list (C) | Left navigation | Click item → scroll to section + set active. Hover → highlight |
| `313:8460` | C.1 Top Talent | Nav item | Click → scroll to D.1, set active |
| `313:8461` | C.2 Top Project | Nav item | Click → scroll to D.2, set active |
| `313:8462` | C.3 Top Project Leader | Nav item | Click → scroll to D.3, set active |
| `313:8463` | C.4 Best Manager | Nav item | Click → scroll to D.4, set active |
| `313:8464` | C.5 Signature 2025 | Nav item | Click → scroll to D.5, set active |
| `313:8465` | C.6 MVP | Nav item | Click → scroll to D.6, set active |
| `313:8467` | D.1 Top Talent | Info block | Read-only. Image + title + description + quantity + value |
| `313:8468` | D.2 Top Project | Info block | Read-only |
| `313:8469` | D.3 Top Project Leader | Info block | Read-only |
| `313:8470` | D.4 Best Manager | Info block | Read-only |
| `313:8471` | D.5 Signature 2025 - Creator | Info block | Read-only. Hai mức giá trị: cá nhân + tập thể |
| `313:8510` | D.6 MVP | Info block | Read-only |
| `335:12023` | D1 Sun* Kudos block | Promo block | Click "Chi tiết" → navigate to `/sun-kudos` |
| `I335:12023;313:8426` | D2.1 Button "Chi tiết" | CTA button (text_link) | Click → `/sun-kudos` |

### Navigation Flow

- **Entry points**: `/` (Homepage CTA "ABOUT AWARDS" / award card "Chi tiết" links) → `/awards-information`; `/` award card → `/awards-information#{slug}`
- **Exit points**: Button "Chi tiết" (D2.1) → `/sun-kudos`; Header nav → `/`, `/sun-kudos`
- **Auth guard**: Unauthenticated → redirect `/login`

### Active State — Menu Items

- Exactly one item active at a time.
- Active indicator: highlighted + underlined (visual treatment defined in design-style.md).
- Default active: item đầu tiên ("Top Talent") khi trang mới mở, hoặc item tương ứng với URL hash (nếu có).
- Scrollspy: khi người dùng cuộn thủ công, menu item tương ứng với section đang hiển thị trong viewport tự động chuyển sang active. Implement bằng `IntersectionObserver`.

---

## Data Requirements

### Award Info Block (mỗi thẻ giải thưởng)

| Field | Type | Source | Notes |
|---|---|---|---|
| `slug` | `string` | Static config | Dùng làm anchor ID (e.g. `top-talent`) |
| `title` | `string` | Static config | Tên giải thưởng |
| `description` | `string` | Static config | Mô tả tiêu chí và ý nghĩa |
| `image` | `string` (asset path) | Static asset | Hình ảnh/biểu tượng giải thưởng |
| `quantity` | `string` | Static config | Số lượng giải (e.g. "10", "02", "01") |
| `unit` | `string` | Static config | Đơn vị (e.g. "Đơn vị", "Tập thể", "Cá nhân") |
| `value` | `string \| string[]` | Static config | Giá trị VNĐ; mảng nếu có nhiều mức (Signature 2025) |
| `valueLabel` | `string \| string[]` | Static config | Label cho từng mức giá trị (e.g. "cho mỗi giải thưởng", "cá nhân", "tập thể") |

**Canonical award data** (từ design items và test cases):

| Slug | Title | Qty | Unit | Value |
|---|---|---|---|---|
| `top-talent` | Top Talent | 10 | Đơn vị | 7.000.000 VNĐ |
| `top-project` | Top Project | 02 | Tập thể | 15.000.000 VNĐ |
| `top-project-leader` | Top Project Leader | 03 | Cá nhân | 7.000.000 VNĐ |
| `best-manager` | Best Manager | 01 | Cá nhân | 10.000.000 VNĐ |
| `signature-2025-creator` | Signature 2025 - Creator | 01 | — | 5.000.000 VNĐ (cá nhân) / 8.000.000 VNĐ (tập thể) |
| `mvp-most-valuable-person` | MVP (Most Valuable Person) | 01 | — | 15.000.000 VNĐ |

### Sun* Kudos Block

| Field | Type | Source |
|---|---|---|
| `label` | `string` | Static | "Phong trào ghi nhận" |
| `title` | `string` | Static | "Sun* Kudos" |
| `description` | `string` | Static / i18n |
| `ctaLabel` | `string` | Static / i18n | "Chi tiết" |
| `ctaHref` | `string` | Static | `/sun-kudos` |

---

## API Requirements (Predicted)

Dữ liệu giải thưởng là **static config** — không cần API fetch. Menu navigation và scroll là
**client-side behavior** thuần.

| Endpoint | Method | Purpose | Triggered by |
|---|---|---|---|
| _(none)_ | — | Award data is static TypeScript config (`lib/homepage/awards.config.ts`) | Page render |
| `supabase.auth.getUser()` | — | Verify session for auth guard | Page mount (SSR) |

> Nếu trong tương lai award data được quản lý qua CMS: `GET /api/awards` — trả về mảng AwardConfig.

---

## State Management

### Client-Side State

| State | Type | Scope | Notes |
|---|---|---|---|
| `activeSlug` | `string` | Local (menu component) | Slug của award item đang active trong menu; default: `'top-talent'` |
| `isScrolling` | `boolean` | Local | Tránh scrollspy trigger khi đang scroll programmatic do click menu |

### Server-Side (SSR)

- Session check: `createClient().auth.getUser()` trong Server Component — nếu không có user → `redirect('/login')`.
- Award data: import static từ `lib/homepage/awards.config.ts` — không cần fetch.

### URL Hash Handling

- Nếu URL có hash (e.g. `/awards-information#top-talent`), khi trang load:
  - Scroll tới section có `id="top-talent"`.
  - Set `activeSlug = 'top-talent'`.
- Hash được set bởi links từ Homepage award cards.

---

## Technical Requirements

### Authentication

- **Route**: Yêu cầu đăng nhập (theo test case ID-0/ID-1).
- **Guard**: SSR redirect trong `app/awards-information/page.tsx` — gọi `createClient().auth.getUser()`; nếu `null` → `redirect('/login')`. Không thêm vào `middleware.ts` (nhất quán với pattern hiện tại).

### Sticky Menu

- Menu bên trái (`313:8459`) phải sticky — cố định trong viewport khi user cuộn trang.
- Implement bằng `position: sticky` với `top` bằng chiều cao header.

### Scroll Behavior

- `element.scrollIntoView({ behavior: 'smooth', block: 'start' })` khi click menu item.
- `block: 'start'` với offset bù header cố định (`padding-top` hoặc `scroll-margin-top` trên section).

### Scrollspy

- Dùng `IntersectionObserver` để detect section nào đang trong viewport khi user cuộn thủ công.
- Khi click menu item, set `isScrolling = true` để tắt scrollspy trong thời gian programmatic scroll, tránh ghi đè `activeSlug`.
- `isScrolling` reset về `false` sau khi scroll hoàn tất (debounce ~100ms hoặc listen `scrollend` event).

### Accessibility

- Menu list: `<nav role="navigation" aria-label="Danh mục giải thưởng">`.
- Active item: `aria-current="true"` trên item đang active.
- Award images: `alt` mô tả nội dung (e.g. `alt="Top Talent award image"`).
- Keyvisual: `alt="Keyvisual Sun* Annual Award 2025"`.
- "Chi tiết" button: `aria-label="Xem chi tiết Sun* Kudos"`.

### Security (OWASP)

- Trang chỉ đọc, không có input → không có XSS/injection surface.
- Session validation phía server (SSR) trước khi render, không chỉ client-side check.

---

## Dependencies

- **Constitution**: Principle I (Server Component default), II (design tokens), III (TDD), VI (auth guard SSR).
- **Reuses**: `lib/homepage/awards.config.ts` (AWARDS static config) — đã có từ Homepage SAA.
- **Reuses**: `app/components/header.tsx`, `app/components/footer.tsx` — enhanced version từ Homepage.
- **Reuses**: `app/_components/kudos-section.tsx` — hoặc tạo variant phù hợp layout trang này.
- **Navigates to**: `/sun-kudos` (`MaZUn5xHXZ` — Sun* Kudos Live Board).
- **Navigated from**: `/` (Homepage) via award card links và CTA "ABOUT AWARDS".

---

## Resolved Decisions

- **MVP slug**: Sử dụng `mvp-most-valuable-person` — khớp với `lib/homepage/awards.config.ts` đã được implement ở Homepage SAA. SCREENFLOW.md dùng `#mvp` là provisional và sẽ được cập nhật.
- **"Chi tiết" navigation**: Same-tab Next.js client navigation tới `/sun-kudos` (không mở tab mới).
- **Auth requirement**: `/awards-information` YÊU CẦU đăng nhập — xác nhận bởi test cases ID-0/ID-1. SCREENFLOW.md đã được cập nhật.
- **Test case URL**: Test cases dùng `/he-thong-giai` (cũ). Route chính thức là `/awards-information` (per SCREENFLOW.md).
- **Middleware guard**: Dùng SSR redirect trong `page.tsx` — nhất quán với pattern hiện tại của dự án (không thêm vào middleware.ts).
- **Sticky menu**: Menu bên trái cố định (sticky) khi cuộn — implement bằng `position: sticky`.
- **Scrollspy**: Menu item tự động active theo section trong viewport khi cuộn thủ công — implement bằng `IntersectionObserver`.
