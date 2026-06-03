import type { SupabaseClient } from '@supabase/supabase-js'

export async function getDepartments(supabase: SupabaseClient): Promise<string[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('department')
    .not('department', 'is', null)
    .order('department')

  if (error || !data) return []

  const seen = new Set<string>()
  const result: string[] = []
  for (const row of data as { department: string }[]) {
    if (row.department && !seen.has(row.department)) {
      seen.add(row.department)
      result.push(row.department)
    }
  }
  return result
}
