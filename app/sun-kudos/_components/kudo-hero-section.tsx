'use client'

import { useState } from 'react'
import type { HashtagItem } from '@/lib/kudos/kudo-types'
import { WriteKudoTrigger } from './write-kudo-trigger'
import { WriteKudoModal } from './write-kudo-modal'

interface KudoHeroSectionProps {
  hashtags: HashtagItem[]
}

export function KudoHeroSection({ hashtags }: KudoHeroSectionProps) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <section className="relative px-9 py-10 flex flex-col gap-6 overflow-hidden bg-linear-to-br from-orange-500 to-orange-600">
      {/* Decorative background circles */}
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 pointer-events-none" aria-hidden="true" />
      <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 flex flex-col gap-2">
        <p className="text-white/70 text-sm font-medium uppercase tracking-widest">SAA KUDOS</p>
        <h1 className="text-white text-2xl font-bold leading-tight">
          Hệ thống ghi nhận lời cảm ơn
        </h1>
      </div>

      <div className="relative z-10 max-w-xl">
        <WriteKudoTrigger onClick={() => setModalOpen(true)} />
      </div>

      <WriteKudoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        hashtags={hashtags}
      />
    </section>
  )
}
