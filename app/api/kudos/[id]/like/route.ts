import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { toggleLike } from '@/lib/kudos/kudo-service'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    const result = await toggleLike(user.id, id, supabase)
    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof Error && err.message === 'SENDER_CANNOT_LIKE')
      return NextResponse.json({ error: 'Cannot like own kudo' }, { status: 403 })
    if (err instanceof Error && err.message === 'KUDO_NOT_FOUND')
      return NextResponse.json({ error: 'Kudo not found' }, { status: 404 })
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 })
  }
}
