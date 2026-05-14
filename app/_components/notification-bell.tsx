'use client'

import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { NotificationPanel } from './notification-panel'

interface NotificationBellProps {
  user: User | null
}

export function NotificationBell({ user }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState<number | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!user) return

    async function fetchCount() {
      try {
        const res = await fetch('/api/notifications/unread-count')
        if (!res.ok) return
        const data = await res.json() as { count: number }
        setUnreadCount(data.count)
      } catch {
        // silently fail — badge simply stays hidden
      }
    }

    fetchCount()
  }, [user])

  useEffect(() => {
    if (!open) return
    // refetch when panel closes is handled by the close handler
  }, [open])

  if (!user) return null

  const handleClose = async () => {
    setOpen(false)
    try {
      const res = await fetch('/api/notifications/unread-count')
      if (res.ok) {
        const data = await res.json() as { count: number }
        setUnreadCount(data.count)
      }
    } catch {
      // ignore
    }
  }

  return (
    <>
      <button
        aria-label="Thông báo"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 4,
          color: '#fff',
        }}
      >
        <svg width={24} height={24} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {unreadCount !== null && unreadCount > 0 && (
          <span
            data-testid="notification-badge"
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: 'var(--color-badge)',
            }}
          />
        )}
      </button>

      <NotificationPanel open={open} onClose={handleClose} />
    </>
  )
}
