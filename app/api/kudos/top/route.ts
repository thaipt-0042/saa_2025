import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTopKudos } from '@/lib/kudos/kudo-service'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const hashtagId = searchParams.get('hashtagId')
  const department = searchParams.get('department')
  const locale = searchParams.get('locale') ?? 'vi'
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '5'), 10)

  try {
    const items = await getTopKudos(user.id, { hashtagId, department }, limit, supabase, locale)
    return NextResponse.json({ items })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch top kudos' }, { status: 500 })
  }
}
