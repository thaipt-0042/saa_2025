'use client'

import { useMemo, useState } from 'react'
import type { SpotlightNode } from '@/lib/kudos/live-board-types'

interface SpotlightBoardProps {
  nodes: SpotlightNode[]
  totalCount: number
}

function hashCode(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function seededPos(userId: string, index: number, max: number): number {
  return (hashCode(userId + index) % max)
}

export function SpotlightBoard({ nodes, totalCount }: SpotlightBoardProps) {
  const [query, setQuery] = useState('')
  const [zoomed, setZoomed] = useState(false)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState<{ startX: number; startY: number; originX: number; originY: number } | null>(null)

  const maxKudos = useMemo(() => Math.max(...nodes.map((n) => n.kudosReceived), 1), [nodes])

  const visible = useMemo(
    () => query.trim() ? nodes.filter((n) => n.fullName.toLowerCase().includes(query.toLowerCase())) : nodes,
    [nodes, query]
  )

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging({ startX: e.clientX, startY: e.clientY, originX: pan.x, originY: pan.y })
  }
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return
    setPan({ x: dragging.originX + e.clientX - dragging.startX, y: dragging.originY + e.clientY - dragging.startY })
  }
  const handleMouseUp = () => setDragging(null)

  return (
    <div className="rounded-2xl border p-4 flex flex-col gap-3" style={{ backgroundColor: 'rgba(11, 15, 18, 0.6)', borderColor: 'var(--color-divider)' }}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-sm font-bold text-gray-300">{totalCount} KUDOS</span>
        <div className="flex items-center gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm..."
            className="text-xs px-3 py-1.5 rounded-full border focus:outline-none focus:ring-2 w-36 transition-colors" style={{ borderColor: 'var(--color-divider)', backgroundColor: 'rgba(11, 15, 18, 0.8)', color: 'white' }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-cta-primary)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-divider)')}
            aria-label="Tìm thành viên"
          />
          <button
            onClick={() => setZoomed((z) => !z)}
            className="text-xs px-3 py-1.5 rounded-full border transition-colors" style={{ borderColor: 'var(--color-divider)', color: 'white' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(11, 15, 18, 0.8)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
            aria-label={zoomed ? 'Thu nhỏ' : 'Phóng to'}
          >
            {zoomed ? '−' : '+'}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        className="relative overflow-hidden rounded-xl cursor-grab active:cursor-grabbing select-none" style={{ height: 380, backgroundColor: 'rgba(11, 15, 18, 0.8)' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomed ? 1.5 : 1})`,
            transformOrigin: 'center center',
            transition: dragging ? 'none' : 'transform 0.2s ease',
          }}
        >
          {visible.map((node) => {
            const fontSize = 12 + (node.kudosReceived / maxKudos) * 24
            const left = 4 + seededPos(node.userId, 0, 88)
            const top = 4 + seededPos(node.userId, 1, 88)
            return (
              <span
                key={node.userId}
                title={`${node.fullName} — ${node.kudosReceived} kudos`}
                style={{ position: 'absolute', left: `${left}%`, top: `${top}%`, fontSize, lineHeight: 1.2, color: 'var(--color-cta-primary)' }}
                className="font-medium hover:opacity-80 transition-opacity whitespace-nowrap cursor-pointer"
              >
                {node.fullName}
              </span>
            )
          })}
          {visible.length === 0 && (
            <p className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">Không tìm thấy</p>
          )}
        </div>
      </div>
    </div>
  )
}
