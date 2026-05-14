'use client'

import { useState } from 'react'
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
  { code: 'en', label: 'EN', flag: '/assets/login/icons/flag-vn.svg', flagAlt: 'English flag' },
]

interface LanguageSwitcherProps {
  currentLocale: string
}

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const current = LOCALES.find((l) => l.code === currentLocale) ?? LOCALES[0]

  function selectLocale(code: string) {
    // eslint-disable-next-line react-hooks/immutability
    document.cookie = `lang=${code}; path=/; max-age=31536000; SameSite=Lax`
    setOpen(false)
    router.refresh()
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Select language"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((prev) => !prev)}
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
          className="absolute right-0 top-full z-50 mt-1 min-w-full rounded border border-white/10 bg-[#0b0f12] shadow-lg"
        >
          {LOCALES.map((locale) => (
            <li
              key={locale.code}
              role="option"
              aria-selected={locale.code === currentLocale}
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
