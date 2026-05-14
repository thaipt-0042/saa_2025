'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Locale {
  code: string
  label: string
  flag: string
  flagAlt: string
}

const LOCALES: Locale[] = [
  { code: 'vi', label: 'VN', flag: '/assets/login/icons/flag-vn.svg', flagAlt: 'Vietnamese flag' },
  { code: 'en', label: 'EN', flag: '/assets/login/icons/flag-en.svg', flagAlt: 'English flag' },
]

interface LanguageSwitcherProps {
  currentLocale: string
}

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<(HTMLLIElement | null)[]>([])

  const current = LOCALES.find((l) => l.code === currentLocale) ?? LOCALES[0]

  useEffect(() => {
    if (!open) return
    function handleMousedown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setFocusedIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleMousedown)
    return () => document.removeEventListener('mousedown', handleMousedown)
  }, [open])

  function selectLocale(code: string) {
    // eslint-disable-next-line react-hooks/immutability
    document.cookie = `lang=${code}; path=/; max-age=31536000; SameSite=Lax`
    setOpen(false)
    setFocusedIndex(-1)
    router.refresh()
  }

  function openAndFocusFirst() {
    setOpen(true)
    setFocusedIndex(0)
    // defer focus until after render
    setTimeout(() => optionRefs.current[0]?.focus(), 0)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Select language"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            if (!open) {
              openAndFocusFirst()
            }
          }
        }}
        className="flex items-center gap-1 rounded px-4 py-4"
        style={{
          width: 108,
          height: 56,
          borderRadius: 4,
          fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
          color: '#fff',
          fontWeight: 700,
          fontSize: 16,
        }}
      >
        <Image src={current.flag} alt={current.flagAlt} width={24} height={24} />
        <span>{current.label}</span>
        <Image
          src="/assets/login/icons/chevron-down.svg"
          alt=""
          width={24}
          height={24}
          aria-hidden="true"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Select language"
          tabIndex={-1}
          className="absolute right-0 top-full z-50 mt-1 min-w-full rounded border border-white/10 bg-[#0b0f12] shadow-lg"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setOpen(false)
              setFocusedIndex(-1)
              triggerRef.current?.focus()
            } else if (e.key === 'ArrowDown') {
              e.preventDefault()
              const next = Math.min(focusedIndex + 1, LOCALES.length - 1)
              setFocusedIndex(next)
              optionRefs.current[next]?.focus()
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              const prev = Math.max(focusedIndex - 1, 0)
              setFocusedIndex(prev)
              optionRefs.current[prev]?.focus()
            } else if (e.key === 'Enter') {
              if (focusedIndex >= 0 && focusedIndex < LOCALES.length) {
                selectLocale(LOCALES[focusedIndex].code)
              }
            } else if (e.key === 'Tab') {
              setOpen(false)
              setFocusedIndex(-1)
            }
          }}
        >
          {LOCALES.map((locale, idx) => (
            <li
              key={locale.code}
              ref={(el) => { optionRefs.current[idx] = el }}
              role="option"
              aria-selected={locale.code === currentLocale}
              tabIndex={-1}
              onClick={() => selectLocale(locale.code)}
              className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm font-bold text-white hover:bg-white/10"
              style={{ fontFamily: 'var(--font-montserrat), Montserrat, sans-serif' }}
            >
              <Image src={locale.flag} alt={locale.flagAlt} width={20} height={20} />
              {locale.code === 'vi' ? 'Tiếng Việt' : 'English'}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
