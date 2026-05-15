# Feature Specification: Viết Kudo

**Frame ID**: `ihQ26W78P2`
**Frame Name**: `Viết Kudo`
**File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**Created**: 2026-05-15
**Status**: Reviewed v1

---

## Overview

Modal form cho phép người dùng đã đăng nhập gửi lời cảm ơn và ghi nhận (Kudo) đến đồng đội. Kudo bao gồm người nhận, nội dung văn bản (có hỗ trợ rich text và @mention), hashtag phân loại (chọn từ danh sách có sẵn), ảnh đính kèm tùy chọn, và tùy chọn gửi ẩn danh. Modal này xuất hiện khi người dùng click vào nút "Viết Kudo" từ màn hình Sun* Kudos Live Board (`/sun-kudos`).

---

## User Scenarios & Testing

### User Story 1 — Gửi Kudo cơ bản đến đồng đội (Priority: P1)

Người dùng đã đăng nhập muốn gửi lời cảm ơn đến một đồng đội bằng cách điền đầy đủ các trường bắt buộc và submit form.

**Why this priority**: Đây là flow cốt lõi — mọi chức năng khác là mở rộng của US1. Không có US1, feature không có giá trị.

**Independent Test**: Mở modal → tìm và chọn người nhận → nhập nội dung → thêm 1 hashtag → click Gửi → Kudo được tạo thành công, modal đóng.

**Acceptance Scenarios**:

1. **Given** người dùng đã đăng nhập và đang ở `/sun-kudos`, **When** click "Viết Kudo", **Then** modal mở với tiêu đề "Gửi lời cám ơn và ghi nhận đến đồng đội", các trường đúng thứ tự (Người nhận → Textarea → Hashtag → Image → Checkbox ẩn danh) và nút Hủy/Gửi ở footer.
2. **Given** modal đã mở, **When** nhập "An" vào trường Người nhận, **Then** dropdown gợi ý hiển thị danh sách tên có chứa "An", lọc theo từng ký tự gõ vào.
3. **Given** dropdown gợi ý đang mở, **When** click chọn "Nguyễn Văn An", **Then** tên được điền vào trường, dropdown đóng.
4. **Given** các trường bắt buộc còn trống, **When** quan sát nút "Gửi", **Then** nút ở trạng thái disabled.
5. **Given** đã điền Người nhận + Nội dung + ít nhất 1 hashtag, **When** quan sát nút "Gửi", **Then** nút được enable.
6. **Given** form hợp lệ, **When** click "Gửi", **Then** hiển thị loading trên nút Gửi, sau khi API thành công modal đóng lại và feed Kudo trên `/sun-kudos` được cập nhật.
7. **Given** API trả về lỗi (network error hoặc server error) khi click "Gửi", **Then** modal giữ nguyên trạng thái mở, dữ liệu đã nhập được giữ lại, hiển thị toast thông báo lỗi để user thử lại.
8. **Given** modal đang mở (có hoặc không có dữ liệu), **When** click "Hủy", **Then** modal đóng, mọi dữ liệu đã nhập bị hủy bỏ.
9. **Given** modal đang mở, **When** nhấn phím Escape, **Then** modal đóng như khi click "Hủy".
10. **Given** người dùng chưa đăng nhập, **When** cố gắng truy cập chức năng Viết Kudo, **Then** được redirect đến `/login`.

---

### User Story 2 — Định dạng nội dung và @mention đồng nghiệp (Priority: P2)

Người dùng muốn làm nổi bật nội dung bằng cách định dạng văn bản (bold, italic, strikethrough, danh sách, link, trích dẫn) và nhắc tên đồng nghiệp khác trong lời cảm ơn.

**Why this priority**: Tăng chất lượng và tính biểu đạt của Kudo. Cần thiết cho trải nghiệm đầy đủ nhưng không block submit cơ bản.

**Independent Test**: Nhập text → bôi đen → click Bold → text in đậm. Nhập "@Nguyen" → dropdown gợi ý tên hiện → chọn → mention được chèn.

**Acceptance Scenarios**:

1. **Given** đã nhập text trong textarea, **When** bôi đen và click Bold (B), **Then** text được áp dụng/gỡ bỏ định dạng in đậm.
2. **Given** đã nhập text trong textarea, **When** bôi đen và click Italic (I), **Then** text được áp dụng/gỡ bỏ định dạng in nghiêng.
3. **Given** đã nhập text trong textarea, **When** bôi đen và click Stroke (S), **Then** text được áp dụng/gỡ bỏ định dạng gạch ngang.
4. **Given** đã nhập text nhiều dòng, **When** bôi đen và click Number list, **Then** text được định dạng thành danh sách đánh số.
5. **Given** đang soạn thảo, **When** click Link → nhập URL hợp lệ → xác nhận, **Then** liên kết được chèn vào vị trí con trỏ.
6. **Given** đã nhập text, **When** bôi đen và click Quote, **Then** text được định dạng dạng trích dẫn (blockquote).
7. **Given** đang soạn thảo, **When** gõ "@Nguyen", **Then** dropdown gợi ý danh sách tên đồng nghiệp có "Nguyen" hiện ra bên dưới vị trí con trỏ; có thể chọn để chèn mention.
8. **Given** gợi ý mention đang hiện, **When** chọn "Nguyễn Văn An", **Then** mention được chèn vào textarea; counter ký tự cập nhật.
9. **Given** đang soạn thảo, **When** quan sát bên dưới textarea, **Then** bộ đếm ký tự hiển thị số ký tự hiện tại (không có giới hạn tối đa — chỉ để tham khảo).

---

### User Story 3 — Đính kèm ảnh vào Kudo (Priority: P3)

Người dùng muốn đính kèm ảnh minh họa vào lời cảm ơn.

**Why this priority**: Tăng tính sinh động nhưng không ảnh hưởng đến flow chính (ảnh là optional).

**Independent Test**: Click "+ Image" → chọn file jpg → thumbnail hiện. Upload 5 ảnh → nút "+ Image" ẩn. Click x trên thumbnail → ảnh bị xóa.

**Acceptance Scenarios**:

1. **Given** modal đang mở, **When** click "+ Image", **Then** file picker mở; chỉ cho phép chọn file ảnh (jpg, png và các định dạng image khác); file pdf, mp4, txt không được chọn.
2. **Given** file picker đang mở, **When** chọn 1 file .jpg hợp lệ, **Then** ảnh được hiển thị dưới dạng thumbnail kèm nút "x"; nút "+ Image" vẫn hiển thị nếu chưa đủ 5 ảnh.
3. **Given** file picker đang mở, **When** chọn file .pdf, **Then** hiển thị thông báo lỗi định dạng file không hợp lệ; file không được thêm vào danh sách.
4. **Given** đã có 5 ảnh, **When** quan sát nút "+ Image", **Then** nút bị ẩn; không thể thêm ảnh thứ 6.
5. **Given** đang có 5 ảnh (nút đã ẩn), **When** click "x" xóa 1 ảnh, **Then** ảnh bị xóa và nút "+ Image" hiện lại.
6. **Given** đang có 3 ảnh, **When** click "x" trên ảnh thứ 2, **Then** ảnh thứ 2 bị xóa, còn lại 2 ảnh; thứ tự các ảnh còn lại giữ nguyên.
7. **Given** upload ảnh lên Supabase Storage thất bại, **When** user chọn file ảnh, **Then** thumbnail không hiển thị; hiển thị thông báo lỗi upload tại vị trí ảnh đó; user có thể thử lại hoặc chọn ảnh khác.

---

### User Story 4 — Gửi Kudo ẩn danh (Priority: P3)

Người dùng muốn gửi lời cảm ơn mà không tiết lộ danh tính thực, có thể tự đặt tên ẩn danh.

**Why this priority**: Tính năng phụ trợ; không block các user stories khác. Một số người dùng nhạy cảm với danh tính.

**Independent Test**: Check "Gửi ẩn danh" → text field nhập tên ẩn danh hiện. Uncheck → field ẩn. Submit với ẩn danh (có/không tên) → Kudo hiển thị tên ẩn danh hoặc "Ẩn danh".

**Acceptance Scenarios**:

1. **Given** modal đang mở, **When** quan sát checkbox "Gửi lời cám ơn và ghi nhận ẩn danh", **Then** checkbox ở trạng thái unchecked theo mặc định.
2. **Given** checkbox unchecked, **When** click checkbox, **Then** checkbox được check và text field nhập tên ẩn danh xuất hiện (không bắt buộc).
3. **Given** checkbox đã checked, **When** click lại để uncheck, **Then** checkbox unchecked và text field tên ẩn danh ẩn đi; giá trị đã nhập bị xóa.
4. **Given** checkbox checked + nhập tên ẩn danh + form hợp lệ, **When** click "Gửi", **Then** Kudo được gửi với tên ẩn danh đã nhập thay vì tên thật.
5. **Given** checkbox checked + không nhập tên ẩn danh + form hợp lệ, **When** click "Gửi", **Then** Kudo được gửi với tên mặc định "Ẩn danh" thay vì tên thật.

---

### Edge Cases

- **Trường Người nhận trống khi submit**: Hiển thị trạng thái lỗi (error state) tại trường Người nhận kèm thông báo lỗi; form không được submit.
- **Nội dung textarea trống khi submit**: Hiển thị thông báo "Không được để trống"; form không được submit.
- **Không có hashtag khi submit**: Hiển thị thông báo "Không được để trống" tại trường Hashtag; form không được submit.
- **Submit tất cả trường trống**: Hiển thị lỗi đồng thời tại tất cả trường bắt buộc (Người nhận, Nội dung, Hashtag).
- **Hashtag vượt quá 5**: Hiển thị thông báo "Tối đa 5 hashtag"; không cho phép thêm hashtag thứ 6.
- **Image vượt quá 5**: Nút "+ Image" ẩn khi đủ 5 ảnh; không thể upload thêm.
- **Tìm kiếm người nhận với ký tự đặc biệt** ("@ # $"): Lọc chính xác hoặc hiển thị "Không có kết quả".
- **Tìm kiếm với khoảng trắng thừa** ("  Nguyễn  "): Hệ thống trim khoảng trắng trước khi gửi query.
- **API submit thất bại** (network/server error): Modal giữ nguyên mở, dữ liệu được giữ lại, hiển thị toast thông báo lỗi; nút Gửi trở về trạng thái enabled để user thử lại.
- **Image upload thất bại**: Thumbnail không hiển thị; thông báo lỗi tại vị trí ảnh đó; các ảnh upload thành công vẫn giữ nguyên; submit bị block nếu có ảnh lỗi chưa được xử lý.
- **Người dùng chưa đăng nhập**: Redirect về `/login`.
- **Tìm kiếm người nhận không có kết quả**: Dropdown hiển thị trạng thái "Không tìm thấy kết quả"; form không cho phép submit nếu trường Người nhận vẫn trống.

---

## UI/UX Requirements

### Screen Components

| Component | Node ID | Type | Interactions |
|-----------|---------|------|--------------|
| Tiêu đề modal | `I520:11647;520:9870` | Label | Không tương tác; hiển thị cố định |
| Trường Người nhận (container) | `I520:11647;520:9871` | Frame (search dropdown) | Gõ để lọc autocomplete; click gợi ý để chọn |
| Label "Người nhận" (*) | `I520:11647;520:9872` | Label | Không tương tác |
| Search input người nhận | `I520:11647;520:9873` | Input (autocomplete) | Gõ (≥1 ký tự) → gọi API gợi ý; click chọn → điền giá trị; trống → error state khi submit |
| Toolbar định dạng | `I520:11647;520:9877` | Frame | Chứa các nút định dạng |
| Nút Bold | `I520:11647;520:9881` | Toggle button | Click toggle in đậm; `aria-pressed` phản ánh trạng thái active |
| Nút Italic | `I520:11647;662:11119` | Toggle button | Click toggle in nghiêng; `aria-pressed` phản ánh trạng thái active |
| Nút Stroke (Strikethrough) | `I520:11647;662:11213` | Toggle button | Click toggle gạch ngang; `aria-pressed` phản ánh trạng thái active |
| Nút Number list | `I520:11647;662:10376` | Toggle button | Click toggle danh sách đánh số; `aria-pressed` phản ánh trạng thái active |
| Nút Link | `I520:11647;662:10507` | Button | Click → dialog nhập URL → chèn link vào vị trí con trỏ |
| Nút Quote | `I520:11647;662:10647` | Toggle button | Click toggle trích dẫn (blockquote); `aria-pressed` phản ánh trạng thái active |
| Textarea nội dung | `I520:11647;520:9886` | Rich text editor | Nhập text; gõ "@" → gợi ý mention; required; không giới hạn ký tự |
| Hint text + bộ đếm ký tự | `I520:11647;520:9887` | Label | Hiển thị gợi ý "@+tên" và số ký tự hiện tại (chỉ để tham khảo, không có max) |
| Trường Hashtag (container) | `I520:11647;520:9890` | Frame | Quản lý chip hashtag |
| Label "Hashtag" (*) | `I520:11647;520:9891` | Label | Không tương tác |
| Nút "+ Hashtag" | _(sub-component của E.2)_ | Button | Click → mở dropdown danh sách hashtag có sẵn để chọn; ẩn khi đã có 5 tag |
| Tag Group (chip area) | `I520:11647;662:8595` | Chip group | Hiển thị hashtag đã chọn; click "x" trên chip → xóa tag; tối đa 5 chip |
| Khung Image (container) | `I520:11647;520:9896` | Frame | Quản lý ảnh đính kèm |
| Label "Image" | `I520:11647;520:9897` | Label | Không tương tác |
| Thumbnail ảnh | `I520:11647;662:9197` | Image thumbnail | Hiển thị ảnh đã upload; click "x" → xóa ảnh khỏi danh sách |
| Nút "+ Image" | `I520:11647;662:9132` | Button | Click → file picker (chỉ cho phép image/*); ẩn khi đủ 5 ảnh |
| Checkbox ẩn danh | `I520:11647;520:14099` | Checkbox | Click toggle (default: unchecked); checked → hiện text field tên ẩn danh |
| Text field tên ẩn danh | _(sub-component của G, không có Node ID riêng)_ | Input (optional) | Chỉ hiển thị khi checkbox ẩn danh checked; không bắt buộc; nếu trống → dùng "Ẩn danh" |
| Footer actions | `I520:11647;520:9905` | Frame | Chứa Hủy + Gửi |
| Nút Hủy | `I520:11647;520:9906` | Button | Click → đóng modal, hủy dữ liệu; luôn enabled |
| Nút Gửi | `I520:11647;520:9907` | Button (primary) | Click → validate + submit; disabled khi thiếu required fields; loading state khi đang submit |

### Navigation Flow

- **Entry point**: Sun* Kudos Live Board (`/sun-kudos`) — người dùng click nút "Viết Kudo"
- **Submit thành công**: Modal đóng, quay lại `/sun-kudos` với feed được refresh
- **Hủy / Escape**: Modal đóng, quay lại `/sun-kudos` không thay đổi
- **Chưa đăng nhập**: Redirect về `/login`

### Visual Requirements

- Responsive: modal hiển thị đúng ở mọi breakpoint
- Accessibility (WCAG 2.1 AA): các trường required có `aria-required`; nút Gửi disabled cần `aria-disabled`; toolbar formatting cần `aria-pressed` cho trạng thái toggle; modal cần `role="dialog"` + `aria-modal="true"` + focus trap khi mở
- Keyboard navigation: Tab qua các trường; Escape đóng modal; toolbar buttons accessible bằng keyboard

---

## Requirements

### Functional Requirements

- **FR-001**: Modal PHẢI chỉ truy cập được bởi người dùng đã đăng nhập; unauthenticated → redirect `/login`.
- **FR-002**: Trường "Người nhận" PHẢI bắt buộc; hỗ trợ autocomplete search từ danh sách user trong hệ thống; tối thiểu 1 ký tự để kích hoạt gợi ý; kết quả search phải trim khoảng trắng đầu/cuối.
- **FR-003**: Textarea nội dung PHẢI bắt buộc; hỗ trợ rich text (bold, italic, strikethrough, numbered list, link, blockquote) và @mention đồng nghiệp; bộ đếm ký tự hiển thị để tham khảo, không có giới hạn tối đa.
- **FR-004**: Trường Hashtag PHẢI bắt buộc; người dùng chỉ được chọn từ danh sách hashtag có sẵn (không tạo mới); tối thiểu 1 tag, tối đa 5 tag; mỗi tag hiển thị dạng chip có thể xóa. Hashtag hỗ trợ đa ngôn ngữ (vi/en) — tên hiển thị theo locale hiện tại của người dùng; ID hashtag được lưu trong payload (không lưu tên theo locale).
- **FR-005**: Trường Image KHÔNG bắt buộc; tối đa 5 ảnh; chỉ chấp nhận file image (MIME type `image/*`); file type không hợp lệ bị từ chối với thông báo lỗi; nút "+ Image" ẩn khi đủ 5 ảnh.
- **FR-006**: Nút "Gửi" PHẢI ở trạng thái disabled khi bất kỳ trường bắt buộc nào (Người nhận, Nội dung, Hashtag) chưa được điền.
- **FR-007**: Khi submit thành công, modal PHẢI đóng và feed Kudo trên `/sun-kudos` được refresh.
- **FR-008**: Nút "Hủy" và phím Escape PHẢI đóng modal và hủy toàn bộ dữ liệu đã nhập mà không gửi.
- **FR-009**: Checkbox ẩn danh PHẢI mặc định unchecked; khi checked → hiển thị text field nhập tên ẩn danh (không bắt buộc); khi unchecked → ẩn field và xóa giá trị đã nhập; nếu checked nhưng không nhập tên → dùng "Ẩn danh" làm tên mặc định.
- **FR-010**: Khi submit thất bại (API error/network error): modal giữ nguyên mở, dữ liệu được giữ lại, hiển thị toast thông báo lỗi, nút Gửi trở lại trạng thái enabled để user thử lại.
- **FR-011**: Khi upload ảnh thất bại: thông báo lỗi hiển thị tại vị trí ảnh đó; submit bị block nếu còn ảnh lỗi chưa được xử lý.

### Technical Requirements

- **TR-001**: Component PHẢI là Client Component (`'use client'`) — form state, file upload, và rich text editor đều cần browser APIs.
- **TR-002**: Validation PHẢI được thực hiện cả client-side (UX) và server-side (security) trước khi lưu database.
- **TR-003**: File image PHẢI được upload lên Supabase Storage trước khi submit form; URL của ảnh được gửi kèm payload Kudo — không lưu binary trong database.
- **TR-004**: Dữ liệu rich text PHẢI được sanitize (DOMPurify hoặc tương đương) trước khi lưu (server-side) để ngăn XSS (Principle VI).
- **TR-005**: API endpoint tạo Kudo PHẢI được bảo vệ bằng Supabase Auth server-side check; không tin tưởng client-side auth state.
- **TR-006**: `dangerouslySetInnerHTML` PHẢI có sanitization qua DOMPurify nếu dùng để render rich text (Principle VI).
- **TR-007**: Autocomplete search người nhận PHẢI được debounce (ví dụ: 300ms) để tránh gọi API liên tục.
- **TR-008**: Modal PHẢI implement focus trap khi mở (Escape đóng modal, Tab không thoát khỏi modal).

### Key Entities

- **Kudo**: `{ id, senderId, recipientId, content: string (sanitized HTML), hashtags: string[] (hashtag IDs), imageUrls: string[], isAnonymous: boolean, anonymousDisplayName: string, createdAt }`
- **User** (người nhận / mention): `{ id, name, avatar }` — dùng để autocomplete và @mention
- **Hashtag**: `{ id, names: { vi: string, en: string } }` — danh sách do admin định nghĩa; người dùng chỉ chọn, không tạo mới; mỗi hashtag có tên riêng cho từng locale (vi/en)

---

## State Management

### Local Component State

| State | Type | Initial Value | Description |
|-------|------|---------------|-------------|
| `recipient` | `{ id: string, name: string } \| null` | `null` | Người nhận đã chọn |
| `recipientQuery` | `string` | `""` | Text đang nhập để search người nhận |
| `autocompleteResults` | `User[]` | `[]` | Kết quả gợi ý từ API search |
| `content` | `string` (sanitized HTML) | `""` | Nội dung lời cảm ơn từ rich text editor |
| `hashtags` | `string[]` | `[]` | Danh sách **ID** hashtag đã chọn (tối đa 5) |
| `hashtagSuggestions` | `{ id: string, name: string }[]` | `[]` | Danh sách hashtag có sẵn từ API (tên đã được localize theo locale hiện tại) |
| `mentionSuggestions` | `User[]` | `[]` | Kết quả gợi ý @mention trong textarea |
| `images` | `{ file: File, url: string, status: 'uploading' \| 'done' \| 'error' }[]` | `[]` | Ảnh đính kèm và trạng thái upload |
| `isAnonymous` | `boolean` | `false` | Gửi ẩn danh |
| `anonymousName` | `string` | `""` | Tên ẩn danh tự đặt (optional; default "Ẩn danh" nếu trống) |
| `isSubmitting` | `boolean` | `false` | Trạng thái loading khi submit |
| `submitError` | `string \| null` | `null` | Thông báo lỗi khi submit thất bại (hiện qua toast) |
| `fieldErrors` | `{ recipient?: string, content?: string, hashtags?: string }` | `{}` | Lỗi validation từng trường bắt buộc |

### Global State / Side Effects

- **Sau submit thành công**: Trigger refresh danh sách Kudo trên `/sun-kudos` (dùng `router.refresh()` — phù hợp với Next.js App Router, không cần global store).
- **Autocomplete search người nhận**: Debounced API call (≥1 ký tự, ~300ms delay).
- **Hashtag list**: Fetch một lần khi dropdown "+ Hashtag" mở lần đầu; cache trong local state.
- **@mention**: Debounced API call (reuse `/api/users/search`) khi gõ "@" trong textarea.
- **Image upload**: Mỗi ảnh được upload ngay khi chọn, trước khi submit form.

### No Global Store

Form state không cần global store — chỉ tồn tại trong lifecycle của modal component.

---

## API Dependencies

| Endpoint | Method | Purpose | Triggered by | Status |
|----------|--------|---------|--------------|--------|
| `GET /api/users/search?q={query}` | GET | Tìm kiếm người nhận (autocomplete) | Gõ ≥1 ký tự vào trường Người nhận (debounced) | Predicted (New) |
| `GET /api/users/search?q={query}` | GET | Tìm kiếm mention (`@name`) trong textarea | Gõ "@" + ký tự trong textarea (debounced) | Predicted (reuses same endpoint) |
| `GET /api/hashtags?locale={vi\|en}` | GET | Lấy danh sách hashtag có sẵn — tên đã được localize theo `locale` param (fallback `vi`); trả về `{ id, name }[]` | Click "+ Hashtag" lần đầu | Predicted (New) |
| `POST /api/kudos` | POST | Tạo Kudo mới | Click "Gửi" (sau khi images đã upload xong) | Predicted (New) |
| Supabase Storage `upload` | — | Upload từng ảnh ngay khi user chọn file | Chọn file từ file picker | Predicted (New) |

**Payload `POST /api/kudos` (predicted):**
```json
{
  "recipientId": "string",
  "content": "string (sanitized HTML)",
  "hashtags": ["string (hashtag ID)"],
  "imageUrls": ["string"],
  "isAnonymous": "boolean",
  "anonymousDisplayName": "string | null"
}
```

**Response thành công (predicted):** `201 Created` + `{ id, ... }`
**Response lỗi (predicted):** `400 Bad Request` (validation) | `401 Unauthorized` | `500 Internal Server Error`

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Người dùng đã đăng nhập có thể gửi Kudo với Người nhận + Nội dung + 1 Hashtag trong < 60 giây.
- **SC-002**: Kudo xuất hiện trên feed `/sun-kudos` ngay sau khi modal đóng (không cần manual reload).
- **SC-003**: Nút "Gửi" disabled chính xác khi thiếu bất kỳ trường bắt buộc nào.
- **SC-004**: Validation lỗi hiển thị đúng trường bị thiếu khi cố gắng submit form rỗng.
- **SC-005**: Ảnh không hợp lệ (pdf, mp4, txt) bị từ chối với thông báo lỗi rõ ràng.
- **SC-006**: Gửi ẩn danh hoạt động đúng — Kudo hiển thị tên ẩn danh (hoặc "Ẩn danh") thay vì tên thật.
- **SC-007**: Khi submit thất bại, dữ liệu đã nhập không bị mất; user có thể thử lại mà không cần nhập lại từ đầu.

---

## Out of Scope

- Gửi Kudo cho nhiều người nhận cùng lúc (chỉ hỗ trợ 1 người nhận).
- Tạo hashtag mới (chỉ chọn từ danh sách admin định nghĩa).
- Lưu nháp (draft) Kudo trước khi gửi.
- Chỉnh sửa hoặc xóa Kudo sau khi đã gửi.
- Reaction hoặc comment trên Kudo (thuộc về feed, không phải form tạo mới).
- Hashtag phân cấp hoặc category.

---

## Dependencies

- [x] Constitution document exists (`.momorph/constitution.md`)
- [ ] API specifications available (`.momorph/API.yml`) — không tồn tại; endpoints predicted
- [ ] Database design completed (`.momorph/database.sql`) — không tồn tại; schema predicted
- [x] Screen flow documented (`.momorph/SCREENFLOW.md`)

---

## Notes

- **Modal vs Page**: Mặc dù SCREENFLOW liệt kê route `/sun-kudos/write`, các test cases xác nhận đây là **modal overlay** trên màn hình `/sun-kudos`. Implementation nên dùng modal (dialog) thay vì navigate sang route mới, hoặc dùng Next.js [intercepting routes](https://nextjs.org/docs/app/building-your-application/routing/intercepting-routes) để URL có thể share được nếu cần.
- **Rich text editor**: Cần chọn thư viện (Tiptap được khuyến nghị — TypeScript, @mention extension, headless). Phải justify trong plan theo Principle V.
- **@mention**: Reuse endpoint `/api/users/search` (DRY) — không tạo endpoint riêng.
- **Image upload flow**: Upload ngay khi chọn (không đợi submit) → lấy URL → gửi URL cùng payload. Nếu upload thất bại, block submit cho đến khi ảnh lỗi được xóa hoặc re-upload thành công.
- **XSS**: Rich text content phải sanitize cả server-side (khi lưu) và client-side (khi render qua DOMPurify) theo Principle VI.
- **Accepted image types**: `accept="image/*"` trên file input — cho phép mọi MIME type image (jpg, png, gif, webp, v.v.); file picker sẽ lọc sẵn; server-side cũng validate MIME type.
- **anonymousDisplayName**: Nếu `isAnonymous=true` và user không nhập tên → server lưu `anonymousDisplayName = "Ẩn danh"`.
