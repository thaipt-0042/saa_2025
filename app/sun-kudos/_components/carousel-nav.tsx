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
        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <span className="text-sm text-gray-600 tabular-nums">{current}/{total}</span>
      <button
        onClick={onNext}
        disabled={current === total}
        aria-label="Tiếp theo"
        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}
