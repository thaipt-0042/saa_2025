import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const POST_LOGIN_URL = process.env.NEXT_PUBLIC_POST_LOGIN_URL ?? '/'

export async function middleware(_request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const destination = POST_LOGIN_URL.startsWith('http')
      ? POST_LOGIN_URL
      : `${SITE_URL}${POST_LOGIN_URL}`
    return NextResponse.redirect(destination)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/login'],
}
