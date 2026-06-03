'use client'

import { useCallback, useEffect, useState } from 'react'
import type { HashtagItem } from '@/lib/kudos/kudo-types'
import type {
  KudoPost,
  KudosPage,
  LiveBoardFilters,
  LiveBoardStats,
  SpotlightNode,
  SunnerActivity,
} from '@/lib/kudos/live-board-types'
import { AllKudosSection } from './all-kudos-section'
import { HighlightKudosSection } from './highlight-kudos-section'
import { KudoHeroSection } from './kudo-hero-section'
import { RightSidebar } from './right-sidebar'

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

export function LiveBoardClient({
  currentUserId,
  initialTopKudos,
  initialPage,
  hashtags,
  departments,
  initialStats,
  spotlightNodes,
  spotlightTotal,
  recentGiftRecipients,
  locale,
}: LiveBoardClientProps) {
  const [filters, setFilters] = useState<LiveBoardFilters>({ hashtagId: null, department: null })
  const [topKudos, setTopKudos] = useState<KudoPost[]>(initialTopKudos)
  const [allKudosPages, setAllKudosPages] = useState<KudoPost[][]>([initialPage.items])
  const [nextCursor, setNextCursor] = useState<string | null>(initialPage.nextCursor)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const buildParams = (f: LiveBoardFilters, extra?: Record<string, string>) => {
    const p = new URLSearchParams({ locale })
    if (f.hashtagId) p.set('hashtagId', f.hashtagId)
    if (f.department) p.set('department', f.department)
    if (extra) Object.entries(extra).forEach(([k, v]) => p.set(k, v))
    return p
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsRefreshing(true)
    setHighlightIndex(0)

    Promise.all([
      fetch(`/api/kudos/top?${buildParams(filters, { limit: '5' })}`).then((r) => r.json()),
      fetch(`/api/kudos?${buildParams(filters)}`).then((r) => r.json()),
    ])
      .then(([topData, pageData]) => {
        setTopKudos(topData.items ?? [])
        setAllKudosPages([pageData.items ?? []])
        setNextCursor(pageData.nextCursor ?? null)
      })
      .catch(console.error)
      .finally(() => setIsRefreshing(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const onFilterChange = useCallback((partial: Partial<LiveBoardFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }))
  }, [])

  const onHashtagClick = useCallback((hashtagId: string) => {
    setFilters((prev) => ({ ...prev, hashtagId: prev.hashtagId === hashtagId ? null : hashtagId }))
  }, [])

  const loadMoreKudos = useCallback(async () => {
    if (!nextCursor || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      const res = await fetch(`/api/kudos?${buildParams(filters, { cursor: nextCursor })}`)
      const data = await res.json()
      setAllKudosPages((prev) => [...prev, data.items ?? []])
      setNextCursor(data.nextCursor ?? null)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoadingMore(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextCursor, isLoadingMore, filters, locale])

  const handleLikeToggle = useCallback(async (kudoId: string) => {
    const updateKudo = (k: KudoPost): KudoPost => {
      if (k.id !== kudoId) return k
      const liked = !k.likedByCurrentUser
      return { ...k, likedByCurrentUser: liked, likeCount: k.likeCount + (liked ? 1 : -1) }
    }

    // Optimistic update
    setTopKudos((prev) => prev.map(updateKudo))
    setAllKudosPages((prev) => prev.map((page) => page.map(updateKudo)))

    try {
      const res = await fetch(`/api/kudos/${kudoId}/like`, { method: 'POST' })
      if (!res.ok) throw new Error('like failed')
      const data = await res.json()

      // Reconcile with server truth
      const reconcile = (k: KudoPost): KudoPost => {
        if (k.id !== kudoId) return k
        return { ...k, likedByCurrentUser: data.liked, likeCount: data.likeCount }
      }
      setTopKudos((prev) => prev.map(reconcile))
      setAllKudosPages((prev) => prev.map((page) => page.map(reconcile)))
    } catch {
      // Revert optimistic update
      const revert = (k: KudoPost): KudoPost => {
        if (k.id !== kudoId) return k
        const liked = !k.likedByCurrentUser
        return { ...k, likedByCurrentUser: liked, likeCount: k.likeCount + (liked ? 1 : -1) }
      }
      setTopKudos((prev) => prev.map(revert))
      setAllKudosPages((prev) => prev.map((page) => page.map(revert)))
    }
  }, [])

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      <KudoHeroSection hashtags={hashtags} />

      <HighlightKudosSection
        items={topKudos}
        currentIndex={highlightIndex}
        onIndexChange={setHighlightIndex}
        filters={filters}
        onFilterChange={onFilterChange}
        hashtags={hashtags}
        departments={departments}
        onHashtagClick={onHashtagClick}
        onLikeToggle={handleLikeToggle}
        spotlightNodes={spotlightNodes}
        spotlightTotal={spotlightTotal}
      />

      <div className="flex gap-8 px-9 py-8" style={{ opacity: isRefreshing ? 0.6 : 1, transition: 'opacity 0.2s' }}>
        <AllKudosSection
          pages={allKudosPages}
          nextCursor={nextCursor}
          isLoadingMore={isLoadingMore}
          currentUserId={currentUserId}
          onLoadMore={loadMoreKudos}
          onHashtagClick={onHashtagClick}
          onLikeToggle={handleLikeToggle}
        />
        <RightSidebar stats={initialStats} recentGiftRecipients={recentGiftRecipients} />
      </div>
    </main>
  )
}
