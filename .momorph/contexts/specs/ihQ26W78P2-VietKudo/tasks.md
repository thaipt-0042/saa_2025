# Tasks: Viết Kudo

**Frame**: `ihQ26W78P2-VietKudo`
**Prerequisites**: spec.md ✅ | plan.md ✅ | design-style.md ⚠️ (không có — fetch on-demand từ Figma via `query_section` trong lúc implement)

> **TDD mandatory** (Constitution Principle III): Với mỗi feature task có test, test PHẢI được viết trước và xác nhận FAIL trước khi implement.

---

## Task Format

```
- [ ] T### [P?] [Story?] Description | file/path.ts
```

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this belongs to (US1, US2, US3, US4)
- **|**: File path affected by this task
- **TDD**: Test task → xác nhận FAIL → implement → xác nhận PASS

---

## Phase 1: Setup

**Purpose**: Install dependencies, tạo shared infrastructure, download assets.

- [ ] T001 Install Tiptap + DOMPurify dependencies: `npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-mention @tiptap/pm isomorphic-dompurify && npm install -D @types/dompurify` | package.json
- [ ] T002 [P] Tạo `lib/hooks/` directory + implement `useDebounce<T>(value, delay)` hook | lib/hooks/use-debounce.ts
- [ ] T003 [P] Tạo TypeScript types: `Kudo`, `KudoPayload`, `ImageUploadState`, `HashtagItem`, `UserSearchResult` | lib/kudos/kudo-types.ts
- [ ] T004 [P] Download icon assets từ Figma frameId `ihQ26W78P2` (camera, close/x, hashtag icons) via `list_media_nodes` → lưu vào `public/assets/sun-kudos/icons/` | public/assets/sun-kudos/icons/

---

## Phase 2: Foundation (Blocking Prerequisites)

**Purpose**: DB schema, service layer, API routes — tất cả US đều phụ thuộc phase này.

**⚠️ CRITICAL**: Không US nào được bắt đầu trước khi Phase 2 hoàn tất.

### Database & Infrastructure

- [ ] T005 Tạo Supabase migration cho `hashtags` table: `id UUID PK`, `name_vi TEXT NOT NULL UNIQUE`, `name_en TEXT NOT NULL UNIQUE` + RLS: SELECT public, INSERT/UPDATE/DELETE chỉ service role | supabase/migrations/[timestamp]_create_hashtags.sql
- [ ] T006 Tạo Supabase migration cho `kudos` table: `id, sender_id, recipient_id REFERENCES profiles(id), content TEXT, hashtags UUID[], image_urls TEXT[], is_anonymous BOOL, anonymous_display_name TEXT, created_at` + RLS: SELECT auth required, INSERT chỉ sender_id = auth.uid() | supabase/migrations/[timestamp]_create_kudos.sql
- [ ] T007 [P] Tạo `/sun-kudos/page.tsx` skeleton — Server Component, `supabase.auth.getUser()` → redirect `/login` nếu chưa auth, placeholder `<main>` | app/sun-kudos/page.tsx

### Service Layer (TDD)

- [ ] T008 [P] Write failing unit test: `searchUsers('an', supabase)` → trả `UserSearchResult[]` có `id, full_name, avatar_url`; `searchUsers('')` → trả `[]`; trim khoảng trắng | lib/users/user-search-service.test.ts
- [ ] T009 [P] Write failing unit test: `getHashtags('vi', supabase)` → trả `{ id, name }[]` với `name = name_vi`; `getHashtags('en', supabase)` → `name = name_en`; locale không hợp lệ → fallback `vi` | lib/kudos/hashtag-service.test.ts
- [ ] T010 Confirm T008 + T009 tests FAIL: `npx vitest run lib/users/user-search-service.test.ts lib/kudos/hashtag-service.test.ts` | (confirm failing)
- [ ] T011 [P] Implement `searchUsers(query, supabase)` — query `profiles` table (`full_name ilike %query%`), trim input, trả `UserSearchResult[]` | lib/users/user-search-service.ts
- [ ] T012 [P] Implement `getHashtags(locale, supabase)` — query `hashtags` table, map `name_vi`/`name_en` theo locale, fallback `vi` | lib/kudos/hashtag-service.ts
- [ ] T013 Confirm T008 + T009 tests PASS + all existing tests xanh: `npx vitest run` | (validate)
- [ ] T014 Write failing unit test: `createKudo(payload, supabase)` → insert vào `kudos`, DOMPurify sanitize `content`, trả `{ id }`; invalid payload → throw ZodError; unauthenticated → throw error | lib/kudos/kudo-service.test.ts
- [ ] T015 Confirm T014 FAIL: `npx vitest run lib/kudos/kudo-service.test.ts` | (confirm failing)
- [ ] T016 Implement `createKudo(payload, supabase)` — Zod validate payload, DOMPurify sanitize `content` (ALLOWED_TAGS: b/i/s/ol/ul/li/a/blockquote/p/br/strong/em), insert `kudos` table | lib/kudos/kudo-service.ts
- [ ] T017 Confirm T014 PASS + all tests xanh: `npx vitest run` | (validate)

### API Route Handlers

- [ ] T018 [P] Implement `GET /api/users/search?q=` — auth check, Zod validate `q` (string, trim), delegate `searchUsers`, trả `200 { users: UserSearchResult[] }` | app/api/users/search/route.ts
- [ ] T019 [P] Implement `GET /api/hashtags?locale=` — no auth required, Zod validate locale (enum `vi|en`, default `vi`), delegate `getHashtags`, trả `200 { hashtags: { id, name }[] }` | app/api/hashtags/route.ts
- [ ] T020 Implement `POST /api/kudos` — auth check (`getUser()` → 401 nếu null), Zod validate body (recipientId, content, hashtags `UUID[]` min 1 max 5, imageUrls, isAnonymous, anonymousDisplayName), delegate `createKudo`, trả `201 { id }` | app/api/kudos/route.ts

**Checkpoint**: Foundation complete. Services + API routes sẵn sàng. DB migration đã chạy.

---

## Phase 3: User Story 1 — Gửi Kudo cơ bản (Priority: P1) 🎯 MVP

**Goal**: Người dùng submit Kudo với Người nhận + Nội dung (plain textarea) + ít nhất 1 hashtag.

**Independent Test**: Mở modal → tìm người nhận → nhập nội dung → chọn hashtag → click Gửi → 201 response → modal đóng + feed refresh. Gửi thiếu field → button disabled. API lỗi → toast + modal giữ nguyên.

### Form Hook (TDD)

- [ ] T021 [US1] Write failing unit tests cho `use-kudo-form`: (a) initial state đúng; (b) `setRecipient` cập nhật state; (c) form invalid khi thiếu recipient/content/hashtags → `isFormValid = false`; (d) form valid khi đủ 3 fields → `isFormValid = true`; (e) `fieldErrors` populated khi submit form trống; (f) `reset()` clear tất cả state | app/sun-kudos/_components/use-kudo-form.test.ts
- [ ] T022 [US1] Confirm T021 FAIL: `npx vitest run app/sun-kudos/_components/use-kudo-form.test.ts` | (confirm failing)
- [ ] T023 [US1] Implement `use-kudo-form.ts` — tất cả useState (recipient, recipientQuery, content, hashtags, images, isAnonymous, anonymousName, isSubmitting, submitError, fieldErrors), `isFormValid` derived, `handleSubmit()`, `reset()`, `setField*` handlers | app/sun-kudos/_components/use-kudo-form.ts
- [ ] T024 [US1] Confirm T021 PASS + all tests xanh: `npx vitest run` | (validate)

### Modal & Sub-components (TDD)

- [ ] T025 [US1] Write failing unit tests cho `write-kudo-modal`: (a) render với `open=true` → `role="dialog"` có `aria-modal="true"`; (b) click Hủy → `onClose` called; (c) Escape key → `onClose` called; (d) Submit disabled khi `isFormValid=false`; (e) Submit loading state khi `isSubmitting=true`; (f) toast hiển thị khi `submitError` không null | app/sun-kudos/_components/write-kudo-modal.test.tsx
- [ ] T026 [US1] Write failing unit tests cho `recipient-search-input`: (a) gõ 0 ký tự → không gọi API; (b) gõ "an" → gọi `/api/users/search?q=an` (debounced); (c) render gợi ý → click chọn → `onSelect` called; (d) no-results state khi API trả `[]` | app/sun-kudos/_components/recipient-search-input.test.tsx
- [ ] T027 [US1] Write failing unit tests cho `hashtag-picker`: (a) render chips từ `selected`; (b) click chip trong dropdown → thêm vào selected; (c) max 5 chip → nút "+ Hashtag" ẩn; (d) click "x" trên chip → xóa khỏi selected | app/sun-kudos/_components/hashtag-picker.test.tsx
- [ ] T028 [US1] Confirm T025 + T026 + T027 FAIL: `npx vitest run app/sun-kudos/_components/` | (confirm failing)
- [ ] T029 [US1] Implement `toast-notification.tsx` — nhận `message: string | null`, render khi `message != null`, có nút close; CSS via `globals.css` tokens (fetch design từ Figma nếu cần) | app/sun-kudos/_components/toast-notification.tsx
- [ ] T030 [US1] Implement `recipient-search-input.tsx` — controlled input, `useDebounce(query, 300)`, fetch `/api/users/search`, render dropdown gợi ý + no-results state, `onSelect(user)` callback, `aria-label`, `aria-autocomplete` | app/sun-kudos/_components/recipient-search-input.tsx
- [ ] T031 [US1] Implement `hashtag-picker.tsx` — hiển thị `selected` chips (tối đa 5) + x button, nút "+ Hashtag" fetch `/api/hashtags?locale=` lần đầu, dropdown chọn từ list, `onAdd`/`onRemove` callbacks | app/sun-kudos/_components/hashtag-picker.tsx
- [ ] T032 [US1] Implement `write-kudo-modal.tsx` — `div role="dialog" aria-modal`, custom focus trap (tabIndex management), tiêu đề, form layout (Người nhận → Textarea → Hashtag → Footer), delegate tới `use-kudo-form` hook, render `toast-notification` khi `submitError` | app/sun-kudos/_components/write-kudo-modal.tsx
- [ ] T033 [US1] Implement `write-kudo-button.tsx` — button "Viết Kudo" nhận `onClick` prop | app/sun-kudos/_components/write-kudo-button.tsx
- [ ] T034 [US1] Wire modal vào page: thêm `write-kudo-button` + `write-kudo-modal` (với `open` state) vào `/sun-kudos/page.tsx`; modal đọc locale từ cookie `lang` để truyền cho hashtag-picker | app/sun-kudos/page.tsx
- [ ] T035 [US1] Confirm T025 + T026 + T027 PASS + all tests xanh: `npx vitest run` | (validate)

**Checkpoint**: US1 complete. Submit Kudo cơ bản hoạt động end-to-end. All unit tests xanh.

---

## Phase 4: User Story 2 — Rich Text + @mention (Priority: P2)

**Goal**: Nâng cấp textarea thành Tiptap editor với toolbar định dạng và @mention đồng nghiệp.

**Independent Test**: Bôi đen text → click Bold → text in đậm. Gõ "@Nguyen" → dropdown gợi ý → chọn → mention node chèn. Character counter cập nhật.

### Rich Text Editor (TDD)

- [ ] T036 [US2] Write failing unit tests cho `rich-text-editor`: (a) render Tiptap editor; (b) click Bold button → `aria-pressed="true"`; (c) click Italic → `aria-pressed="true"`; (d) `onContentChange` được gọi khi text thay đổi với sanitized HTML; (e) character counter hiển thị đúng | app/sun-kudos/_components/rich-text-editor.test.tsx
- [ ] T037 [US2] Confirm T036 FAIL: `npx vitest run app/sun-kudos/_components/rich-text-editor.test.tsx` | (confirm failing)
- [ ] T038 [US2] Implement `mention-suggestion-list.tsx` — React Portal component, nhận `items: UserSearchResult[]` + `command` callback, keyboard nav (ArrowUp/Down/Enter), click để chọn, empty state | app/sun-kudos/_components/mention-suggestion-list.tsx
- [ ] T039 [US2] Implement `rich-text-editor.tsx` — `useEditor({ StarterKit, Mention })`, toolbar 6 buttons (Bold/Italic/Strike/OrderedList/Link/Blockquote với `aria-pressed`), Link dialog (prompt URL → validate → `editor.commands.setLink`), Mention `suggestion` config: gọi `useDebounce` + `/api/users/search` → render `mention-suggestion-list` via Portal, `onUpdate` → `getHTML()` → DOMPurify sanitize → `onContentChange(html)`, character counter từ `getText().length` | app/sun-kudos/_components/rich-text-editor.tsx
- [ ] T040 [US2] Replace plain `<textarea>` trong `write-kudo-modal.tsx` bằng `<RichTextEditor onContentChange={...} />` — state `content` trong `use-kudo-form` giữ nguyên type `string` | app/sun-kudos/_components/write-kudo-modal.tsx
- [ ] T041 [US2] Confirm T036 PASS + all tests xanh: `npx vitest run` | (validate)

**Checkpoint**: US1 + US2 complete. Rich text + @mention hoạt động. All tests xanh.

---

## Phase 5: User Story 3 — Đính kèm ảnh (Priority: P3)

**Goal**: Upload tối đa 5 ảnh lên Supabase Storage, thumbnail + xóa, block submit nếu có ảnh lỗi.

**Independent Test**: Click "+ Image" → chọn jpg → thumbnail + status `done`. Chọn pdf → error message. Upload 5 ảnh → nút "+ Image" ẩn. Click x → ảnh xóa.

### Image Uploader (TDD)

- [ ] T042 [US3] Write failing unit tests cho `image-uploader`: (a) click "+ Image" → file picker mở (accept="image/*"); (b) chọn jpg hợp lệ → thumbnail render + status `uploading` → `done`; (c) chọn pdf → error message, không add vào list; (d) 5 ảnh → nút "+ Image" ẩn; (e) click x → ảnh bị xóa, nút "+ Image" hiện lại; (f) upload fail → status `error`, thumbnail không hiển thị | app/sun-kudos/_components/image-uploader.test.tsx
- [ ] T043 [US3] Confirm T042 FAIL: `npx vitest run app/sun-kudos/_components/image-uploader.test.tsx` | (confirm failing)
- [ ] T044 [US3] Implement `image-uploader.tsx` — `<input type="file" accept="image/*">`, validate MIME `file.type.startsWith('image/')`, upload tới Supabase Storage bucket `kudo-images` via `createClient()` ngay khi chọn, trạng thái `uploading/done/error`, thumbnail + x button, ẩn "+ Image" khi đủ 5, `onImagesChange(images)` callback | app/sun-kudos/_components/image-uploader.tsx
- [ ] T045 [US3] Wire `image-uploader` vào `write-kudo-modal.tsx`: thêm `<ImageUploader>` section, truyền `images` state từ `use-kudo-form`, block submit trong `handleSubmit` nếu có image `status === 'error'` | app/sun-kudos/_components/write-kudo-modal.tsx
- [ ] T046 [US3] Add server-side image URL validation trong `POST /api/kudos` — kiểm tra `imageUrls` max 5 phần tử, mỗi URL bắt đầu từ Supabase Storage domain | app/api/kudos/route.ts
- [ ] T047 [US3] Confirm T042 PASS + all tests xanh: `npx vitest run` | (validate)

**Checkpoint**: US1 + US2 + US3 complete. Image upload hoạt động. All tests xanh.

---

## Phase 6: User Story 4 — Gửi ẩn danh (Priority: P3)

**Goal**: Checkbox ẩn danh hiện/ẩn tên ẩn danh input; submit với tên đặt hoặc default "Ẩn danh".

**Independent Test**: Check checkbox → input tên ẩn danh hiện. Uncheck → input ẩn + value cleared. Submit checked + tên trống → payload `anonymousDisplayName = null` (server dùng "Ẩn danh"). Submit checked + tên "Ninja" → payload `anonymousDisplayName = "Ninja"`.

### Anonymous Mode (TDD)

- [ ] T048 [US4] Write failing unit tests cho anonymous flow: (a) checkbox mặc định unchecked, input ẩn; (b) click checkbox → checked, input hiển thị; (c) uncheck → input ẩn + anonymousName cleared; (d) `isAnonymous=true` + `anonymousName=""` → `use-kudo-form` submit payload có `anonymousDisplayName: null`; (e) `isAnonymous=true` + `anonymousName="Ninja"` → payload `anonymousDisplayName: "Ninja"` | app/sun-kudos/_components/use-kudo-form.test.ts
- [ ] T049 [US4] Confirm T048 FAIL: `npx vitest run app/sun-kudos/_components/use-kudo-form.test.ts` | (confirm failing)
- [ ] T050 [US4] Add `isAnonymous` + `anonymousName` state + handlers vào `use-kudo-form.ts`; trong `handleSubmit` map: `anonymousDisplayName = isAnonymous ? (anonymousName.trim() || null) : null` | app/sun-kudos/_components/use-kudo-form.ts
- [ ] T051 [US4] Add anonymous section vào `write-kudo-modal.tsx` — `<input type="checkbox">` label "Gửi lời cám ơn và ghi nhận ẩn danh", conditional render `<input type="text">` cho tên ẩn danh (not required) | app/sun-kudos/_components/write-kudo-modal.tsx
- [ ] T052 [US4] Verify `POST /api/kudos` Zod schema accept `anonymousDisplayName: string | null` (đã có ở T020 — chỉ cần confirm không cần thay đổi) | app/api/kudos/route.ts
- [ ] T053 [US4] Confirm T048 PASS + all tests xanh: `npx vitest run` | (validate)

**Checkpoint**: Tất cả 4 User Stories complete. All unit tests xanh.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: WCAG, edge cases, type check, lint, final validation.

- [ ] T054 [P] WCAG 2.1 AA audit: verify `aria-required` trên required fields, `aria-disabled` trên nút Gửi, `aria-pressed` trên toolbar buttons, `role="dialog"` + `aria-modal` + `aria-labelledby` trên modal, focus trap không thoát Tab ra ngoài | app/sun-kudos/_components/
- [ ] T055 [P] Edge cases: (a) special chars `@ # $` trong recipient search → hiển thị "Không tìm thấy kết quả"; (b) khoảng trắng thừa "  Nguyễn  " → trim trước khi gọi API; (c) submit tất cả trống → fieldErrors hiển thị đồng thời tất cả required fields | app/sun-kudos/_components/
- [ ] T056 [P] Keyboard accessibility: Tab focus order đúng (Người nhận → Textarea → Hashtag → Image → Checkbox → Footer); Escape đóng modal từ bất kỳ field nào | app/sun-kudos/_components/write-kudo-modal.tsx
- [ ] T057 [P] `npx tsc --noEmit` — zero TypeScript errors | (project root)
- [ ] T058 [P] `npx eslint app/sun-kudos lib/kudos lib/users lib/hooks` — zero ESLint errors | (project root)
- [ ] T059 `npx vitest run` — tất cả tests pass, không có regression | (project root)

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) → Phase 2 (Foundation) → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3) → Phase 6 (US4) → Phase 7 (Polish)
```

- **Phase 1**: T001→T004; T002, T003, T004 chạy song song sau T001
- **Phase 2**: Phụ thuộc Phase 1. T005, T006, T007 song song; T008+T009 song song → T010 (confirm fail) → T011+T012 song song → T013 (confirm pass) → T014 → T015 (confirm fail) → T016 → T017 → T018+T019+T020 song song
- **Phase 3 (US1)**: Phụ thuộc Phase 2. T021→T022 (TDD) → T023→T024 (confirm) → T025+T026+T027 song song → T028 (confirm fail) → T029+T030+T031 song song → T032 → T033 → T034 → T035 (confirm pass)
- **Phase 4 (US2)**: Phụ thuộc Phase 3. T036→T037 (TDD) → T038+T039 song song → T040 → T041 (confirm pass)
- **Phase 5 (US3)**: Phụ thuộc Phase 4. T042→T043 (TDD) → T044→T045→T046 sequential → T047 (confirm)
- **Phase 6 (US4)**: Phụ thuộc Phase 5. T048→T049 (TDD) → T050→T051→T052 → T053 (confirm)
- **Phase 7 (Polish)**: Phụ thuộc Phase 6. T054+T055+T056+T057+T058 song song → T059 (final validate)

### TDD Order (Mandatory per Constitution III)

```
Write failing test → Confirm FAIL → Implement → Confirm PASS
```

- T008+T009 → T010 (fail) → T011+T012 → T013 (pass)
- T014 → T015 (fail) → T016 → T017 (pass)
- T021 → T022 (fail) → T023 → T024 (pass)
- T025+T026+T027 → T028 (fail) → T029→T035 (pass)
- T036 → T037 (fail) → T038+T039 → T041 (pass)
- T042 → T043 (fail) → T044→T046 → T047 (pass)
- T048 → T049 (fail) → T050→T052 → T053 (pass)

### Parallel Opportunities

| Group | Tasks | Condition |
|-------|-------|-----------|
| Setup utilities | T002, T003, T004 | Sau T001 complete |
| DB migrations | T005, T006, T007 | Phase 2 start |
| Service tests (write) | T008, T009 | Phase 2, song song |
| Service implements | T011, T012 | Sau T010 (confirm fail) |
| Route handlers | T018, T019 | Sau T017 (kudo-service pass) |
| Modal sub-component tests | T025, T026, T027 | Sau T024 (form hook pass) |
| Sub-component impls | T029, T030, T031 | Sau T028 (confirm fail) |
| Mention + Editor | T038, T039 | Sau T037 (confirm fail) |
| Polish checks | T054, T055, T056, T057, T058 | Sau T053 |

---

## Implementation Strategy

### MVP First (Recommended)

1. Complete Phase 1 (Setup)
2. Complete Phase 2 (Foundation)
3. Complete Phase 3 (US1 — Kudo cơ bản)
4. **STOP và VALIDATE**: `npx vitest run` — all xanh; test submit Kudo end-to-end với plain textarea
5. Continue Phase 4 (US2 — Rich text)
6. Continue Phase 5 (US3 — Image)
7. Continue Phase 6 (US4 — Anonymous)
8. Phase 7 (Polish)

### Incremental Delivery

```
T001-T004 (Setup) → T005-T020 (Foundation) → VALIDATE
  → T021-T035 (US1) → VALIDATE end-to-end
  → T036-T041 (US2) → VALIDATE rich text
  → T042-T047 (US3) → VALIDATE image upload
  → T048-T053 (US4) → VALIDATE anonymous
  → T054-T059 (Polish) → SHIP
```

---

## Notes

- **DB migration path**: Nếu dự án dùng Supabase CLI: `supabase/migrations/`. Nếu không có CLI setup, tạo SQL script và chạy qua Supabase Dashboard
- **Supabase Storage bucket**: Tạo bucket `kudo-images` trước T044 (image upload). Config: public read, authenticated write, MIME restriction `image/*`
- **Locale detection trong modal**: Đọc cookie `lang` (same pattern như `login/page.tsx`); truyền xuống `hashtag-picker` qua prop `locale`
- **`use-kudo-form` hook location**: `app/sun-kudos/_components/use-kudo-form.ts` — cùng folder với modal; không phải `lib/` vì gắn chặt với UI state của feature này
- **DOMPurify ALLOWED_TAGS**: `['b','i','s','ol','ul','li','a','blockquote','p','br','strong','em']` + `ALLOWED_ATTR: ['href','target','rel']`
- **anonymousDisplayName server logic**: Server (`kudo-service.ts`) nhận `anonymousDisplayName: string | null`; nếu `isAnonymous=true` và `anonymousDisplayName=null` → lưu DB `anonymous_display_name = 'Ẩn danh'`
