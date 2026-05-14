import { cookies } from 'next/headers'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Header } from '@/app/components/header'
import { Footer } from '@/app/components/footer'
import { LoginPageClient } from './_components/login-page-client'

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const cookieStore = await cookies()
  const locale = cookieStore.get('lang')?.value ?? 'vi'
  const params = await searchParams
  const hasError = params.error === 'auth_failed'
  const t = await getTranslations('login')

  return (
    <main
      className="relative min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--color-bg-base)' }}
    >
      {/* C — Background overlays (image not available; dark base + gradients) */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, #00101A 0%, #00101A 25.41%, rgba(0,16,26,0) 100%)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(0deg, #00101A 22.48%, rgba(0,19,32,0) 51.74%)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* A — Header */}
      <Header currentLocale={locale} />

      {/* B — Content panel */}
      <div
        className="relative flex flex-col flex-1"
        style={{ padding: '96px 144px', gap: 120, zIndex: 1 }}
      >
        {/* Frame 487 */}
        <div className="flex flex-col" style={{ gap: 80 }}>
          {/* B.1 — ROOT FURTHER logo */}
          <div style={{ width: 1152, maxWidth: '100%' }}>
            <Image
              src="/assets/login/logos/root-further-logo.png"
              alt="Root Further"
              width={451}
              height={200}
              priority
            />
          </div>

          {/* Frame 550 — tagline + login button */}
          <div
            className="flex flex-col"
            style={{ padding: '0 0 0 16px', gap: 24, maxWidth: 496 }}
          >
            {/* B.2 — Tagline */}
            <p
              style={{
                fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
                fontWeight: 700,
                fontSize: 20,
                lineHeight: '40px',
                letterSpacing: '0.5px',
                color: '#fff',
                margin: 0,
              }}
            >
              {t('tagline')}
            </p>

            {/* B.3 — Login button + error alert */}
            <LoginPageClient hasError={hasError} />
          </div>
        </div>
      </div>

      {/* D — Footer */}
      <div className="relative" style={{ zIndex: 1 }}>
        <Footer />
      </div>
    </main>
  )
}
