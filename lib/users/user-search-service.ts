import type { SupabaseClient } from '@supabase/supabase-js'
import type { UserSearchResult } from '@/lib/kudos/kudo-types'

export async function searchUsers(
  query: string,
  supabase: SupabaseClient
): Promise<UserSearchResult[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .ilike('full_name', `%${trimmed}%`)
    .limit(10)

  if (error) return []
  return data ?? []
}
