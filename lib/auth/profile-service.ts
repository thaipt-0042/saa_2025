import type { SupabaseClient, User } from '@supabase/supabase-js'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'admin' | 'user'
}

export async function getProfile(
  userId: string,
  supabase: SupabaseClient,
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url, role')
    .eq('id', userId)
    .single()

  if (error || !data) return null
  return data as Profile
}

export async function upsertProfile(
  user: User,
  supabase: SupabaseClient,
): Promise<{ error: Error | null }> {
  const { error } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      email: user.email ?? '',
      full_name: user.user_metadata?.full_name ?? null,
      avatar_url: user.user_metadata?.avatar_url ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  )
  return { error: error as Error | null }
}
