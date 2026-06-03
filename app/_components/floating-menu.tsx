'use client'

import { useEffect, useRef, useState } from 'react'

interface FloatingMenuItem {
  icon: React.ReactNode
  label: string
  onClick: () => void
}

interface FloatingMenuProps {
  items: FloatingMenuItem[]
}

export function FloatingMenu({ items }: FloatingMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Đóng menu khi nhấn Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleItemClick = (onClick: () => void) => {
    onClick()
    setIsOpen(false)
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '12px',
      }}
    >
      {/* Menu items — slide up khi mở */}
      {isOpen && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            alignItems: 'flex-end',
          }}
        >
          {[...items].reverse().map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleItemClick(item.onClick)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 16px',
                borderRadius: '100px',
                border: '1px solid var(--color-divider, #2e3940)',
                backgroundColor: '#0b1822',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                animation: `fab-slide-up 0.25s cubic-bezier(0.34,1.56,0.64,1) ${idx * 60}ms both`,
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#162230'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0b1822'
              }}
            >
              <span style={{ color: 'var(--color-cta-primary, #ffea9e)', display: 'flex' }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* FAB button */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Đóng menu' : 'Mở menu'}
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: 'var(--color-cta-primary, #ffea9e)',
          color: 'var(--color-cta-text, #00101a)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(255,234,158,0.25)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 24px rgba(255,234,158,0.4)'
          ;(e.currentTarget as HTMLButtonElement).style.transform = isOpen ? 'rotate(45deg) scale(1.05)' : 'scale(1.05)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(255,234,158,0.25)'
          ;(e.currentTarget as HTMLButtonElement).style.transform = isOpen ? 'rotate(45deg)' : 'rotate(0deg)'
        }}
      >
        {/* Plus / X icon */}
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <line x1="11" y1="3" x2="11" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="3" y1="11" x2="19" y2="11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* CSS animation keyframes */}
      <style>{`
        @keyframes fab-slide-up {
          from { opacity: 0; transform: translateY(16px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
      `}</style>
    </div>
  )
}
