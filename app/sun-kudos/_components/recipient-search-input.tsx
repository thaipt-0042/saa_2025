'use client'

import { useState, useEffect, useRef } from 'react'
import { useDebounce } from '@/lib/hooks/use-debounce'
import type { UserSearchResult } from '@/lib/kudos/kudo-types'

interface RecipientSearchInputProps {
  value: string
  onSelect: (user: UserSearchResult) => void
  placeholder?: string
}

export function RecipientSearchInput({ value, onSelect, placeholder = 'Tìm đồng nghiệp...' }: RecipientSearchInputProps) {
  const [suggestions, setSuggestions] = useState<UserSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const debouncedValue = useDebounce(value, 300)
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    let cancelled = false

    async function run() {
      const trimmed = debouncedValue.trim()
      if (!trimmed) {
        setSuggestions([])
        setSearched(false)
        return
      }
      setLoading(true)
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(trimmed)}`)
        const data: UserSearchResult[] = await res.json()
        if (!cancelled) {
          setSuggestions(data)
          setSearched(true)
        }
      } catch {
        if (!cancelled) {
          setSuggestions([])
          setSearched(true)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => { cancelled = true }
  }, [debouncedValue])

  const showDropdown = debouncedValue.trim().length > 0

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        value={value}
        readOnly
        placeholder={placeholder}
        aria-label="Tìm người nhận"
        aria-autocomplete="list"
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: '8px',
          border: '1px solid var(--color-divider)',
          background: 'transparent',
          color: '#fff',
          fontSize: '14px',
        }}
      />

      {showDropdown && (
        <ul
          ref={listRef}
          role="listbox"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 50,
            backgroundColor: '#0b0f12',
            border: '1px solid var(--color-divider)',
            borderRadius: '8px',
            marginTop: '4px',
            listStyle: 'none',
            padding: 0,
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          {loading && (
            <li style={{ padding: '10px 12px', color: '#888', fontSize: '14px' }}>Đang tìm...</li>
          )}
          {!loading && searched && suggestions.length === 0 && (
            <li style={{ padding: '10px 12px', color: '#888', fontSize: '14px' }}>
              Không tìm thấy kết quả
            </li>
          )}
          {suggestions.map((user) => (
            <li
              key={user.id}
              role="option"
              aria-selected={false}
              onClick={() => onSelect(user)}
              style={{
                padding: '10px 12px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#fff',
                borderBottom: '1px solid var(--color-divider)',
              }}
            >
              {user.full_name ?? user.id}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
