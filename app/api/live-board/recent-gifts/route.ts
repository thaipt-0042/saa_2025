import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRecentGiftRecipients } from '@/lib/kudos/live-board-service'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const recipients = await getRecentGiftRecipients(supabase)
    return NextResponse.json({ recipients })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch recent gifts' }, { status: 500 })
  }
}
