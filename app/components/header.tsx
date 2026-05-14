import Image from 'next/image'
import { LanguageSwitcher } from './language-switcher'

interface HeaderProps {
  currentLocale: string
}

export function Header({ currentLocale }: HeaderProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between"
      style={{
        height: 80,
        padding: '12px 144px',
        backgroundColor: 'var(--color-header-bg)',
        backdropFilter: 'blur(4px)',
      }}
    >
      {/* A.1 — SAA Logo */}
      <div style={{ width: 52, height: 56, display: 'flex', alignItems: 'center' }}>
        <Image
          src="/assets/login/logos/saa-logo.png"
          alt="Sun Annual Awards"
          width={52}
          height={48}
          priority
        />
      </div>

      {/* A.2 — Language Switcher */}
      <LanguageSwitcher currentLocale={currentLocale} />
    </header>
  )
}
