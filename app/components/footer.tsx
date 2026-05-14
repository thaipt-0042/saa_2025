import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

const NAV_LINKS = [
  { label: 'About SAA 2025', href: '/' },
  { label: 'Awards Information', href: '/awards-information' },
  { label: 'Sun* Kudos', href: '/sun-kudos' },
  { label: 'Tiêu chuẩn chung', href: '/standards' },
]

export async function Footer() {
  const t = await getTranslations('footer')

  return (
    <footer
      style={{
        padding: '40px 90px',
        borderTop: '1px solid var(--color-divider)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
        <Image
          src="/assets/homepage/logos/footer-logo.png"
          alt="Sun Annual Awards"
          width={69}
          height={64}
        />
      </Link>

      {/* Nav links */}
      <nav style={{ display: 'flex', gap: 32 }}>
        {NAV_LINKS.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            style={{
              fontFamily: 'var(--font-montserrat-alt), "Montserrat Alternates", sans-serif',
              fontWeight: 700,
              fontSize: 16,
              lineHeight: '24px',
              color: '#fff',
              textDecoration: 'none',
            }}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* Copyright */}
      <p
        style={{
          fontFamily: 'var(--font-montserrat-alt), "Montserrat Alternates", sans-serif',
          fontWeight: 700,
          fontSize: 16,
          lineHeight: '24px',
          color: '#fff',
          margin: 0,
        }}
      >
        {t('copyright')}
      </p>
    </footer>
  )
}
