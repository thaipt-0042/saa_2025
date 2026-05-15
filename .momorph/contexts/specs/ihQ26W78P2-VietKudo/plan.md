# Implementation Plan: Viết Kudo

**Frame**: `ihQ26W78P2-VietKudo`
**Date**: 2026-05-15
**Spec**: `specs/ihQ26W78P2-VietKudo/spec.md`

---

## Summary

Modal form cho phép người dùng đã đăng nhập gửi Kudo (lời cảm ơn) đến đồng đội từ màn hình `/sun-kudos`. Form bao gồm: autocomplete tìm người nhận, rich text editor với @mention và định dạng văn bản, hashtag picker (predefined list), image upload lên Supabase Storage (tối đa 5 ảnh), và tùy chọn ẩn danh. Submit gọi `POST /api/kudos`, sau đó refresh feed.

Approach: Client Component modal overlay trên `/sun-kudos` (không dùng intercepting route), Tiptap cho rich text, Supabase Storage cho ảnh, TDD với Vitest.

---

## Technical Context

**Language/Framework**: TypeScript 5 / Next.js 16 App Router
**Primary Dependencies**: React 19, Tailwind CSS 4, Zod 4, `@supabase/ssr`, `@tiptap/react`, `isomorphic-dompurify`
**Database**: Supabase (PostgreSQL via Supabase client)
**Testing**: Vitest + @testing-library/react (unit/integration), Playwright (E2E)
**State Management**: Local component state only (`useState`, `useRef`, `useReducer` nếu phức tạp)
**API Style**: Next.js Route Handlers (REST)

---

## Constitution Compliance Check

*GATE: Must pass before implementation can begin*

- [x] Component-First Architecture (Principle I): Modal là Client Component trong `app/sun-kudos/_components/`. Server Component mặc định cho page. URL `/sun-kudos` lấy từ SCREENFLOW.md
- [x] Styling via Design Tokens (Principle II): Tailwind utilities + `var(--color-*)` từ `globals.css`. Không hardcode hex/px
- [x] TDD (Principle III): Vitest tests viết trước implementation. Test confirm failing → implement → confirm passing
- [x] Layered Backend (Principle IV): Route handlers mỏng → delegate service layer. Services testable độc lập. Supabase qua `createServerClient`
- [x] Clean Code (Principle V): TypeScript strict, no `any`, Zod validation tại API boundary, file size ≤ 200 lines
- [x] Security OWASP (Principle VI): DOMPurify server-side cho rich text. `dangerouslySetInnerHTML` cần sanitization. Supabase Auth check server-side tại route handler. File MIME validation
- [x] Platform UI Compliance (Principle VII): Responsive, WCAG 2.1 AA (focus trap, aria-*, keyboard nav), Core Web Vitals

**Violations (new dependencies cần justify):**

| Dependency | Justification | Alternative Rejected |
|------------|---------------|---------------------|
| `@tiptap/react` + `@tiptap/starter-kit` + `@tiptap/extension-mention` | FR-003 yêu cầu rich text (bold/italic/strike/list/link/blockquote) + @mention. Tiptap là TypeScript-first, headless, có @mention built-in. Cần ProseMirror foundation | **Quill.js**: không TypeScript-first, @mention cần plugin bên thứ 3, ít maintained. **Slate.js**: API phức tạp, không có built-in @mention. **ContentEditable thuần**: quá low-level, XSS risk cao |
| `isomorphic-dompurify` | TR-004+TR-006 yêu cầu XSS sanitization cho rich text HTML cả server và client. DOMPurify là OWASP-recommended, `isomorphic-dompurify` hoạt động ở cả Node.js (route handler) và browser | **Manual regex sanitization**: brittle, không đủ bảo vệ theo OWASP. **`dompurify` thuần**: chỉ chạy được ở browser, không dùng được ở server-side route handler |

---

## Architecture Decisions

### Frontend Approach

- **Modal Pattern**: Native HTML `<dialog>` element để có focus trap và Escape built-in; hoặc `div` với `role="dialog"` + custom focus trap hook (tuỳ browser support). Dùng `<dialog>` nếu all target browsers support; fallback `div` + focus trap hook
- **Component Structure**: Feature-based trong `app/sun-kudos/_components/`. Mỗi sub-concern có file riêng (recipient-search, hashtag-picker, image-uploader, rich-text-editor)
- **Styling Strategy**: Tailwind utilities + CSS vars từ `globals.css`. Design tokens fetch từ Figma via `query_section` lúc implement từng component
- **State**: Tất cả form state trong `write-kudo-modal.tsx` (top-level Client Component của modal); truyền xuống sub-components qua props + callbacks. Không cần global store
- **Debounce**: Custom `useDebounce` hook (~10 lines) trong `lib/hooks/use-debounce.ts` — không cần lodash

### Backend Approach

- **API Design**: REST Route Handlers trong `app/api/`
  - `GET /api/users/search?q={query}` — tìm kiếm user cho autocomplete + @mention (reuse endpoint)
  - `GET /api/hashtags?locale={vi|en}` — danh sách hashtag localized (fallback `vi`); trả `{ id, name }[]`
  - `POST /api/kudos` — tạo Kudo mới
- **Data Access**: Service layer trong `lib/kudos/` + `lib/users/` — inject `SupabaseClient` (pattern theo `notification-service.ts`)
- **Validation**: Zod schema tại mỗi route handler boundary (pattern theo `notifications/unread-count/route.ts`)
- **Sanitization**: `isomorphic-dompurify` trong `kudo-service.ts` trước khi lưu vào DB

### Integration Points

- **Existing Services**: `lib/supabase/server.ts` (`createClient`), `lib/supabase/client.ts` (cho image upload client-side)
- **Image Upload**: Client-side upload trực tiếp tới Supabase Storage bucket `kudo-images` bằng `createClient()` → lấy URL → gửi URL trong payload
- **Auth**: `supabase.auth.getUser()` trong mỗi route handler (pattern theo `notifications/unread-count/route.ts`)
- **Feed Refresh**: `router.refresh()` sau submit thành công (Next.js App Router, không cần global store)
- **Shared Components**: Header/Footer từ `app/components/`

---

## Project Structure

### Documentation

```text
.momorph/contexts/specs/ihQ26W78P2-VietKudo/
├── spec.md          # Feature spec (Reviewed v1)
├── plan.md          # This file
└── tasks.md         # Task breakdown (next step)
```

### New Files

| File | Purpose |
|------|---------|
| `app/sun-kudos/page.tsx` | `/sun-kudos` Live Board — Server Component (auth guard + feed data) |
| `app/sun-kudos/_components/write-kudo-button.tsx` | Nút "Viết Kudo" trigger, nhận `onClick` prop |
| `app/sun-kudos/_components/write-kudo-modal.tsx` | Modal container — Client Component, orchestrate form + delegate state tới `use-kudo-form` hook |
| `app/sun-kudos/_components/use-kudo-form.ts` | Custom hook chứa toàn bộ form state + handlers (tách khỏi modal để giữ file ≤ 200 dòng) |
| `app/sun-kudos/_components/recipient-search-input.tsx` | Autocomplete input cho trường Người nhận |
| `app/sun-kudos/_components/hashtag-picker.tsx` | Hashtag chip picker (select from predefined list) |
| `app/sun-kudos/_components/image-uploader.tsx` | Image upload + thumbnail management |
| `app/sun-kudos/_components/rich-text-editor.tsx` | Tiptap wrapper với toolbar + @mention |
| `app/sun-kudos/_components/mention-suggestion-list.tsx` | React Portal component render dropdown gợi ý @mention cho Tiptap |
| `app/sun-kudos/_components/toast-notification.tsx` | Toast component hiển thị lỗi submit/upload (không có sẵn trong codebase) |
| `app/sun-kudos/_components/write-kudo-modal.test.tsx` | Unit tests cho modal (TDD) |
| `app/sun-kudos/_components/use-kudo-form.test.ts` | Unit tests cho form hook — validation logic, state transitions |
| `app/sun-kudos/_components/recipient-search-input.test.tsx` | Unit tests recipient search |
| `app/sun-kudos/_components/hashtag-picker.test.tsx` | Unit tests hashtag picker |
| `app/sun-kudos/_components/image-uploader.test.tsx` | Unit tests image uploader |
| `app/sun-kudos/_components/rich-text-editor.test.tsx` | Unit tests rich text editor — toolbar toggles, @mention trigger |
| `lib/kudos/kudo-types.ts` | TypeScript types: `Kudo`, `KudoPayload`, `ImageUploadState`, `HashtagItem` |
| `lib/kudos/kudo-service.ts` | `createKudo()` — validate + sanitize + gọi Supabase |
| `lib/kudos/kudo-service.test.ts` | Unit tests kudo-service |
| `lib/users/user-search-service.ts` | `searchUsers(query, supabase)` — tìm kiếm user |
| `lib/users/user-search-service.test.ts` | Unit tests user-search-service |
| `lib/kudos/hashtag-service.ts` | `getHashtags(locale, supabase)` — lấy danh sách hashtag localized theo `vi`/`en` |
| `lib/kudos/hashtag-service.test.ts` | Unit tests hashtag-service |
| `lib/hooks/use-debounce.ts` | Shared `useDebounce<T>(value, delay)` hook — dùng bởi recipient search và @mention |
| `app/api/kudos/route.ts` | `POST /api/kudos` route handler — auth check, Zod validate, delegate `kudo-service` |
| `app/api/users/search/route.ts` | `GET /api/users/search?q=` route handler — auth check, trim query |
| `app/api/hashtags/route.ts` | `GET /api/hashtags?locale={vi\|en}` route handler — read locale param, fallback `vi`, return `{ id, name }[]` |

### Modified Files

| File | Changes |
|------|---------|
| `package.json` | Add `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-mention`, `@tiptap/pm`, `isomorphic-dompurify`, `@types/dompurify` |
| `app/globals.css` | Thêm design tokens cho modal overlay, dialog background, toast — fetch từ Figma via `query_section` lúc implement |

### New Directories

| Directory | Purpose |
|-----------|---------|
| `lib/hooks/` | Shared React hooks (hiện chưa tồn tại); bắt đầu với `use-debounce.ts` |
| `app/sun-kudos/_components/` | Feature-based components cho `/sun-kudos` screen |

### Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@tiptap/react` | ^2.x | React integration cho Tiptap rich text editor |
| `@tiptap/starter-kit` | ^2.x | Bundle extension (bold, italic, strike, list, blockquote, link) |
| `@tiptap/extension-mention` | ^2.x | @mention functionality trong editor |
| `@tiptap/pm` | ^2.x | ProseMirror peer dep (thường kèm theo tiptap) |
| `isomorphic-dompurify` | ^2.x | XSS sanitization server + client |
| `@types/dompurify` | ^3.x | TypeScript types cho DOMPurify |

---

## Implementation Strategy

### Phase 0: Asset Preparation

- Dùng `list_media_nodes` trên frameId `ihQ26W78P2` để tìm icon assets (icon camera, x button, v.v.)
- Download icons cần thiết vào `public/assets/sun-kudos/icons/`
- Ghi chú: design-style.md sẽ được fetch từng phần via `query_section` trong khi implement từng component (không có file riêng — pattern design-style-on-demand theo spec guidelines)

### Phase 1: Foundation (API + Services, TDD)

**Goal**: Backend infrastructure sẵn sàng để UI tích hợp.

- Install dependencies (`@tiptap/*`, `isomorphic-dompurify`, `@types/dompurify`)
- **Tạo DB migration**: `kudos` table + `hashtags` table + RLS policies (bắt buộc trước khi test API routes)
- Verify `profiles` table schema (dùng `profile-service.ts` làm reference — `id, full_name, avatar_url`)
- Tạo TypeScript types (`lib/kudos/kudo-types.ts`) — `Kudo`, `KudoPayload`, `ImageUploadState`, `HashtagItem`
- Tạo `lib/hooks/` directory + implement `use-debounce.ts`
- Implement + test `user-search-service.ts` — query `profiles` table (TDD)
- Implement + test `hashtag-service.ts` — `getHashtags(locale, supabase)` trả `{ id, name }[]` (TDD)
- Implement + test `kudo-service.ts` — `createKudo()` + DOMPurify sanitize (TDD, mock Supabase)
- Implement route handlers với Zod validation: `POST /api/kudos`, `GET /api/users/search?q=`, `GET /api/hashtags?locale=`
- Tạo `/sun-kudos/page.tsx` — Server Component, auth guard (`supabase.auth.getUser()` → redirect `/login`), placeholder content

### Phase 2: User Story 1 — Kudo cơ bản (P1, TDD)

**Goal**: Submit Kudo với Người nhận + Nội dung + Hashtag.

- Write failing unit tests cho `use-kudo-form.ts` — form state, validation logic, field errors
- Write failing unit tests cho `write-kudo-modal.tsx` — US1 flows (open/close, submit, error toast)
- Implement `use-kudo-form.ts` — tất cả `useState` + handlers (submit, cancel, field setters, validation)
- Implement `write-kudo-modal.tsx` — orchestrate layout + delegate state tới `use-kudo-form` hook; `div` + `role="dialog"` + `aria-modal` + custom focus trap; locale detect từ cookie `lang`
- Implement `toast-notification.tsx` — hiển thị error message; auto-dismiss hoặc manual close
- Write + implement `recipient-search-input.tsx` (autocomplete via `useDebounce` 300ms, empty state, error state)
- Write + implement `hashtag-picker.tsx` (chip list, max 5, locale-aware display từ `hashtagSuggestions`)
- Plain `<textarea>` cho nội dung (upgrade sang Tiptap ở Phase 3 — state `content` giữ nguyên type `string`)
- Wire `write-kudo-button.tsx` → modal state trong `/sun-kudos/page.tsx`; modal render ở cuối page body
- Nút Hủy + Escape → close + clear state; Nút Gửi disabled/loading/retry
- Kết nối với `/api/kudos`, `/api/users/search`, `/api/hashtags?locale=`
- `router.refresh()` sau submit thành công; toast hiển thị khi submit thất bại (data giữ lại)

**Checkpoint**: Có thể gửi Kudo cơ bản end-to-end. Vitest xanh.

### Phase 3: User Story 2 — Rich Text + @mention (P2, TDD)

**Goal**: Nâng cấp textarea thành Tiptap editor.

- Write failing unit tests cho `rich-text-editor.tsx` — toolbar toggles (bold/italic/strike/list/blockquote), link dialog, @mention trigger
- Implement `mention-suggestion-list.tsx` — React Portal render dropdown gợi ý; nhận `items: User[]` + `command` callback; keyboard nav (ArrowUp/Down/Enter)
- Implement `rich-text-editor.tsx`:
  - Tiptap `useEditor` với `StarterKit` + `Mention` extension
  - Toolbar: 6 buttons (Bold, Italic, Strike, OrderedList, Link, Blockquote) — mỗi button có `aria-pressed`
  - Link: dialog nhập URL, validate format trước khi chèn
  - @mention: `suggestion` config gọi `useDebounce` + `/api/users/search` → render `mention-suggestion-list`
  - `onUpdate`: lấy `editor.getHTML()` → sanitize qua DOMPurify → gọi `onContentChange(sanitizedHtml)`
  - Character counter: đếm từ `editor.getText().length` (display only)
- Replace plain `<textarea>` trong modal bằng `<RichTextEditor>` component (state `content` giữ nguyên)

**Checkpoint**: Rich text + @mention hoạt động. Vitest xanh.

### Phase 4: User Story 3 — Image Upload (P3, TDD)

**Goal**: Upload ảnh lên Supabase Storage, thumbnail, max 5.

- Write failing unit tests cho image uploader
- Implement `image-uploader.tsx` — file picker (accept="image/*"), thumbnail, x button
- Client-side upload tới Supabase Storage bucket `kudo-images` ngay khi chọn file
- Upload status: `uploading` → `done` | `error`
- Ẩn "+ Image" khi đủ 5. Xóa thumbnail khi click x
- Block submit khi còn ảnh status `error`
- Server-side MIME validation tại `POST /api/kudos` (kiểm tra URL extension hoặc Storage metadata)

**Checkpoint**: Image upload + 5-ảnh limit hoạt động. Vitest xanh.

### Phase 5: User Story 4 — Ẩn danh (P3, TDD)

**Goal**: Checkbox ẩn danh + optional tên ẩn danh.

- Write failing unit tests
- Implement checkbox toggle → hiển thị/ẩn tên ẩn danh input
- Uncheck → clear tên đã nhập
- Submit: nếu `isAnonymous=true` và tên trống → server dùng "Ẩn danh"
- Payload `POST /api/kudos` include `isAnonymous`, `anonymousDisplayName`

**Checkpoint**: Ẩn danh hoạt động. Vitest xanh.

### Phase 6: Polish & Cross-Cutting

- WCAG 2.1 AA: aria-required, aria-disabled, aria-pressed, role="dialog", aria-modal
- Focus trap kiểm tra hoạt động đúng (Tab không thoát khỏi modal)
- Keyboard: Escape đóng modal từ bất kỳ field nào
- Edge cases: special chars trong search, trim khoảng trắng
- `npx tsc --noEmit` — zero errors
- `npx eslint app/sun-kudos lib/kudos lib/users` — zero errors
- `npx vitest run` — tất cả tests xanh

---

## Integration Testing Strategy

### Test Scope

- [x] Component/Module interactions: `write-kudo-modal` ↔ `recipient-search-input` ↔ `hashtag-picker` ↔ `image-uploader` ↔ `rich-text-editor`
- [x] External dependencies: Supabase Auth (server-side), Supabase Storage (image upload), `/api/*` endpoints
- [x] Data layer: `kudo-service` → Supabase DB insert, `user-search-service` → Supabase query
- [x] User workflows: Submit Kudo flow, error handling, ẩn danh flow

### Test Categories

| Category | Applicable? | Key Scenarios |
|----------|-------------|---------------|
| UI ↔ Logic | Yes | Form validation, submit disable/enable, modal open/close, toast on error |
| Service ↔ Service | Yes | `kudo-service` gọi `user-search-service` không — actually độc lập |
| App ↔ External API | Yes | `POST /api/kudos` → Supabase insert; Storage upload |
| App ↔ Data Layer | Yes | CRUD Kudo, user search query, hashtag fetch |
| Cross-platform | No | Web only |

### Test Environment

- **Unit tests**: Vitest + happy-dom, mock Supabase client (`vi.mock`)
- **Integration tests**: Vitest với real patterns nhưng mock Supabase (kiểm tra service layer logic)
- **E2E**: Playwright against local dev server (future phase)

### Mocking Strategy

| Dependency | Strategy | Rationale |
|------------|----------|-----------|
| Supabase client | Mock (vi.mock) | Tránh hit real DB trong unit tests; Constitution III yêu cầu tests độc lập |
| Supabase Storage | Mock trong unit tests; thực trong integration | Upload logic cần real test để tránh bug production |
| next/navigation (router) | Mock (vi.mock) | Pattern đã dùng trong `language-switcher.test.tsx` |
| File API | Fake `File` objects | happy-dom hỗ trợ File constructor |

### Coverage Goals

| Area | Target | Priority |
|------|--------|----------|
| Service layer (pure logic) | 90%+ | High |
| Form validation flows | 85%+ | High |
| Error states | 80%+ | Medium |
| Image upload states | 75%+ | Medium |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Tiptap @mention integration phức tạp (render suggestions) | Med | Med | Tạo `SuggestionList` component riêng; follow Tiptap docs example; test isolated |
| Supabase Storage policies chưa config (bucket `kudo-images` chưa tồn tại) | High | High | Tạo bucket + RLS policy trong migration task; document storage policy |
| `isomorphic-dompurify` có thể strip safe HTML từ Tiptap (cần whitelist) | Low | Med | Config DOMPurify `ALLOWED_TAGS` và `ALLOWED_ATTR` để giữ bold/italic/link/blockquote HTML |
| `/sun-kudos` page chưa tồn tại — cần tạo mới | High | Low | Tạo ở Phase 1 Foundation; không block modal implementation |
| happy-dom không support `<dialog>` native element đầy đủ | Med | Med | Dùng `div` + `role="dialog"` + custom focus trap hook thay `<dialog>` native để test được |
| Database schema (`kudos`, `users`, `hashtags` tables) chưa có migration | High | High | Tạo Supabase migration trước khi test API routes; document schema dự kiến |

---

## Database Schema (Predicted)

```sql
-- Cần tạo migration trước Phase 1
CREATE TABLE kudos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id),
  recipient_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  hashtags UUID[] NOT NULL DEFAULT '{}',  -- hashtag IDs, không phải tên
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  anonymous_display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_vi TEXT NOT NULL,
  name_en TEXT NOT NULL,
  UNIQUE (name_vi),
  UNIQUE (name_en)
);

-- users table có thể đã có (profiles table từ auth callback)
-- Cần verify với existing schema
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
```

**RLS Policy cần thiết (Principle IV)**:
- `kudos`: SELECT — mọi user đã auth; INSERT — chỉ `sender_id = auth.uid()`; UPDATE/DELETE — không cho phép (Kudo là immutable)
- `hashtags`: SELECT — public (không cần auth); INSERT/UPDATE/DELETE — chỉ admin role (service role key)
- `profiles`: đã có RLS (xem `profile-service.ts` — không cần thay đổi)

---

## Dependencies & Prerequisites

### Required Before Start

- [x] `constitution.md` reviewed
- [x] `spec.md` Reviewed v1 approved
- [ ] `design-style.md` — **KHÔNG CÓ**. Visual specs sẽ được fetch on-demand từ Figma via `query_section` trong khi implement từng component. Designer tokens cần bổ sung vào `globals.css` trong quá trình implement
- [ ] Database schema migration — cần tạo migration cho `kudos`, `hashtags` tables
- [ ] Supabase Storage bucket `kudo-images` — cần tạo + config RLS policy
- [ ] API contracts defined — endpoints predicted; cần verify với DB schema khi available

### External Dependencies

- Supabase project với Auth, DB, Storage đang hoạt động (env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
- Figma file `9ypp4enmFmdK3YAFJLIu6C` để fetch design tokens lúc implement (`query_section`, `list_media_nodes`)

---

## Next Steps

Sau khi plan được approve:

1. **Run** `/momorph.tasks` để generate task breakdown chi tiết
2. **Review** tasks.md, confirm TDD ordering và parallel opportunities
3. **Begin** implementation từ Phase 0 (assets) + Phase 1 (Foundation) song song

---

## Notes

- **Modal vs Intercepting Route**: Implement là modal overlay thuần (`div`/`dialog` + overlay backdrop) trên `/sun-kudos`. Không dùng Next.js intercepting routes cho MVP — URL sharing không phải requirement hiện tại
- **`/sun-kudos` page**: Cần tạo mới. Live Board (feed Kudo) là feature riêng (screenId `MaZUn5xHXZ`) — modal này là overlay trên đó. Phase 1 chỉ tạo skeleton page đủ để mount modal; feed implementation thuộc feature `MaZUn5xHXZ`
- **DOMPurify config**: `ALLOWED_TAGS: ['b','i','s','ol','ul','li','a','blockquote','p','br','strong','em']` + `ALLOWED_ATTR: ['href','target','rel']` để giữ Tiptap output hợp lệ sau sanitize
- **`@mention` render**: Tiptap Mention extension cần custom `suggestion.render()` để hiển thị dropdown gợi ý. Dùng React Portal để render dropdown ở ngoài editor DOM
- **Image MIME validation server-side**: Route handler `POST /api/kudos` kiểm tra từng URL có extension hợp lệ; hoặc Supabase Storage policy restrict bucket chỉ cho phép `image/*` MIME types
