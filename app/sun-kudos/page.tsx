import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { getHashtags } from '@/lib/kudos/hashtag-service'
import { SunKudosClient } from './_components/sun-kudos-client'

export default async function SunKudosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const locale = await getLocale()
  const hashtags = await getHashtags(locale, supabase)

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      <div className="flex items-center justify-center min-h-screen flex-col gap-6">
        <p className="text-white opacity-50">Sun* Kudos Live Board</p>
        <SunKudosClient hashtags={hashtags} />
      </div>
    </main>
  )
}
