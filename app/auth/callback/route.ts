import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { handleOAuthCallback } from '@/lib/auth/auth-service'
import { upsertProfile } from '@/lib/auth/profile-service'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const POST_LOGIN_URL = process.env.NEXT_PUBLIC_POST_LOGIN_URL ?? '/'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code') ?? undefined
  const error = searchParams.get('error') ?? undefined

  const supabase = await createClient()
  const result = await handleOAuthCallback({ code, error }, supabase)

  switch (result.type) {
    case 'success': {
      const serviceClient = await createServiceClient()
      const { error } = await upsertProfile(result.session.user, serviceClient)
      if (error) {
        console.error('❌ upsertProfile error:', JSON.stringify(error, null, 2))
        console.error('Error message:', error.message)
        console.error('Error code:', (error as any).code)
        console.error('Error details:', (error as any).details)
      } else {
        console.log('✅ Profile created/updated for user:', result.session.user.id)
      }
      const destination = POST_LOGIN_URL.startsWith('http')
        ? POST_LOGIN_URL
        : `${SITE_URL}${POST_LOGIN_URL}`
      return NextResponse.redirect(destination)
    }

    case 'cancelled':
      return NextResponse.redirect(`${SITE_URL}/login`)

    case 'auth_failed':
      return NextResponse.redirect(`${SITE_URL}/login?error=auth_failed`)

    case 'no_params':
      return NextResponse.redirect(`${SITE_URL}/login`)
  }
}
