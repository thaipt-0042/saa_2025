import sanitizeHtml from 'sanitize-html'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Kudo, KudoPayload } from './kudo-types'
import { computeStarCount } from './live-board-types'
import type { KudoPost, KudosPage, LiveBoardFilters } from './live-board-types'

export async function createKudo(
  senderId: string,
  payload: KudoPayload,
  supabase: SupabaseClient
): Promise<Kudo> {
  const sanitizedContent = sanitizeHtml(payload.content, {
    allowedTags: ['p', 'br', 'strong', 'em', 'u', 's', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre'],
    allowedAttributes: {},
  })

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

export async function toggleLike(
  userId: string,
  kudoId: string,
  supabase: SupabaseClient
): Promise<{ liked: boolean; likeCount: number }> {
  // Verify kudo exists and sender is not liking own kudo
  const { data: kudo, error: kudoErr } = await supabase
    .from('kudos')
    .select('sender_id')
    .eq('id', kudoId)
    .single()

  if (kudoErr || !kudo) throw new Error('KUDO_NOT_FOUND')
  if (kudo.sender_id === userId) throw new Error('SENDER_CANNOT_LIKE')

  // Check for existing like
  const { data: existing } = await supabase
    .from('kudo_likes')
    .select('id')
    .eq('kudo_id', kudoId)
    .eq('user_id', userId)
    .single()

  if (existing) {
    // Unlike
    await supabase
      .from('kudo_likes')
      .delete()
      .eq('kudo_id', kudoId)
      .eq('user_id', userId)

    const likeCount = await getLikeCount(kudoId, supabase)
    return { liked: false, likeCount }
  }

  // Like (hearts_added = 1; special-day logic stubbed)
  const { error: insertErr } = await supabase
    .from('kudo_likes')
    .insert({ kudo_id: kudoId, user_id: userId, hearts_added: 1 })

  if (insertErr) throw insertErr

  const likeCount = await getLikeCount(kudoId, supabase)
  return { liked: true, likeCount }
}

async function getLikeCount(kudoId: string, supabase: SupabaseClient): Promise<number> {
  const { data } = await supabase
    .from('kudo_likes')
    .select('hearts_added')
    .eq('kudo_id', kudoId)

  if (!data) return 0
  return data.reduce((sum: number, row: { hearts_added: number }) => sum + row.hearts_added, 0)
}

export async function getKudoCount(supabase: SupabaseClient): Promise<number> {
  const { count } = await supabase
    .from('kudos')
    .select('*', { count: 'exact', head: true })

  return count ?? 0
}

// ─── helpers ──────────────────────────────────────────────────────────────────

interface RawProfile {
  id: string
  full_name: string | null
  avatar_url: string | null
  department: string | null
  kudos_received_count?: number
}

interface RawHashtag {
  id: string
  name_vi: string
  name_en: string
}

interface RawKudoRow {
  id: string
  sender_id: string
  content: string
  image_urls: string[]
  created_at: string
  hashtags: string[]
  sender: RawProfile
  recipient: RawProfile
  kudo_likes: Array<{ user_id: string; hearts_added: number }>
}

async function resolveHashtags(
  hashtagIds: string[],
  supabase: SupabaseClient,
  locale: string
): Promise<Array<{ id: string; name: string }>> {
  if (hashtagIds.length === 0) return []
  const { data } = await supabase
    .from('hashtags')
    .select('id, name_vi, name_en')
    .in('id', hashtagIds)
  if (!data) return []
  return (data as RawHashtag[]).map((h) => ({
    id: h.id,
    name: locale === 'en' ? h.name_en : h.name_vi,
  }))
}

async function getRecipientKudosCounts(
  recipientIds: string[],
  supabase: SupabaseClient
): Promise<Map<string, number>> {
  if (recipientIds.length === 0) return new Map()
  const { data } = await supabase
    .from('kudos')
    .select('recipient_id')
    .in('recipient_id', recipientIds)

  const counts = new Map<string, number>()
  if (data) {
    for (const row of data as { recipient_id: string }[]) {
      counts.set(row.recipient_id, (counts.get(row.recipient_id) ?? 0) + 1)
    }
  }
  return counts
}

function mapRawToKudoPost(
  row: RawKudoRow,
  currentUserId: string,
  hashtagMap: Map<string, { id: string; name: string }>,
  kudosCountMap: Map<string, number>
): KudoPost {
  const senderCount = kudosCountMap.get(row.sender.id) ?? 0
  const recipientCount = kudosCountMap.get(row.recipient.id) ?? 0
  const likeCount = row.kudo_likes.reduce((s, l) => s + l.hearts_added, 0)
  const likedByCurrentUser = row.kudo_likes.some((l) => l.user_id === currentUserId)

  return {
    id: row.id,
    sender: {
      id: row.sender.id,
      fullName: row.sender.full_name,
      avatarUrl: row.sender.avatar_url,
      department: row.sender.department,
      starCount: computeStarCount(senderCount),
    },
    recipient: {
      id: row.recipient.id,
      fullName: row.recipient.full_name,
      avatarUrl: row.recipient.avatar_url,
      department: row.recipient.department,
      starCount: computeStarCount(recipientCount),
    },
    content: row.content,
    hashtags: row.hashtags.map((id) => hashtagMap.get(id) ?? { id, name: '' }),
    imageUrls: row.image_urls,
    likeCount,
    likedByCurrentUser,
    senderIsCurrentUser: row.sender_id === currentUserId,
    createdAt: row.created_at,
  }
}

// ─── listKudos ────────────────────────────────────────────────────────────────

export async function listKudos(
  currentUserId: string,
  filters: Pick<LiveBoardFilters, 'hashtagId' | 'department'>,
  cursor: string | null,
  limit: number = 10,
  supabase: SupabaseClient,
  locale: string = 'vi'
): Promise<KudosPage> {
  let query = supabase
    .from('kudos')
    .select(`
      id, sender_id, content, image_urls, created_at, hashtags,
      sender:profiles!kudos_sender_id_fkey(id, full_name, avatar_url, department),
      recipient:profiles!kudos_recipient_id_fkey(id, full_name, avatar_url, department),
      kudo_likes(user_id, hearts_added)
    `)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(limit + 1)

  if (cursor) {
    const [ts, id] = cursor.split('_')
    query = query.or(`created_at.lt.${ts},and(created_at.eq.${ts},id.lt.${id})`)
  }

  if (filters.hashtagId) {
    query = query.contains('hashtags', [filters.hashtagId])
  }

  const { data, error } = await query
  if (error) throw error

  const rows = (data ?? []) as unknown as RawKudoRow[]
  const hasMore = rows.length > limit
  const items = hasMore ? rows.slice(0, limit) : rows

  const allHashtagIds = [...new Set(items.flatMap((r) => r.hashtags))]
  const allProfileIds = [...new Set(items.flatMap((r) => [r.sender.id, r.recipient.id]))]

  const [hashtagRows, kudosCountMap] = await Promise.all([
    resolveHashtags(allHashtagIds, supabase, locale),
    getRecipientKudosCounts(allProfileIds, supabase),
  ])

  const hashtagMap = new Map(hashtagRows.map((h) => [h.id, h]))

  let filteredItems = items.map((row) =>
    mapRawToKudoPost(row, currentUserId, hashtagMap, kudosCountMap)
  )

  if (filters.department) {
    filteredItems = filteredItems.filter(
      (k) => k.recipient.department === filters.department || k.sender.department === filters.department
    )
  }

  const lastItem = filteredItems[filteredItems.length - 1]
  const nextCursor = hasMore && lastItem
    ? `${lastItem.createdAt}_${lastItem.id}`
    : null

  return { items: filteredItems, nextCursor }
}

// ─── getTopKudos ─────────────────────────────────────────────────────────────

export async function getTopKudos(
  currentUserId: string,
  filters: Pick<LiveBoardFilters, 'hashtagId' | 'department'>,
  limit: number = 5,
  supabase: SupabaseClient,
  locale: string = 'vi'
): Promise<KudoPost[]> {
  let query = supabase
    .from('kudos')
    .select(`
      id, sender_id, content, image_urls, created_at, hashtags,
      sender:profiles!kudos_sender_id_fkey(id, full_name, avatar_url, department),
      recipient:profiles!kudos_recipient_id_fkey(id, full_name, avatar_url, department),
      kudo_likes(user_id, hearts_added)
    `)

  if (filters.hashtagId) {
    query = query.contains('hashtags', [filters.hashtagId])
  }

  const { data, error } = await query
  if (error) throw error

  const rows = (data ?? []) as unknown as RawKudoRow[]

  const allHashtagIds = [...new Set(rows.flatMap((r) => r.hashtags))]
  const allProfileIds = [...new Set(rows.flatMap((r) => [r.sender.id, r.recipient.id]))]

  const [hashtagRows, kudosCountMap] = await Promise.all([
    resolveHashtags(allHashtagIds, supabase, locale),
    getRecipientKudosCounts(allProfileIds, supabase),
  ])

  const hashtagMap = new Map(hashtagRows.map((h) => [h.id, h]))

  let posts = rows.map((row) => mapRawToKudoPost(row, currentUserId, hashtagMap, kudosCountMap))

  if (filters.department) {
    posts = posts.filter(
      (k) => k.recipient.department === filters.department || k.sender.department === filters.department
    )
  }

  return posts
    .sort((a, b) => b.likeCount - a.likeCount || b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
}
