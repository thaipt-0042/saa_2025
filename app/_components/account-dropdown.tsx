'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '../../lib/supabase/client'

interface AccountDropdownProps {
  user: User
  role?: 'admin' | 'user' | null
}

export function AccountDropdown({ user: _user, role }: AccountDropdownProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        aria-label="Tài khoản"
        aria-expanded={open ? 'true' : 'false'}
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: 40,
          height: 40,
          border: '1px solid var(--color-account-border)',
          borderRadius: 4,
          background: 'none',
          cursor: 'pointer',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width={24} height={24} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 48,
            right: 0,
            minWidth: 180,
            backgroundColor: 'var(--color-header-bg)',
            border: '1px solid var(--color-divider)',
            borderRadius: 8,
            backdropFilter: 'blur(4px)',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            padding: '8px 0',
          }}
        >
          <Link
            href="/profile"
            style={{ padding: '8px 16px', color: '#fff', textDecoration: 'none', fontSize: 14 }}
          >
            Profile
          </Link>

          {role === 'admin' && (
            <Link
              href="/admin"
              style={{ padding: '8px 16px', color: '#fff', textDecoration: 'none', fontSize: 14 }}
            >
              Admin Dashboard
            </Link>
          )}

          <button
            onClick={handleSignOut}
            style={{
              padding: '8px 16px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#fff',
              fontSize: 14,
              textAlign: 'left',
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
