'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { signInWithGoogle } from '@/lib/auth/auth-service'
import { LoginButton } from './login-button'
import { ErrorAlert } from './error-alert'

interface LoginPageClientProps {
  hasError: boolean
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export function LoginPageClient({ hasError }: LoginPageClientProps) {
  const t = useTranslations('login')
  const [isPending, setIsPending] = useState(false)
  const [clientError, setClientError] = useState(false)

  const showError = hasError || clientError

  async function handleLogin() {
    setIsPending(true)
    setClientError(false)

    const supabase = createClient()
    const redirectTo = `${SITE_URL}/auth/callback`
    const { error } = await signInWithGoogle(supabase, redirectTo)

    if (error) {
      setIsPending(false)
      setClientError(true)
    }
    // on success: browser navigates away — no state update needed
  }

  return (
    <div className="flex flex-col gap-6">
      {showError && <ErrorAlert message={t('errorMessage')} />}
      <LoginButton label={t('button')} onLogin={handleLogin} isPending={isPending} />
    </div>
  )
}
