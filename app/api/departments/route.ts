import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDepartments } from '@/lib/departments/department-service'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const departments = await getDepartments(supabase)
    return NextResponse.json({ departments })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 })
  }
}
