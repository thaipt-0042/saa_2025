import type { LiveBoardStats } from '@/lib/kudos/live-board-types'

interface StatsBlockProps {
  stats: LiveBoardStats
}

interface StatRowProps {
  label: string
  value: number
}

function StatRow({ label, value }: StatRowProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm font-bold text-white tabular-nums">{value}</span>
    </div>
  )
}

export function StatsBlock({ stats }: StatsBlockProps) {
  return (
    <div className="rounded-2xl border p-4 flex flex-col gap-1" style={{ backgroundColor: 'rgba(11, 15, 18, 0.6)', borderColor: 'var(--color-divider)' }}>
      <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wide mb-1">Thống kê của bạn</h3>
      <StatRow label="Kudos bạn nhận được" value={stats.kudosReceived} />
      <StatRow label="Kudos bạn đã gửi" value={stats.kudosSent} />
      <StatRow label="Tim bạn nhận được" value={stats.heartsReceived} />
      <div className="border-t my-1" style={{ borderColor: 'var(--color-divider)' }} />
      <StatRow label="Secret Box đã mở" value={stats.secretBoxesOpened} />
      <StatRow label="Secret Box chưa mở" value={stats.secretBoxesUnopened} />
      {stats.secretBoxesUnopened > 0 && (
        <button
          onClick={() => alert('Tính năng mở quà sắp ra mắt!')}
          className="mt-2 w-full py-2 rounded-xl text-white text-sm font-semibold transition-colors" style={{ backgroundColor: 'var(--color-cta-primary)', color: 'var(--color-cta-text)' }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          Mở quà 🎁
        </button>
      )}
    </div>
  )
}
