import type { HashtagItem } from '@/lib/kudos/kudo-types'
import type { KudoPost, LiveBoardFilters, SpotlightNode } from '@/lib/kudos/live-board-types'
import { CarouselNav } from './carousel-nav'
import { FilterBar } from './filter-bar'
import { KudoHighlightCard } from './kudo-highlight-card'
import { SpotlightBoard } from './spotlight-board'

interface HighlightKudosSectionProps {
  items: KudoPost[]
  currentIndex: number
  onIndexChange: (i: number) => void
  filters: LiveBoardFilters
  onFilterChange: (partial: Partial<LiveBoardFilters>) => void
  hashtags: HashtagItem[]
  departments: string[]
  onHashtagClick: (hashtagId: string) => void
  onLikeToggle: (kudoId: string) => void
  spotlightNodes: SpotlightNode[]
  spotlightTotal: number
}

export function HighlightKudosSection({
  items,
  currentIndex,
  onIndexChange,
  filters,
  onFilterChange,
  hashtags,
  departments,
  onHashtagClick,
  onLikeToggle,
  spotlightNodes,
  spotlightTotal,
}: HighlightKudosSectionProps) {
  if (items.length === 0) return null

  return (
    <section className="px-9 py-6 flex flex-col gap-4" style={{ backgroundColor: 'rgba(11, 15, 18, 0.5)' }}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wide">Highlight Kudos</h2>
        <FilterBar filters={filters} onFilterChange={onFilterChange} hashtags={hashtags} departments={departments} />
      </div>

      {/* Carousel */}
      <div className="relative overflow-hidden">
        <div
          className="flex"
          style={{
            transform: `translateX(calc(-${currentIndex * 100}%))`,
            transition: 'transform 0.3s ease',
          }}
        >
          {items.map((kudo, i) => (
            <div key={kudo.id} className="w-full flex-shrink-0 px-1">
              <KudoHighlightCard
                kudo={kudo}
                isActive={i === currentIndex}
                onHashtagClick={onHashtagClick}
                onLikeToggle={onLikeToggle}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <CarouselNav
          current={currentIndex + 1}
          total={items.length}
          onPrev={() => onIndexChange(Math.max(0, currentIndex - 1))}
          onNext={() => onIndexChange(Math.min(items.length - 1, currentIndex + 1))}
        />
      </div>

      {/* Spotlight Board */}
      <SpotlightBoard nodes={spotlightNodes} totalCount={spotlightTotal} />
    </section>
  )
}
