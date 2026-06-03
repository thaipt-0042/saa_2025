interface KudoActionBarProps {
  likeCount: number
  likedByCurrentUser: boolean
  onLike: () => void
  disabled: boolean
}

export function KudoActionBar({ likeCount, likedByCurrentUser, onLike, disabled }: KudoActionBarProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onLike}
        disabled={disabled}
        aria-pressed={likedByCurrentUser}
        aria-label={likedByCurrentUser ? 'Bỏ thích' : 'Thích'}
        className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill={likedByCurrentUser ? '#ef4444' : 'none'} aria-hidden="true">
          <path
            d="M8 13.5C8 13.5 1.5 9.5 1.5 5.5a3 3 0 015.5-1.65A3 3 0 0114.5 5.5c0 4-6.5 8-6.5 8z"
            stroke={likedByCurrentUser ? '#ef4444' : 'currentColor'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-sm tabular-nums">{likeCount}</span>
      </button>
    </div>
  )
}
