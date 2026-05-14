import { redirect } from 'next/navigation'
import Image from 'next/image'
import { getLocale } from 'next-intl/server'
import { createClient } from '../../lib/supabase/server'
import { getProfile } from '../../lib/auth/profile-service'
import { Header } from '../components/header'
import { Footer } from '../components/footer'
import { KudosSection } from '../_components/kudos-section'
import { AWARDS } from '../../lib/homepage/awards.config'
import { AwardInfoBlock } from './_components/award-info-block'
import { AwardsNav } from './_components/awards-nav'

export default async function AwardsInformationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  let role: 'admin' | 'user' | null = null
  const profile = await getProfile(user.id, supabase)
  role = profile?.role ?? 'user'

  const locale = await getLocale()

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-base)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Header currentLocale={locale} currentPath="/awards-information" user={user} role={role} />

      <main style={{ flex: 1 }}>
        {/* Keyvisual banner */}
        <section style={{ position: 'relative', height: '400px', overflow: 'hidden' }}>
          <Image
            src="/assets/homepage/images/keyvisual-bg.png"
            alt="Keyvisual Sun* Annual Award 2025"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center top' }}
            sizes="100vw"
            priority
          />
        </section>

        {/* Title section */}
        <section style={{ padding: '48px 144px 32px', textAlign: 'center' }}>
          <p
            style={{
              fontFamily: 'var(--font-montserrat)',
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '0.1em',
              color: 'var(--color-cta-primary)',
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
          >
            Sun* Annual Award 2025
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-montserrat)',
              fontSize: 40,
              fontWeight: 800,
              color: 'var(--color-text-primary)',
              margin: 0,
            }}
          >
            Hệ thống giải thưởng
          </h1>
        </section>

        {/* 2-column: sticky nav + award blocks */}
        <section style={{ padding: '0 144px 64px', display: 'flex', flexDirection: 'row', gap: '48px', alignItems: 'flex-start' }}>
          <AwardsNav />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '48px' }}>
            {AWARDS.map((award) => (
              <AwardInfoBlock key={award.slug} award={award} />
            ))}
          </div>
        </section>

        <KudosSection />
      </main>

      <Footer />
    </div>
  )
}
