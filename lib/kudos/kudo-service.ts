import DOMPurify from 'isomorphic-dompurify'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Kudo, KudoPayload } from './kudo-types'

export async function createKudo(
  senderId: string,
  payload: KudoPayload,
  supabase: SupabaseClient
): Promise<Kudo> {
  const sanitizedContent = DOMPurify.sanitize(payload.content)

  const { data, error } = await supabase
    .from('kudos')
    .insert({
      sender_id: senderId,
      recipient_id: payload.recipientId,
      content: sanitizedContent,
      hashtags: payload.hashtags,
      image_urls: payload.imageUrls,
      is_anonymous: payload.isAnonymous,
      anonymous_display_name: payload.anonymousDisplayName,
    })
    .select()
    .single()

  if (error) throw error

  return {
    id: data.id,
    senderId: data.sender_id,
    recipientId: data.recipient_id,
    content: data.content,
    hashtags: data.hashtags,
    imageUrls: data.image_urls,
    isAnonymous: data.is_anonymous,
    anonymousDisplayName: data.anonymous_display_name,
    createdAt: data.created_at,
  }
}
