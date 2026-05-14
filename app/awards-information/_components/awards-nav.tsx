'use client'

import { useState, useEffect, useRef } from 'react'
import { AWARDS } from '../../../lib/homepage/awards.config'

export function AwardsNav() {
  const [activeSlug, setActiveSlug] = useState<string>('top-talent')
  const isScrollingRef = useRef(false)

  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash && AWARDS.some((a) => a.slug === hash)) {
      setActiveSlug(hash)
      const el = document.getElementById(hash)
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSlug(entry.target.id)
            break
          }
        }
      },
      { threshold: 0.4 }
    )

    for (const award of AWARDS) {
      const el = document.getElementById(award.slug)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [])

  function handleClick(slug: string) {
    setActiveSlug(slug)
    isScrollingRef.current = true
    const el = document.getElementById(slug)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTimeout(() => {
      isScrollingRef.current = false
    }, 100)
  }

  return (
    <nav
      role="navigation"
      aria-label="Danh mục giải thưởng"
      style={{
        position: 'sticky',
        top: '80px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        width: '240px',
        flexShrink: 0,
        alignSelf: 'flex-start',
      }}
    >
      {AWARDS.map((award) => {
        const isActive = activeSlug === award.slug
        return (
          <button
            key={award.slug}
            onClick={() => handleClick(award.slug)}
            aria-current={isActive ? 'true' : 'false'}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '10px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-montserrat)',
              fontSize: '14px',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--color-cta-primary)' : 'var(--color-text-secondary)',
              backgroundColor: isActive ? 'var(--color-bg-subtle)' : 'transparent',
              transition: 'background-color 0.2s, color 0.2s',
            }}
          >
            {award.title}
          </button>
        )
      })}
    </nav>
  )
}
