import Image from 'next/image'
import type { KudoPost } from '@/lib/kudos/live-board-types'
import { computeStarCount } from '@/lib/kudos/live-board-types'
import { KudoActionBar } from './kudo-action-bar'

interface KudoHighlightCardProps {
  kudo: KudoPost
  isActive: boolean
  onHashtagClick: (hashtagId: string) => void
  onLikeToggle: (kudoId: string) => void
}

function StarBadges({ count }: { count: number }) {
  if (count === 0) return null
  return <span className="text-yellow-400 text-xs">{'★'.repeat(count)}</span>
}

function UserBlock({ user }: { user: KudoPost['sender'] }) {
  const stars = computeStarCount(user.starCount)
  return (
    <div className="flex flex-col items-center gap-1 min-w-0">
      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--color-divider)' }}>
        {user.avatarUrl ? (
          <Image src={user.avatarUrl} alt={user.fullName ?? ''} width={48} height={48} className="object-cover w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg font-bold">
            {(user.fullName ?? '?')[0].toUpperCase()}
          </div>
        )}
      </div>
      <p className="text-xs font-semibold text-center truncate max-w-[100px] text-white">{user.fullName ?? '—'}</p>
      {user.department && <p className="text-[10px] text-gray-400 text-center truncate max-w-[100px]">{user.department}</p>}
      <StarBadges count={stars} />
    </div>
  )
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${hh}:${mm} - ${mo}/${dd}/${yyyy}`
}

export function KudoHighlightCard({ kudo, isActive, onHashtagClick, onLikeToggle }: KudoHighlightCardProps) {
  return (
    <div
      className="flex-shrink-0 w-full rounded-2xl border p-5 flex flex-col gap-3 transition-all duration-300"
      style={{ backgroundColor: 'rgba(11, 15, 18, 0.8)', borderColor: 'var(--color-divider)', opacity: isActive ? 1 : 0.4, transform: isActive ? 'scale(1)' : 'scale(0.97)', pointerEvents: isActive ? 'auto' : 'none' }}
    >
      {/* Sender → Recipient row */}
      <div className="flex items-center gap-3">
        <UserBlock user={kudo.sender} />
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="flex-shrink-0" style={{ color: 'var(--color-divider)' }} aria-hidden="true">
          <path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <UserBlock user={kudo.recipient} />
      <p className="ml-auto text-[10px] text-gray-400 whitespace-nowrap self-start">{formatDate(kudo.createdAt)}</p>
      </div>

      {/* Content */}
      <p className="text-sm text-gray-200 leading-relaxed line-clamp-3">{kudo.content}</p>

      {/* Hashtags */}
      {kudo.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {kudo.hashtags.slice(0, 5).map((h) => (
            <button
              key={h.id}
              onClick={() => onHashtagClick(h.id)}
              className="text-xs px-2 py-0.5 rounded-full text-yellow-300 hover:opacity-80 transition-opacity" style={{ backgroundColor: 'rgba(255, 234, 158, 0.1)' }}
            >
              #{h.name}
            </button>
          ))}
        </div>
      )}

      {/* Action bar */}
      <KudoActionBar
        likeCount={kudo.likeCount}
        likedByCurrentUser={kudo.likedByCurrentUser}
        onLike={() => onLikeToggle(kudo.id)}
        disabled={kudo.senderIsCurrentUser}
      />
    </div>
  )
}
