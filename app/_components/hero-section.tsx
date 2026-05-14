import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { CountdownTimer } from './countdown-timer'

export async function HeroSection() {
  const t = await getTranslations('homepage')

  return (
    <section style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Keyvisual background */}
      <Image
        src="/assets/homepage/images/keyvisual-bg.png"
        alt="SAA 2025 keyvisual"
        fill
        loading="lazy"
        style={{ objectFit: 'cover', objectPosition: 'center top' }}
        sizes="100vw"
      />

      {/* Content overlay */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '160px 144px 80px',
          display: 'flex',
          flexDirection: 'column',
          gap: 40,
        }}
      >
        {/* B1 — Countdown */}
        <CountdownTimer />

        {/* B2 — Event info */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
            fontWeight: 700,
            fontSize: 16,
            color: '#fff',
          }}
        >
          <p style={{ margin: 0 }}>{t('hero.eventTime')} | {t('hero.eventVenue')}</p>
          <p style={{ margin: 0 }}>{t('hero.eventFacebook')}</p>
        </div>

        {/* B3 — CTA buttons */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: 16 }}>
          <Link
            href="/awards-information"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              width: 276,
              height: 60,
              padding: '16px 24px',
              borderRadius: 8,
              backgroundColor: 'var(--color-cta-primary)',
              fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
              fontSize: 22,
              fontWeight: 700,
              lineHeight: '28px',
              color: 'var(--color-cta-text)',
              textDecoration: 'none',
            }}
          >
            {t('hero.aboutAwards')}
            <Image
              src="/assets/homepage/icons/arrow-up.svg"
              alt=""
              width={24}
              height={24}
              aria-hidden="true"
            />
          </Link>

          <Link
            href="/sun-kudos"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              height: 60,
              padding: '16px 24px',
              borderRadius: 8,
              backgroundColor: 'var(--color-cta-primary)',
              fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
              fontSize: 22,
              fontWeight: 700,
              lineHeight: '28px',
              color: 'var(--color-cta-text)',
              textDecoration: 'none',
            }}
          >
            {t('hero.aboutKudos')}
            <Image
              src="/assets/homepage/icons/arrow-up.svg"
              alt=""
              width={24}
              height={24}
              aria-hidden="true"
            />
          </Link>
        </div>

        {/* B4 — Root Further paragraph */}
        <div
          style={{
            maxWidth: 1152,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 700,
              lineHeight: '32px',
              color: '#fff',
              textAlign: 'justify',
            }}
          >
            {t('hero.rootFurtherP1')}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 700,
              lineHeight: '32px',
              color: '#fff',
              textAlign: 'justify',
            }}
          >
            {t('hero.rootFurtherP2')}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 700,
              lineHeight: '32px',
              color: '#fff',
              textAlign: 'center',
            }}
          >
            {t('hero.rootFurtherQuote')}
          </p>
        </div>
      </div>
    </section>
  )
}
