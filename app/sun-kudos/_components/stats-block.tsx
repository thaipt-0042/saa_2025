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
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-bold text-gray-800 tabular-nums">{value}</span>
    </div>
  )
}

export function StatsBlock({ stats }: StatsBlockProps) {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 p-4 flex flex-col gap-1">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Thống kê của bạn</h3>
      <StatRow label="Kudos bạn nhận được" value={stats.kudosReceived} />
      <StatRow label="Kudos bạn đã gửi" value={stats.kudosSent} />
      <StatRow label="Tim bạn nhận được" value={stats.heartsReceived} />
      <div className="border-t border-gray-100 my-1" />
      <StatRow label="Secret Box đã mở" value={stats.secretBoxesOpened} />
      <StatRow label="Secret Box chưa mở" value={stats.secretBoxesUnopened} />
      {stats.secretBoxesUnopened > 0 && (
        <button
          onClick={() => alert('Tính năng mở quà sắp ra mắt!')}
          className="mt-2 w-full py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors"
        >
          Mở quà 🎁
        </button>
      )}
    </div>
  )
}
