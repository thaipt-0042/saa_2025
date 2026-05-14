import type { SupabaseClient, Session } from '@supabase/supabase-js'

export type CallbackResult =
  | { type: 'success'; session: Session }
  | { type: 'cancelled' }
  | { type: 'auth_failed' }
  | { type: 'no_params' }

export async function signInWithGoogle(
  supabase: SupabaseClient,
  redirectTo: string,
): Promise<{ error: Error | null }> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  })
  return { error: error as Error | null }
}

export async function handleOAuthCallback(
  params: { code?: string; error?: string },
  supabase: SupabaseClient,
): Promise<CallbackResult> {
  const { code, error } = params

  if (error) {
    return error === 'access_denied' ? { type: 'cancelled' } : { type: 'auth_failed' }
  }

  if (!code) {
    return { type: 'no_params' }
  }

  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError || !data.session) {
    return { type: 'auth_failed' }
  }

  return { type: 'success', session: data.session }
}
