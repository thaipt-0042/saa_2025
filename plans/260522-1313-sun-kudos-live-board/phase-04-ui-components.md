---
phase: 4
title: UI Components
status: pending
priority: critical
effort: L
blockedBy: [phase-03-api-routes.md]
---

# Phase 4 — UI Components

Build order: page → layout → hero → highlight → all kudos → sidebar → spotlight.
Each component must be independently testable.

---

## 4.1 Page: `app/sun-kudos/page.tsx` (replace stub)

Server Component — fetches initial data, passes to client:

```typescript
// Parallel SSR fetch:
const [topKudos, firstPage, hashtags, departments, stats, spotlightData, recentGifts] =
  await Promise.all([
    getTopKudos(user.id, {}, 5, supabase, locale),
    listKudos(user.id, {}, null, 10, supabase, locale),
    getHashtags(locale, supabase),
    getDepartments(supabase),
    getUserStats(user.id, supabase),
    getSpotlightData(supabase, 100),
    getRecentGiftRecipients(supabase),
  ])

return (
  <>
    <Header ... />
    <LiveBoardClient
      currentUserId={user.id}
      initialTopKudos={topKudos}
      initialPage={firstPage}
      hashtags={hashtags}
      departments={departments}
      initialStats={stats}
      spotlightNodes={spotlightData}
      spotlightTotal={totalKudoCount}
      recentGiftRecipients={recentGifts}
      locale={locale}
    />
    <Footer />
  </>
)
```

---

## 4.2 `app/sun-kudos/_components/live-board-client.tsx`

`'use client'` — root client component managing shared state:

```typescript
interface LiveBoardClientProps {
  currentUserId: string
  initialTopKudos: KudoPost[]
  initialPage: KudosPage
  hashtags: HashtagItem[]
  departments: string[]
  initialStats: LiveBoardStats
  spotlightNodes: SpotlightNode[]
  spotlightTotal: number
  recentGiftRecipients: SunnerActivity[]
  locale: string
}
```

State:
```typescript
const [filters, setFilters] = useState<LiveBoardFilters>({ hashtagId: null, department: null })
const [topKudos, setTopKudos] = useState(initialTopKudos)
const [allKudosPages, setAllKudosPages] = useState([initialPage.items])
const [nextCursor, setNextCursor] = useState(initialPage.nextCursor)
const [isLoadingMore, setIsLoadingMore] = useState(false)
const [highlightIndex, setHighlightIndex] = useState(0)  // carousel position
```

Filter change effect — re-fetch both sections when filters change:
```typescript
useEffect(() => {
  // fetch new top kudos + reset all kudos list
}, [filters])
```

Passed down to children:
- `onFilterChange(partial: Partial<LiveBoardFilters>)` — unified setter
- `onHashtagClick(hashtagId: string)` — shortcut used by kudo cards

Layout JSX:
```tsx
<main>
  <KudoHeroSection onWriteClick={...} hashtags={hashtags} />
  <HighlightKudosSection
    items={topKudos}
    currentIndex={highlightIndex}
    onIndexChange={setHighlightIndex}
    filters={filters}
    onFilterChange={onFilterChange}
    hashtags={hashtags}
    departments={departments}
  />
  {/* Spotlight Board is inside highlight section (B.7) */}
  <div style={{ display: 'flex', gap: 32, padding: '0 144px 64px' }}>
    <AllKudosSection
      pages={allKudosPages}
      nextCursor={nextCursor}
      isLoadingMore={isLoadingMore}
      currentUserId={currentUserId}
      onLoadMore={loadMoreKudos}
      onHashtagClick={onHashtagClick}
      onLikeToggle={handleLikeToggle}
    />
    <RightSidebar
      stats={initialStats}
      recentGiftRecipients={recentGiftRecipients}
    />
  </div>
</main>
```

---

## 4.3 `app/sun-kudos/_components/kudo-hero-section.tsx`

```typescript
// Props: onWriteClick, hashtags (to pass to modal)
```

- Static banner: title "Hệ thống ghi nhận lời cảm ơn" + SAA KUDOS logo image
- Renders `<WriteKudoTrigger>` + `<WriteKudoModal>`
- Background: decorative graphics (fetch from Figma at implementation time via `query_section`)

---

## 4.4 `app/sun-kudos/_components/write-kudo-trigger.tsx`

Pill-shaped input-like button (node `2940:13449`):

```typescript
// Props: onClick: () => void
```

- Display: pen icon left + placeholder text "Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?"
- Styling: pill shape, `var(--color-cta-primary)` border or background (confirm via `query_section`)
- Interaction: entire element is clickable → calls `onClick`
- Accessibility: `role="button"`, `aria-label="Ghi nhận lời cảm ơn"`

---

## 4.5 `app/sun-kudos/_components/highlight-kudos-section.tsx`

Wraps B header + carousel + spotlight:

```typescript
// Props: items, currentIndex, onIndexChange, filters, onFilterChange, hashtags, departments
```

Structure:
```tsx
<section>
  <FilterBar filters={filters} onFilterChange={onFilterChange} hashtags={hashtags} departments={departments} />
  {/* B header: "HIGHLIGHT KUDOS" */}
  <div style={{ position: 'relative', overflow: 'hidden' }}>
    {/* Carousel container — translate on currentIndex change */}
    <div style={{ display: 'flex', transform: `translateX(calc(...))`, transition: 'transform 0.3s ease' }}>
      {items.map((kudo, i) => (
        <KudoHighlightCard
          key={kudo.id}
          kudo={kudo}
          isActive={i === currentIndex}
          onHashtagClick={onHashtagClick}
          onLikeToggle={...}
        />
      ))}
    </div>
  </div>
  <CarouselNav current={currentIndex + 1} total={items.length} onPrev={...} onNext={...} />
  {/* B.6 Spotlight header + B.7 SpotlightBoard rendered below */}
</section>
```

Active card: full opacity + slight scale-up. Inactive: `opacity: 0.4`.

---

## 4.6 `app/sun-kudos/_components/filter-bar.tsx`

```typescript
// Props: filters, onFilterChange, hashtags: HashtagItem[], departments: string[]
```

- Two dropdown selects: Hashtag + Phòng ban
- "Active" styling when a filter is selected
- On select: calls `onFilterChange({ hashtagId: value })` or `onFilterChange({ department: value })`
- Clear option ("Tất cả") at top of each dropdown

---

## 4.7 `app/sun-kudos/_components/kudo-highlight-card.tsx`

Reusable card used in the carousel (B.3):

```typescript
// Props: kudo: KudoPost, isActive: boolean, onHashtagClick, onLikeToggle
```

Sections:
- Sender block: avatar + name + department + star badges (★ count)
- Arrow icon (decorative)
- Recipient block: same structure
- Time: `HH:mm - MM/DD/YYYY`
- Content: `line-clamp: 3` (CSS `-webkit-line-clamp: 3`)
- Hashtags: up to 5, truncate with "..." if overflow
- Action bar: `<KudoActionBar>` with hearts + copy link + "Xem chi tiết" button
- Pointer: `cursor: default` on inactive cards (no interaction when muted)

Star display logic:
```typescript
function StarBadges({ count }: { count: number }) {
  return <span>{'★'.repeat(count)}</span>
}
```

---

## 4.8 `app/sun-kudos/_components/carousel-nav.tsx`

```typescript
// Props: current: number, total: number, onPrev: () => void, onNext: () => void
```

- Layout: `[←] [2/5] [→]`
- Left arrow disabled when `current === 1`
- Right arrow disabled when `current === total`

---

## 4.9 `app/sun-kudos/_components/spotlight-board.tsx`

```typescript
// Props: nodes: SpotlightNode[], totalCount: number
```

- Header: `{totalCount} KUDOS` label + search input + Pan/Zoom toggle button
- Canvas: `position: relative`, fixed height (~400px)
- Nodes: `position: absolute` scattered via seeded pseudo-random offsets derived from userId
  (use `hashCode(userId) % maxOffset` to keep stable positions across re-renders)
- Font size: `12px + (kudosReceived / maxKudos) * 24px` (clamp 12–36px)
- Hover: CSS tooltip via `title` attribute or custom `<div>` overlay with name + time
- Click: `router.push('/profile/' + userId)` (stub route)
- Search: filter visible nodes by `fullName.toLowerCase().includes(query)`
- Pan: track offset state, apply `transform: translate(x, y)` to canvas
- Zoom toggle: alternates `transform: scale(1)` / `transform: scale(1.5)` on canvas

---

## 4.10 `app/sun-kudos/_components/all-kudos-section.tsx`

```typescript
// Props: pages, nextCursor, isLoadingMore, currentUserId, onLoadMore, onHashtagClick, onLikeToggle
```

- Flattens `pages` array into single list for rendering
- `<IntersectionObserver>` sentinel at bottom: when visible + nextCursor exists → calls `onLoadMore()`
- Loading spinner when `isLoadingMore`
- Empty state: "Hiện tại chưa có Kudos nào."
- Each item: `<KudoPostCard>`

---

## 4.11 `app/sun-kudos/_components/kudo-post-card.tsx`

Full feed card (C.3), broader than highlight card:

```typescript
// Props: kudo: KudoPost, currentUserId: string, onHashtagClick, onLikeToggle
```

Sections:
- Sender info block (avatar, name, dept, stars)
- Sent-arrow icon
- Recipient info block
- Time label
- Content: `line-clamp: 5`
- `<KudoImageGallery images={kudo.imageUrls} />`
- Hashtags row (click → onHashtagClick)
- `<KudoActionBar>` — hearts + copy link (no "Xem chi tiết" in feed cards per C.4 spec)

---

## 4.12 `app/sun-kudos/_components/kudo-image-gallery.tsx`

```typescript
// Props: images: string[]
```

- Renders up to 5 thumbnail squares in a row
- Click opens image in a new tab (`target="_blank"`)
- Returns `null` when `images.length === 0`

---

## 4.13 `app/sun-kudos/_components/kudo-action-bar.tsx`

```typescript
// Props: kudoId, likeCount, likedByCurrentUser, senderIsCurrentUser,
//         showDetailButton: boolean, onLikeToggle, locale
```

- Heart button: disabled when `senderIsCurrentUser`; filled red when `likedByCurrentUser`; grey otherwise
- Optimistic update: toggle state immediately, revert on API error
- Copy Link: `navigator.clipboard.writeText(url)` → shows `<ToastNotification>` "Link copied — ready to share!"
- "Xem chi tiết": only rendered when `showDetailButton === true` (highlight cards); navigates to `#` stub

---

## 4.14 `app/sun-kudos/_components/right-sidebar.tsx`

```typescript
// Props: stats: LiveBoardStats, recentGiftRecipients: SunnerActivity[]
```

Fixed-width (~320px), sticky within the row:
```tsx
<aside style={{ width: 320, position: 'sticky', top: 80, alignSelf: 'flex-start' }}>
  <StatsBlock stats={stats} />
  <RecentGiftsList recipients={recentGiftRecipients} />
</aside>
```

---

## 4.15 `app/sun-kudos/_components/stats-block.tsx`

```typescript
// Props: stats: LiveBoardStats
```

6 stat rows:
- Số Kudos bạn nhận được: `{kudosReceived}`
- Số Kudos bạn đã gửi: `{kudosSent}`
- Số tim bạn nhận được: `{heartsReceived}`
- Số Secret Box bạn đã mở: `{secretBoxesOpened}`
- Số Secret Box chưa mở: `{secretBoxesUnopened}`
- Divider
- Button "Mở quà" → opens stub dialog (alert or placeholder `<dialog>`)

---

## 4.16 `app/sun-kudos/_components/recent-gifts-list.tsx`

```typescript
// Props: recipients: SunnerActivity[]
```

- Header: "10 SUNNER NHẬN QUÀ MỚI NHẤT"
- List: avatar circle + name + description
- Empty state: "Chưa có dữ liệu"
- Click name/avatar: navigate to `/profile/{userId}` (stub)

---

## Todo

- [ ] Replace `app/sun-kudos/page.tsx` stub with full SSR data fetch
- [ ] `live-board-client.tsx` — layout + filter state + like handler + load more
- [ ] `kudo-hero-section.tsx` — banner + write trigger
- [ ] `write-kudo-trigger.tsx` — pill button
- [ ] `highlight-kudos-section.tsx` — carousel + filter bar
- [ ] `filter-bar.tsx` — hashtag + department dropdowns
- [ ] `kudo-highlight-card.tsx` — carousel card
- [ ] `carousel-nav.tsx` — prev/next + page indicator
- [ ] `spotlight-board.tsx` — CSS word cloud
- [ ] `all-kudos-section.tsx` — infinite scroll feed
- [ ] `kudo-post-card.tsx` — feed card
- [ ] `kudo-image-gallery.tsx` — thumbnail row
- [ ] `kudo-action-bar.tsx` — hearts + copy link
- [ ] `right-sidebar.tsx` — sidebar wrapper
- [ ] `stats-block.tsx` — 6 stats + open gift button
- [ ] `recent-gifts-list.tsx` — sunner list

## Success Criteria

- KV hero + write trigger renders and opens WriteKudoModal
- Highlight carousel shows top 5, prev/next work, active card distinct
- Filtering by hashtag or department re-fetches and updates both sections
- Clicking hashtag chip in a card updates filter
- All Kudos loads first page, loads next page on scroll to bottom
- Heart button disabled for sender, toggles + shows optimistic update for others
- Copy link shows toast
- Sidebar stats display correctly
- Spotlight board renders nodes, search filters visible nodes
