interface CarouselNavProps {
  current: number
  total: number
  onPrev: () => void
  onNext: () => void
}

export function CarouselNav({ current, total, onPrev, onNext }: CarouselNavProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onPrev}
        disabled={current === 1}
        aria-label="Trước"
        style={{ borderColor: 'var(--color-divider)', color: 'white' }}
        className="w-8 h-8 flex items-center justify-center rounded-full border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(11, 15, 18, 0.8)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <span className="text-sm text-gray-400 tabular-nums">{current}/{total}</span>
      <button
        onClick={onNext}
        disabled={current === total}
        aria-label="Tiếp theo"
        style={{ borderColor: 'var(--color-divider)', color: 'white' }}
        className="w-8 h-8 flex items-center justify-center rounded-full border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(11, 15, 18, 0.8)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}
