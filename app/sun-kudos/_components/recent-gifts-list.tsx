import Image from 'next/image'
import type { SunnerActivity } from '@/lib/kudos/live-board-types'

interface RecentGiftsListProps {
  recipients: SunnerActivity[]
}

export function RecentGiftsList({ recipients }: RecentGiftsListProps) {
  return (
    <div className="rounded-2xl border p-4 flex flex-col gap-3 mt-3" style={{ backgroundColor: 'rgba(11, 15, 18, 0.6)', borderColor: 'var(--color-divider)' }}>
      <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wide">10 Sunner nhận quà mới nhất</h3>

      {recipients.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Chưa có dữ liệu</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {recipients.map((r) => (
            <li key={r.userId} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--color-divider)' }}>
                {r.avatarUrl ? (
                  <Image src={r.avatarUrl} alt={r.fullName ?? ''} width={32} height={32} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold">
                    {(r.fullName ?? '?')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate text-white">{r.fullName ?? '—'}</p>
                <p className="text-xs text-gray-400 truncate">{r.description}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
