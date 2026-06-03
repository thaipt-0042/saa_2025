import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createKudo, listKudos } from '@/lib/kudos/kudo-service'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const hashtagId = searchParams.get('hashtagId')
  const department = searchParams.get('department')
  const cursor = searchParams.get('cursor') ?? null
  const locale = searchParams.get('locale') ?? 'vi'

  try {
    const page = await listKudos(user.id, { hashtagId, department }, cursor, 10, supabase, locale)
    return NextResponse.json(page)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch kudos' }, { status: 500 })
  }
}

const kudoBodySchema = z.object({
  recipientId: z.string().uuid(),
  content: z.string().min(1).max(5000),
  hashtags: z.array(z.string().uuid()).default([]),
  imageUrls: z.array(z.string().url()).max(5).default([]),
  isAnonymous: z.boolean().default(false),
  anonymousDisplayName: z.string().max(100).nullable().default(null),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = kudoBodySchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const kudo = await createKudo(user.id, parsed.data, supabase)
    return NextResponse.json(kudo, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create kudo' }, { status: 500 })
  }
}
