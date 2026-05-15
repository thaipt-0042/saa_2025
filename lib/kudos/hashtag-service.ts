import type { SupabaseClient } from '@supabase/supabase-js'
import type { HashtagItem } from './kudo-types'

export async function getHashtags(
  locale: string,
  supabase: SupabaseClient
): Promise<HashtagItem[]> {
  const { data, error } = await supabase
    .from('hashtags')
    .select('id, name_vi, name_en')
    .order('name_vi')

  if (error || !data) return []

  return data.map((row) => ({
    id: row.id,
    name: locale === 'en' ? row.name_en : row.name_vi,
  }))
}
