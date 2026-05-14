# Feature Specification: Language Dropdown

**Frame ID**: `hUyaaugye2`
**Frame Name**: `Dropdown-ngôn ngữ`
**File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**Created**: 2026-05-15
**Status**: Draft

---

## Overview

A language switcher dropdown component embedded in the site header, allowing authenticated and unauthenticated users to switch the interface language between Vietnamese (VN) and English (EN). The selection is persisted via a `lang` cookie and the page is re-rendered to apply the new locale. The component is globally available on all routes via the shared `Header` component.

This is a **component spec**, not a page spec — the component has no dedicated route.

---

## User Scenarios & Testing

### User Story 1 — Switch Interface Language (Priority: P1)

A user sees the language switcher button in the header showing their current language (flag + code). They click it to open a dropdown listing available languages, then click their desired language to switch. The interface reloads in the new language.

**Why this priority**: Core UX feature — users who prefer English need this to read all labels, links, and content in their language.

**Independent Test**: Render the `LanguageSwitcher` component with `currentLocale="vi"`. Click the button → dropdown opens showing VN and EN options. Click "EN" → cookie `lang=en` is set, `router.refresh()` is called.

**Acceptance Scenarios**:

1. **Given** the user is on any page with `currentLocale="vi"`, **When** they click the language button, **Then** a dropdown opens listing both `VN` and `EN` options.
2. **Given** the dropdown is open, **When** the user clicks "EN", **Then** the cookie `lang=en` is set (max-age=31536000, path=/), `router.refresh()` is called, and the dropdown closes.
3. **Given** the dropdown is open, **When** the user clicks "VN", **Then** the cookie `lang=vi` is set, `router.refresh()` is called, and the dropdown closes.
4. **Given** `currentLocale="en"`, **When** the page renders, **Then** the button displays the EN flag and "EN" label.
5. **Given** `currentLocale="vi"`, **When** the page renders, **Then** the button displays the VN flag and "VN" label.

---

### User Story 2 — Dismiss Dropdown Without Switching (Priority: P2)

A user opens the language dropdown but changes their mind and wants to close it without switching languages.

**Why this priority**: Essential UX — users must be able to cancel the action.

**Independent Test**: Open dropdown → click outside the component → dropdown closes. Open dropdown → press Escape → dropdown closes.

**Acceptance Scenarios**:

1. **Given** the dropdown is open, **When** the user clicks anywhere outside the dropdown, **Then** the dropdown closes without changing the language.
2. **Given** the dropdown is open, **When** the user presses the `Escape` key, **Then** the dropdown closes without changing the language and focus returns to the trigger button.
3. **Given** the dropdown is open, **When** the user clicks the language button again, **Then** the dropdown closes (toggle behavior).

---

### User Story 3 — Keyboard Navigation (Priority: P3)

A keyboard-only or screen-reader user can operate the language switcher without a mouse.

**Why this priority**: WCAG 2.1 AA compliance — keyboard accessibility is required.

**Independent Test**: Tab to the language button → Enter to open → Arrow keys to navigate options → Enter to select.

**Acceptance Scenarios**:

1. **Given** focus is on the language button, **When** the user presses `Enter` or `Space`, **Then** the dropdown opens and focus moves to the first option.
2. **Given** the dropdown is open, **When** the user presses `ArrowDown`/`ArrowUp`, **Then** focus moves between available language options.
3. **Given** focus is on a language option, **When** the user presses `Enter`, **Then** that language is selected, the cookie is set, and the dropdown closes.
4. **Given** the dropdown is open, **When** the user presses `Tab`, **Then** the dropdown closes and focus moves to the next focusable element.

---

### Edge Cases

- **Invalid locale cookie**: If `lang` cookie contains an unrecognized value, the UI defaults to Vietnamese (`vi`).
- **Single-language scenario**: If only one locale is supported in future, the dropdown button should still render (with no options) — but this is out of scope for now.
- **Missing locale prop**: If `currentLocale` prop is undefined/null, default to `vi`.
- **Rapid clicks**: Multiple rapid clicks on the button must not cause race conditions — toggle state is managed locally.

---

## UI/UX Requirements

### Screen Components

| Component | Node ID | Type | Interactions |
|-----------|---------|------|--------------|
| Dropdown-List (container) | `525:11713` | `INSTANCE` | Click trigger to open/close; renders selected + option states |
| tiếng Việt (VN option) | `I525:11713;362:6085` | `INSTANCE` (list_item) | Click to select Vietnamese; hover highlight; selected state bg |
| tiếng Anh (EN option) | `I525:11713;362:6128` | `INSTANCE` (button/icon_text) | Click to select English; hover highlight; active state bg |

### Component Behavior Detail

#### Dropdown-List (`525:11713`)
- **Trigger button**: displays current locale — flag icon (left) + locale code (right) + chevron icon
- **Chevron**: rotates 180° when open, resets when closed
- **Open state**: renders option list below the trigger button
- **Closed state**: renders only the trigger button
- **Selected item** (top section): visually distinct background state (currently active locale)
- **Option item** (bottom section): default background state (non-selected locale)

#### tiếng Việt option (`I525:11713;362:6085`)
- Label: "VN" code + Vietnam flag icon
- States: default, hover (highlight background), selected (distinct background)
- Action: `onClick` → `selectLocale('vi')` → sets `lang=vi` cookie + `router.refresh()` + closes dropdown

#### tiếng Anh option (`I525:11713;362:6128`)
- Label: "EN" code + UK/England flag icon
- States: default, hover (highlight background), active (highlight background)
- Action: `onClick` → `selectLocale('en')` → sets `lang=en` cookie + `router.refresh()` + closes dropdown

### Navigation Flow

- **From**: Any page (component is in the global `Header`)
- **To**: Same page, same route — but re-rendered with the new locale
- **Trigger**: `router.refresh()` after cookie write

### Visual Requirements

- Responsive: component must render correctly at all breakpoints (header is full-width)
- Animations: chevron rotation on open/close
- Accessibility: WCAG 2.1 AA — keyboard navigable, screen-reader labelled, `aria-expanded`, `aria-haspopup="listbox"`, `role="listbox"`, `role="option"`, `aria-selected`

---

## Requirements

### Functional Requirements

- **FR-001**: The dropdown MUST display the currently active locale (flag + code) in the trigger button.
- **FR-002**: The dropdown MUST list all supported locales as selectable options when open.
- **FR-003**: Selecting a locale MUST set the `lang` cookie with `path=/; max-age=31536000; SameSite=Lax`.
- **FR-004**: After locale selection, the page MUST refresh (`router.refresh()`) to apply the new locale via `next-intl`.
- **FR-005**: The dropdown MUST close immediately after a locale is selected.
- **FR-006**: The dropdown MUST close when the user clicks outside the component.
- **FR-007**: The trigger button MUST have `aria-expanded` reflecting the open/closed state.
- **FR-008**: The option list MUST have `role="listbox"` and each option `role="option"` with `aria-selected`.
- **FR-009**: Each locale option MUST display the correct flag icon for that locale (VN flag for Vietnamese, UK/EN flag for English).

### Technical Requirements

- **TR-001**: `LanguageSwitcher` MUST be a Client Component (`'use client'`) — it uses browser state and DOM events.
- **TR-002**: Locale persistence MUST use the `lang` cookie only — no localStorage, no server-side session.
- **TR-003**: The component receives `currentLocale: string` as a prop — it does NOT read the cookie directly.
- **TR-004**: The component lives at `app/components/language-switcher.tsx` (shared, not feature-scoped) since it is used in the global Header.
- **TR-005**: Close-on-outside-click MUST be implemented via a `useEffect` with a `mousedown` event listener on `document`, cleaned up on unmount.

### Key Entities

- **Locale**: `{ code: string, label: string, flag: string, flagAlt: string }` — supported values: `vi` (VN) and `en` (EN).
- **lang cookie**: string value `'vi'` or `'en'`, path=`/`, max-age=1 year.

---

## State Management

### Local Component State

| State | Type | Initial Value | Description |
|-------|------|---------------|-------------|
| `open` | `boolean` | `false` | Controls dropdown open/closed visibility |

### Props (Not State)

| Prop | Type | Source | Description |
|------|------|--------|-------------|
| `currentLocale` | `string` | Server Component (parent `Header`) reads `lang` cookie via `next-intl` | The active locale code (`'vi'` or `'en'`). Defaults to `'vi'` if absent. |

### No Global State

Locale is not stored in React context or any global store. The source of truth is the `lang` cookie, read on each server render. The component only manages local `open` state.

### Side Effects

- **On locale select**: write `lang=<code>` cookie → call `router.refresh()` → React Server Components re-render with new locale from cookie. No optimistic update needed (page refresh is the signal).
- **On mount**: register `mousedown` listener on `document` for outside-click detection. Clean up on unmount.
- **On Escape keydown**: close dropdown, return focus to trigger button. Listener registered only while dropdown is open.

---

## API Dependencies

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| None — locale switching is client-side cookie + page refresh | — | — | — |

No backend API calls are required. Locale is read server-side from the `lang` cookie by `next-intl` middleware on each request.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Clicking "EN" in the dropdown switches all UI labels to English within one page refresh.
- **SC-002**: Clicking "VN" in the dropdown switches all UI labels to Vietnamese within one page refresh.
- **SC-003**: The `lang` cookie persists across browser sessions (max-age=1 year).
- **SC-004**: The component passes all existing unit tests in `app/components/language-switcher.test.tsx`.
- **SC-005**: The component is keyboard-navigable (Tab, Enter, Escape, Arrow keys).

---

## Out of Scope

- Adding additional languages beyond VN and EN.
- Server-side locale detection via browser `Accept-Language` header.
- Animated slide-in/slide-out for the dropdown panel (beyond chevron rotation).
- Language-specific URL routing (e.g., `/en/...`, `/vi/...`) — project uses cookie-based locale only.

---

## Dependencies

- [x] Constitution document exists (`.momorph/constitution.md`)
- [ ] API specifications available (`.momorph/API.yml`) — not required for this feature
- [ ] Database design completed (`.momorph/database.sql`) — not required for this feature
- [x] Screen flow documented (`.momorph/SCREENFLOW.md`)

---

## Notes

- **Bug in current implementation**: Both `vi` and `en` locales reference the same flag image (`flag-vn.svg`). The `en` locale should use a UK flag asset. Implementation must fix this.
- **Flag assets**: VN flag is at `/assets/login/icons/flag-vn.svg`. A UK/EN flag asset needs to be sourced from Figma (`list_media_nodes(screenId="hUyaaugye2")`) or the existing icons directory.
- **Existing component**: `app/components/language-switcher.tsx` already implements this feature partially. The implementation task should patch it rather than rewrite: fix the flag asset for EN, add close-on-outside-click (currently missing), and add keyboard navigation (US3).
- **Constitution alignment**: Client Component allowed (browser state required), design tokens via CSS variables, TDD required per Principle III.
