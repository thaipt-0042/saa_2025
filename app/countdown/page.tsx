import { redirect } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '../../lib/supabase/server'
import { isPrelaunchMode } from '../../lib/config/event'
import { CountdownTimer } from '../_components/countdown-timer'

export default async function CountdownPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  if (!isPrelaunchMode()) redirect('/')

  return (
    <main
      style={{
        position: 'relative',
        minHeight: '100vh',
        backgroundColor: '#0D1B2A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflow: 'hidden',
      }}
    >
      {/* Background artwork */}
      <Image
        src="/assets/countdown/images/bg.png"
        alt=""
        aria-hidden="true"
        fill
        priority
        style={{ objectFit: 'cover', objectPosition: 'center' }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '0 0 0 220px',
        }}
      >
        <CountdownTimer />
      </div>
    </main>
  )
}
