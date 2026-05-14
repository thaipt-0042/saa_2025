'use client'

import { useState } from 'react'
import Image from 'next/image'

export function WidgetButton() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
      {open && (
        <div
          data-testid="widget-menu"
          style={{
            backgroundColor: 'var(--color-header-bg)',
            border: '1px solid var(--color-divider)',
            borderRadius: 8,
            padding: '12px 16px',
            backdropFilter: 'blur(4px)',
            color: '#fff',
            fontSize: 14,
          }}
        >
          {/* Quick-action menu placeholder — content out of scope per spec */}
          <p style={{ margin: 0 }}>Quick actions</p>
        </div>
      )}

      <button
        aria-label="Quick actions"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 20px',
          borderRadius: 999,
          backgroundColor: 'var(--color-cta-primary)',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-cta-text)',
        }}
      >
        <Image
          src="/assets/homepage/icons/pen.svg"
          alt=""
          width={24}
          height={24}
          aria-hidden="true"
        />
        <span style={{ fontWeight: 700, fontSize: 14 }}>/</span>
        <Image
          src="/assets/homepage/icons/widget-kudos.svg"
          alt=""
          width={24}
          height={24}
          aria-hidden="true"
        />
      </button>
    </div>
  )
}
