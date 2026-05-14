import type { SupabaseClient } from '@supabase/supabase-js'

export async function getUnreadCount(
  userId: string,
  supabase: SupabaseClient,
): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('read_at', null)

  if (error || count === null) return 0
  return count
}
