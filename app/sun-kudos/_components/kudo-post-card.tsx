import Image from 'next/image'
import type { KudoPost } from '@/lib/kudos/live-board-types'
import { computeStarCount } from '@/lib/kudos/live-board-types'
import { KudoActionBar } from './kudo-action-bar'
import { KudoImageGallery } from './kudo-image-gallery'

interface KudoPostCardProps {
  kudo: KudoPost
  currentUserId: string
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
    <div className="flex items-center gap-2 min-w-0">
      <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--color-divider)' }}>
        {user.avatarUrl ? (
          <Image src={user.avatarUrl} alt={user.fullName ?? ''} width={36} height={36} className="object-cover w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-bold">
            {(user.fullName ?? '?')[0].toUpperCase()}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold truncate text-white">{user.fullName ?? '—'}</p>
        {user.department && <p className="text-xs text-gray-400 truncate">{user.department}</p>}
        <StarBadges count={stars} />
      </div>
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

export function KudoPostCard({ kudo, currentUserId, onHashtagClick, onLikeToggle }: KudoPostCardProps) {
  return (
    <article className="rounded-2xl border p-4 flex flex-col gap-3" style={{ backgroundColor: 'rgba(11, 15, 18, 0.6)', borderColor: 'var(--color-divider)' }}>
      {/* Header row */}
      <div className="flex items-center gap-2 flex-wrap">
        <UserBlock user={kudo.sender} />
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0" style={{ color: 'var(--color-divider)' }} aria-hidden="true">
          <path d="M3 8h10M9 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <UserBlock user={kudo.recipient} />
        <p className="ml-auto text-[10px] text-gray-400 whitespace-nowrap">{formatDate(kudo.createdAt)}</p>
      </div>

      {/* Content */}
      <p className="text-sm text-gray-200 leading-relaxed line-clamp-5">{kudo.content}</p>

      {/* Images */}
      <KudoImageGallery images={kudo.imageUrls} />

      {/* Hashtags */}
      {kudo.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {kudo.hashtags.map((h) => (
            <button
              key={h.id}
              onClick={() => onHashtagClick(h.id)}
              className="text-xs px-2 py-0.5 rounded-full text-yellow-300 hover:opacity-80 transition-opacity" style={{ backgroundColor: 'rgba(255, 234, 158, 0.1)', borderColor: 'var(--color-divider)' }}
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
        disabled={kudo.sender.id === currentUserId}
      />
    </article>
  )
}
