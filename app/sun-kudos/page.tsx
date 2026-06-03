import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { getHashtags } from '@/lib/kudos/hashtag-service'
import { getTopKudos, listKudos } from '@/lib/kudos/kudo-service'
import { getUserStats, getSpotlightData, getRecentGiftRecipients } from '@/lib/kudos/live-board-service'
import { getKudoCount } from '@/lib/kudos/kudo-service'
import { getDepartments } from '@/lib/departments/department-service'
import { LiveBoardClient } from './_components/live-board-client'

export default async function SunKudosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const locale = await getLocale()

  const [topKudos, firstPage, hashtags, departments, stats, spotlightNodes, spotlightTotal, recentGifts] =
    await Promise.all([
      getTopKudos(user.id, { hashtagId: null, department: null }, 5, supabase, locale),
      listKudos(user.id, { hashtagId: null, department: null }, null, 10, supabase, locale),
      getHashtags(locale, supabase),
      getDepartments(supabase),
      getUserStats(user.id, supabase),
      getSpotlightData(supabase, 100),
      getKudoCount(supabase),
      getRecentGiftRecipients(supabase),
    ])

  return (
    <LiveBoardClient
      currentUserId={user.id}
      initialTopKudos={topKudos}
      initialPage={firstPage}
      hashtags={hashtags}
      departments={departments}
      initialStats={stats}
      spotlightNodes={spotlightNodes}
      spotlightTotal={spotlightTotal}
      recentGiftRecipients={recentGifts}
      locale={locale}
    />
  )
}
