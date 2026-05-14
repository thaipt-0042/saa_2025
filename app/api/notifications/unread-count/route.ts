import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '../../../../lib/supabase/server'
import { getUnreadCount } from '../../../../lib/notifications/notification-service'

const responseSchema = z.object({ count: z.number() })

export async function GET(_request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(responseSchema.parse({ count: 0 }))
  }

  const count = await getUnreadCount(user.id, supabase)
  return NextResponse.json(responseSchema.parse({ count }))
}
