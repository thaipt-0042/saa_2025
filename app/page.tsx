import { getLocale } from 'next-intl/server'
import { createClient } from '../lib/supabase/server'
import { getProfile } from '../lib/auth/profile-service'
import { Header } from './components/header'
import { Footer } from './components/footer'
import { HeroSection } from './_components/hero-section'
import { AwardGrid } from './_components/award-grid'
import { KudosSection } from './_components/kudos-section'
import { WidgetButton } from './_components/widget-button'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let role: 'admin' | 'user' | null = null
  if (user) {
    const profile = await getProfile(user.id, supabase)
    role = profile?.role ?? 'user'
  }

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
      <Header currentLocale={locale} currentPath="/" user={user} role={role} />

      <main style={{ flex: 1 }}>
        <HeroSection />
        <AwardGrid />
        <KudosSection />
      </main>

      <WidgetButton />
      <Footer />
    </div>
  )
}
