import Image from 'next/image'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import { LanguageSwitcher } from './language-switcher'
import { NotificationBell } from '../_components/notification-bell'
import { AccountDropdown } from '../_components/account-dropdown'

const NAV_LINKS = [
  { label: 'About SAA 2025', href: '/' },
  { label: 'Awards Information', href: '/awards-information' },
  { label: 'Sun* Kudos', href: '/sun-kudos' },
]

interface HeaderProps {
  currentLocale: string
  currentPath?: string
  user?: User | null
  role?: 'admin' | 'user' | null
}

export function Header({ currentLocale, currentPath, user = null, role = null }: HeaderProps) {
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

      {/* A.2 — Nav links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        {NAV_LINKS.map(({ label, href }) => {
          const isActive = currentPath === href
          return (
            <Link
              key={href}
              href={href}
              data-active={isActive ? 'true' : undefined}
              style={{
                fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
                fontWeight: 700,
                fontSize: 16,
                color: '#fff',
                textDecoration: 'none',
                borderBottom: isActive ? '2px solid var(--color-cta-primary)' : 'none',
                paddingBottom: 2,
              }}
            >
              {label}
            </Link>
          )
        })}
      </nav>

      {/* A.3 — Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <LanguageSwitcher currentLocale={currentLocale} />
        {user && <NotificationBell user={user} />}
        {user && <AccountDropdown user={user} role={role} />}
      </div>
    </header>
  )
}
