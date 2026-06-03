import type { HashtagItem } from '@/lib/kudos/kudo-types'
import type { LiveBoardFilters } from '@/lib/kudos/live-board-types'

interface FilterBarProps {
  filters: LiveBoardFilters
  onFilterChange: (partial: Partial<LiveBoardFilters>) => void
  hashtags: HashtagItem[]
  departments: string[]
}

export function FilterBar({ filters, onFilterChange, hashtags, departments }: FilterBarProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <select
        value={filters.hashtagId ?? ''}
        onChange={(e) => onFilterChange({ hashtagId: e.target.value || null })}
        className="px-3 py-1.5 rounded-full border text-sm focus:outline-none focus:ring-2 transition-colors" style={{ borderColor: 'var(--color-divider)', backgroundColor: 'rgba(11, 15, 18, 0.6)', color: 'white' }}
        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-cta-primary)')}
        onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-divider)')}
        data-active={filters.hashtagId ? '' : undefined}
        aria-label="Lọc theo hashtag"
      >
        <option value="">Tất cả hashtag</option>
        {hashtags.map((h) => (
          <option key={h.id} value={h.id}>#{h.name}</option>
        ))}
      </select>

      <select
        value={filters.department ?? ''}
        onChange={(e) => onFilterChange({ department: e.target.value || null })}
        className="px-3 py-1.5 rounded-full border text-sm focus:outline-none focus:ring-2 transition-colors" style={{ borderColor: 'var(--color-divider)', backgroundColor: 'rgba(11, 15, 18, 0.6)', color: 'white' }}
        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-cta-primary)')}
        onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-divider)')}
        aria-label="Lọc theo phòng ban"
      >
        <option value="">Tất cả phòng ban</option>
        {departments.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
    </div>
  )
}
