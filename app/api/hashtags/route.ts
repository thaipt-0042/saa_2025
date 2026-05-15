import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getHashtags } from '@/lib/kudos/hashtag-service'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const locale = request.nextUrl.searchParams.get('locale') ?? 'vi'
  const hashtags = await getHashtags(locale, supabase)
  return NextResponse.json(hashtags)
}
