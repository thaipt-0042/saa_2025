import type { SupabaseClient } from '@supabase/supabase-js'
import type { LiveBoardStats, SpotlightNode, SunnerActivity } from './live-board-types'
import { computeStarCount } from './live-board-types'

export async function getUserStats(
  userId: string,
  supabase: SupabaseClient
): Promise<LiveBoardStats> {
  const [received, sent, likes, boxesOpened, boxesUnopened] = await Promise.all([
    supabase.from('kudos').select('*', { count: 'exact', head: true }).eq('recipient_id', userId),
    supabase.from('kudos').select('*', { count: 'exact', head: true }).eq('sender_id', userId),
    supabase
      .from('kudo_likes')
      .select('hearts_added')
      .in(
        'kudo_id',
        // hearts go to kudo SENDER — sub-select kudos where sender = userId
        (
          await supabase.from('kudos').select('id').eq('sender_id', userId)
        ).data?.map((r: { id: string }) => r.id) ?? []
      ),
    supabase
      .from('secret_boxes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_opened', true),
    supabase
      .from('secret_boxes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_opened', false),
  ])

  const heartsReceived = (likes.data ?? []).reduce(
    (sum: number, r: { hearts_added: number }) => sum + r.hearts_added,
    0
  )

  return {
    kudosReceived: received.count ?? 0,
    kudosSent: sent.count ?? 0,
    heartsReceived,
    secretBoxesOpened: boxesOpened.count ?? 0,
    secretBoxesUnopened: boxesUnopened.count ?? 0,
  }
}

export async function getSpotlightData(
  supabase: SupabaseClient,
  limit: number = 100
): Promise<SpotlightNode[]> {
  const { data, error } = await supabase
    .from('kudos')
    .select('recipient_id, created_at, recipient:profiles!kudos_recipient_id_fkey(id, full_name)')
    .order('created_at', { ascending: false })

  if (error || !data) return []

  // Aggregate by recipient
  const map = new Map<string, { fullName: string; count: number; latestAt: string }>()
  for (const row of data as unknown as Array<{
    recipient_id: string
    created_at: string
    recipient: { id: string; full_name: string | null }
  }>) {
    const existing = map.get(row.recipient_id)
    if (existing) {
      existing.count += 1
      if (row.created_at > existing.latestAt) existing.latestAt = row.created_at
    } else {
      map.set(row.recipient_id, {
        fullName: row.recipient.full_name ?? row.recipient_id,
        count: 1,
        latestAt: row.created_at,
      })
    }
  }

  return Array.from(map.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit)
    .map(([userId, { fullName, count, latestAt }]) => ({
      userId,
      fullName,
      kudosReceived: count,
      latestKudoAt: latestAt,
    }))
}

export async function getRecentGiftRecipients(
  supabase: SupabaseClient
): Promise<SunnerActivity[]> {
  const { data, error } = await supabase
    .from('secret_boxes')
    .select('user_id, opened_at, user:profiles!secret_boxes_user_id_fkey(id, full_name, avatar_url)')
    .eq('is_opened', true)
    .order('opened_at', { ascending: false })
    .limit(10)

  if (error || !data) return []

  return (
    data as unknown as Array<{
      user_id: string
      opened_at: string
      user: { id: string; full_name: string | null; avatar_url: string | null }
    }>
  ).map((row) => ({
    userId: row.user_id,
    fullName: row.user.full_name,
    avatarUrl: row.user.avatar_url,
    description: `vừa nhận Secret Box`,
  }))
}

// Re-export computeStarCount so consumers can use it without a separate import
export { computeStarCount }
