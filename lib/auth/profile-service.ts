import type { SupabaseClient, User } from '@supabase/supabase-js'

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
