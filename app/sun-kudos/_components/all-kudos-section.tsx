'use client'

import { useEffect, useRef } from 'react'
import type { KudoPost } from '@/lib/kudos/live-board-types'
import { KudoPostCard } from './kudo-post-card'

interface AllKudosSectionProps {
  pages: KudoPost[][]
  nextCursor: string | null
  isLoadingMore: boolean
  currentUserId: string
  onLoadMore: () => void
  onHashtagClick: (hashtagId: string) => void
  onLikeToggle: (kudoId: string) => void
}

export function AllKudosSection({
  pages,
  nextCursor,
  isLoadingMore,
  currentUserId,
  onLoadMore,
  onHashtagClick,
  onLikeToggle,
}: AllKudosSectionProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const items = pages.flat()

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextCursor && !isLoadingMore) {
          onLoadMore()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [nextCursor, isLoadingMore, onLoadMore])

  return (
    <section className="flex-1 min-w-0 flex flex-col gap-4">
      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide">Tất cả Kudos</h2>

      {items.length === 0 && !isLoadingMore ? (
        <p className="text-sm text-gray-400 text-center py-12">Hiện tại chưa có Kudos nào.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((kudo) => (
            <KudoPostCard
              key={kudo.id}
              kudo={kudo}
              currentUserId={currentUserId}
              onHashtagClick={onHashtagClick}
              onLikeToggle={onLikeToggle}
            />
          ))}
        </div>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-1" />

      {isLoadingMore && (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 rounded-full border-2 border-orange-400 border-t-transparent animate-spin" aria-label="Đang tải thêm" />
        </div>
      )}
    </section>
  )
}
