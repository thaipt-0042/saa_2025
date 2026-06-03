'use client'

import { useEffect, useState } from 'react'
import { FloatingMenu } from './floating-menu'
import { RulesModal } from './rules-modal'
import { WriteKudoModal } from '@/app/sun-kudos/_components/write-kudo-modal'
import type { HashtagItem } from '@/lib/kudos/kudo-types'

// Icon: Bút viết
function PencilIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M12.5 2.5a2.121 2.121 0 1 1 3 3L5 16H2v-3L12.5 2.5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Icon: Sách / Thể lệ
function BookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M3 3h5a3 3 0 0 1 3 3v9a2 2 0 0 0-2-2H3V3z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 3h-5a3 3 0 0 0-3 3v9a2 2 0 0 1 2-2h6V3z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function FloatingMenuContainer() {
  const [isWriteKudoOpen, setIsWriteKudoOpen] = useState(false)
  const [isRulesOpen, setIsRulesOpen] = useState(false)
  const [hashtags, setHashtags] = useState<HashtagItem[]>([])

  // Fetch hashtags khi mở modal Write Kudo
  useEffect(() => {
    if (!isWriteKudoOpen || hashtags.length > 0) return
    fetch('/api/hashtags')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: HashtagItem[]) => setHashtags(Array.isArray(data) ? data : []))
      .catch(() => setHashtags([]))
  }, [isWriteKudoOpen, hashtags.length])

  const menuItems = [
    {
      icon: <PencilIcon />,
      label: 'Viết Kudo',
      onClick: () => setIsWriteKudoOpen(true),
    },
    {
      icon: <BookIcon />,
      label: 'Thể lệ',
      onClick: () => setIsRulesOpen(true),
    },
  ]

  return (
    <>
      <FloatingMenu items={menuItems} />
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
