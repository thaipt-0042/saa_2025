import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSpotlightData } from '@/lib/kudos/live-board-service'
import { getKudoCount } from '@/lib/kudos/kudo-service'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 200)

  try {
    const [nodes, totalCount] = await Promise.all([
      getSpotlightData(supabase, limit),
      getKudoCount(supabase),
    ])
    return NextResponse.json({ nodes, totalCount })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch spotlight data' }, { status: 500 })
  }
}
