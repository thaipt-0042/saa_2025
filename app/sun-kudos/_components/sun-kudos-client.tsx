'use client'

import { useState } from 'react'
import { WriteKudoButton } from './write-kudo-button'
import { WriteKudoModal } from './write-kudo-modal'
import type { HashtagItem } from '@/lib/kudos/kudo-types'

interface SunKudosClientProps {
  hashtags: HashtagItem[]
}

export function SunKudosClient({ hashtags }: SunKudosClientProps) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <WriteKudoButton onClick={() => setModalOpen(true)} />
      <WriteKudoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        hashtags={hashtags}
      />
    </>
  )
}
