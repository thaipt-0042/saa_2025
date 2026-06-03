'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { WriteKudoModal } from '@/app/sun-kudos/_components/write-kudo-modal'
import { RulesModal } from './rules-modal'
import type { HashtagItem } from '@/lib/kudos/kudo-types'

export function WidgetButton() {
  const [open, setOpen] = useState(false)
  const [isWriteKudoOpen, setIsWriteKudoOpen] = useState(false)
  const [isRulesOpen, setIsRulesOpen] = useState(false)
  const [hashtags, setHashtags] = useState<HashtagItem[]>([])

  // Fetch hashtags ngay khi mount để sẵn sàng khi mở modal
  useEffect(() => {
    fetch('/api/hashtags')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: HashtagItem[]) => setHashtags(Array.isArray(data) ? data : []))
      .catch(() => setHashtags([]))
  }, [])

  const handleWriteKudo = () => {
    setOpen(false)
    setIsWriteKudoOpen(true)
  }

  const handleRules = () => {
    setOpen(false)
    setIsRulesOpen(true)
  }

  return (
    <>
    <div className="fixed bottom-6 right-6 z-50" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
      {open && (
        <div
          data-testid="widget-menu"
          style={{
            backgroundColor: 'var(--color-header-bg)',
            border: '1px solid var(--color-divider)',
            borderRadius: 12,
            padding: '8px',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            minWidth: 160,
          }}
        >
          <button
            type="button"
            onClick={handleWriteKudo}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: 'transparent',
              color: '#fff',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.07)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent' }}
          >
            <Image src="/assets/homepage/icons/pen.svg" alt="" width={18} height={18} aria-hidden="true" />
            Viết Kudo
          </button>
          <button
            type="button"
            onClick={handleRules}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: 'transparent',
              color: '#fff',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.07)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent' }}
          >
            <Image src="/assets/homepage/icons/widget-kudos.svg" alt="" width={18} height={18} aria-hidden="true" />
            Thể lệ
          </button>
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

      <WriteKudoModal
        open={isWriteKudoOpen}
        onClose={() => setIsWriteKudoOpen(false)}
        hashtags={hashtags}
      />
      <RulesModal
        open={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />
    </>
  )
}
