import type { LiveBoardStats, SunnerActivity } from '@/lib/kudos/live-board-types'
import { StatsBlock } from './stats-block'
import { RecentGiftsList } from './recent-gifts-list'

interface RightSidebarProps {
  stats: LiveBoardStats
  recentGiftRecipients: SunnerActivity[]
}

export function RightSidebar({ stats, recentGiftRecipients }: RightSidebarProps) {
  return (
    <aside className="w-80 flex-shrink-0" style={{ position: 'sticky', top: 80, alignSelf: 'flex-start' }}>
      <StatsBlock stats={stats} />
      <RecentGiftsList recipients={recentGiftRecipients} />
    </aside>
  )
}
