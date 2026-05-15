'use client'

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import type { UserSearchResult } from '@/lib/kudos/kudo-types'

interface MentionSuggestionListProps {
  items: UserSearchResult[]
  command: (item: { id: string; label: string }) => void
}

export interface MentionSuggestionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean
}

export const MentionSuggestionList = forwardRef<MentionSuggestionListRef, MentionSuggestionListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    useEffect(() => setSelectedIndex(0), [items])

    useImperativeHandle(ref, () => ({
      onKeyDown({ event }) {
        if (event.key === 'ArrowUp') {
          setSelectedIndex((i) => (i + items.length - 1) % items.length)
          return true
        }
        if (event.key === 'ArrowDown') {
          setSelectedIndex((i) => (i + 1) % items.length)
          return true
        }
        if (event.key === 'Enter') {
          selectItem(selectedIndex)
          return true
        }
        return false
      },
    }))

    function selectItem(index: number) {
      const item = items[index]
      if (item) {
        command({ id: item.id, label: item.full_name ?? item.id })
      }
    }

    if (!items.length) {
      return (
        <div style={containerStyle}>
          <p style={{ padding: '8px 12px', color: '#888', fontSize: '13px' }}>
            Không tìm thấy kết quả
          </p>
        </div>
      )
    }

    return (
      <div style={containerStyle}>
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => selectItem(index)}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '8px 12px',
              fontSize: '13px',
              color: '#fff',
              background: index === selectedIndex ? 'rgba(255,234,158,0.1)' : 'none',
              border: 'none',
              cursor: 'pointer',
              borderBottom: '1px solid var(--color-divider)',
            }}
          >
            {item.full_name ?? item.id}
          </button>
        ))}
      </div>
    )
  }
)

MentionSuggestionList.displayName = 'MentionSuggestionList'

const containerStyle: React.CSSProperties = {
  backgroundColor: '#0b0f12',
  border: '1px solid var(--color-divider)',
  borderRadius: '8px',
  overflow: 'hidden',
  minWidth: '180px',
  maxHeight: '200px',
  overflowY: 'auto',
}
