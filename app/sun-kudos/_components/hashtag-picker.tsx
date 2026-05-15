'use client'

import { useState, useRef, useEffect } from 'react'
import type { HashtagItem } from '@/lib/kudos/kudo-types'

interface HashtagPickerProps {
  selected: string[]
  allHashtags: HashtagItem[]
  onAdd: (id: string) => void
  onRemove: (id: string) => void
}

export function HashtagPicker({ selected, allHashtags, onAdd, onRemove }: HashtagPickerProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedSet = new Set(selected)
  const available = allHashtags.filter((h) => !selectedSet.has(h.id))
  const selectedItems = allHashtags.filter((h) => selectedSet.has(h.id))

  return (
    <div ref={containerRef} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
      {selectedItems.map((tag) => (
        <span
          key={tag.id}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            borderRadius: '999px',
            backgroundColor: 'var(--color-cta-primary)',
            color: 'var(--color-cta-text)',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          #{tag.name}
          <button
            type="button"
            aria-label={`Xóa ${tag.name}`}
            onClick={() => onRemove(tag.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              color: 'inherit',
              fontSize: '14px',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </span>
      ))}

      {selected.length < 5 && (
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            aria-label="+ Hashtag"
            onClick={() => setDropdownOpen((v) => !v)}
            style={{
              padding: '4px 12px',
              borderRadius: '999px',
              border: '1px dashed var(--color-divider)',
              background: 'none',
              color: '#aaa',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            + Hashtag
          </button>

          {dropdownOpen && (
            <ul
              role="listbox"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                zIndex: 50,
                backgroundColor: '#0b0f12',
                border: '1px solid var(--color-divider)',
                borderRadius: '8px',
                marginTop: '4px',
                listStyle: 'none',
                padding: 0,
                minWidth: '160px',
                maxHeight: '200px',
                overflowY: 'auto',
              }}
            >
              {available.length === 0 && (
                <li style={{ padding: '10px 12px', color: '#888', fontSize: '13px' }}>
                  Không còn hashtag
                </li>
              )}
              {available.map((tag) => (
                <li
                  key={tag.id}
                  role="option"
                  aria-selected={false}
                  onClick={() => {
                    onAdd(tag.id)
                    setDropdownOpen(false)
                  }}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: '#fff',
                    borderBottom: '1px solid var(--color-divider)',
                  }}
                >
                  #{tag.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
