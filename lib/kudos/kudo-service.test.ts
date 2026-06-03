// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'

vi.mock('isomorphic-dompurify', () => ({
  default: {
    sanitize: (input: string) => input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''),
  },
}))

// --- createKudo mocks ---
const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockSingle = vi.fn()

// --- toggleLike mocks ---
const mockFromFn = vi.fn()
let supabaseCallMap: Record<string, ReturnType<typeof vi.fn>> = {}

function createToggleMockSupabase(overrides: Record<string, unknown>) {
  return {
    from: vi.fn((table: string) => {
      const mock = supabaseCallMap[table] ?? {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        insert: vi.fn().mockResolvedValue({ error: null }),
        delete: vi.fn().mockReturnThis(),
      }
      return { ...mock, ...overrides }
    }),
  } as unknown as SupabaseClient
}

const mockCreateSupabase = {
  from: vi.fn(() => ({ insert: mockInsert })),
} as unknown as SupabaseClient

beforeEach(() => {
  vi.clearAllMocks()
  mockInsert.mockReturnValue({ select: mockSelect })
  mockSelect.mockReturnValue({ single: mockSingle })
  supabaseCallMap = {}
  mockFromFn.mockReset()
})

import { createKudo, toggleLike } from './kudo-service'

// ─── createKudo ───────────────────────────────────────────────────────────────

describe('createKudo', () => {
  const payload = {
    recipientId: 'user-2',
    content: '<p>Great work!</p>',
    hashtags: ['ht-1'],
    imageUrls: [],
    isAnonymous: false,
    anonymousDisplayName: null,
  }

  it('inserts kudo and returns created record', async () => {
    const mockKudo = {
      id: 'kudo-1',
      sender_id: 'user-1',
      recipient_id: 'user-2',
      content: '<p>Great work!</p>',
      hashtags: ['ht-1'],
      image_urls: [],
      is_anonymous: false,
      anonymous_display_name: null,
      created_at: '2026-05-15T00:00:00Z',
    }
    mockSingle.mockResolvedValue({ data: mockKudo, error: null })

    const result = await createKudo('user-1', payload, mockCreateSupabase)

    expect(mockCreateSupabase.from).toHaveBeenCalledWith('kudos')
    expect(mockInsert).toHaveBeenCalledWith({
      sender_id: 'user-1',
      recipient_id: 'user-2',
      content: expect.any(String),
      hashtags: ['ht-1'],
      image_urls: [],
      is_anonymous: false,
      anonymous_display_name: null,
    })
    expect(result).toEqual({
      id: 'kudo-1',
      senderId: 'user-1',
      recipientId: 'user-2',
      content: '<p>Great work!</p>',
      hashtags: ['ht-1'],
      imageUrls: [],
      isAnonymous: false,
      anonymousDisplayName: null,
      createdAt: '2026-05-15T00:00:00Z',
    })
  })

  it('sanitizes HTML content before inserting', async () => {
    const maliciousPayload = {
      ...payload,
      content: '<p>Hello</p><script>alert("xss")</script>',
    }
    mockSingle.mockResolvedValue({
      data: { id: 'k1', sender_id: 'u1', recipient_id: 'u2', content: '<p>Hello</p>', hashtags: [], image_urls: [], is_anonymous: false, anonymous_display_name: null, created_at: '' },
      error: null,
    })

    await createKudo('user-1', maliciousPayload, mockCreateSupabase)

    const insertedContent = mockInsert.mock.calls[0][0].content as string
    expect(insertedContent).not.toContain('<script>')
    expect(insertedContent).toContain('Hello')
  })

  it('throws on supabase error', async () => {
    mockSingle.mockResolvedValue({ data: null, error: new Error('DB error') })
    await expect(createKudo('user-1', payload, mockCreateSupabase)).rejects.toThrow('DB error')
  })
})

// ─── toggleLike ───────────────────────────────────────────────────────────────

describe('toggleLike', () => {
  function buildSupabase({
    kudoSenderId,
    existingLike,
    likeCount = 1,
  }: {
    kudoSenderId: string
    existingLike: boolean
    likeCount?: number
  }) {
    const kudosSingleFn = vi.fn().mockResolvedValue({
      data: { sender_id: kudoSenderId },
      error: null,
    })
    const likesSingleFn = vi.fn().mockResolvedValue({
      data: existingLike ? { id: 'like-1' } : null,
      error: null,
    })
    const insertFn = vi.fn().mockResolvedValue({ error: null })
    const deleteFn = vi.fn().mockReturnThis()
    const eqDeleteFn = vi.fn().mockReturnThis()
    const eqDelete2Fn = vi.fn().mockResolvedValue({ error: null })
    const countFn = vi.fn().mockResolvedValue({
      data: [{ hearts_added: likeCount }],
      error: null,
    })

    return {
      from: vi.fn((table: string) => {
        if (table === 'kudos') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: kudosSingleFn,
          }
        }
        if (table === 'kudo_likes') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn((col: string) => {
              if (col === 'kudo_id') return { eq: vi.fn().mockReturnThis(), single: likesSingleFn }
              return { single: likesSingleFn }
            }),
            insert: insertFn,
            delete: vi.fn(() => ({
              eq: vi.fn(() => ({ eq: eqDelete2Fn })),
            })),
          }
        }
        return {
          select: countFn,
          eq: vi.fn().mockReturnThis(),
        }
      }),
    } as unknown as SupabaseClient
  }

  it('throws SENDER_CANNOT_LIKE when the sender tries to like own kudo', async () => {
    const supabase = buildSupabase({ kudoSenderId: 'user-1', existingLike: false })
    await expect(toggleLike('user-1', 'kudo-1', supabase)).rejects.toThrow('SENDER_CANNOT_LIKE')
  })

  it('returns liked: true on first like', async () => {
    const supabase = buildSupabase({ kudoSenderId: 'user-2', existingLike: false, likeCount: 1 })
    const result = await toggleLike('user-1', 'kudo-1', supabase)
    expect(result.liked).toBe(true)
  })

  it('returns liked: false on unlike', async () => {
    const supabase = buildSupabase({ kudoSenderId: 'user-2', existingLike: true, likeCount: 0 })
    const result = await toggleLike('user-1', 'kudo-1', supabase)
    expect(result.liked).toBe(false)
  })
})
