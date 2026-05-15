// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'

vi.mock('isomorphic-dompurify', () => ({
  default: {
    sanitize: (input: string) => input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''),
  },
}))

const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockSingle = vi.fn()

const mockSupabase = {
  from: vi.fn(() => ({ insert: mockInsert })),
} as unknown as SupabaseClient

beforeEach(() => {
  vi.clearAllMocks()
  mockInsert.mockReturnValue({ select: mockSelect })
  mockSelect.mockReturnValue({ single: mockSingle })
})

import { createKudo } from './kudo-service'

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

    const result = await createKudo('user-1', payload, mockSupabase)

    expect(mockSupabase.from).toHaveBeenCalledWith('kudos')
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

    await createKudo('user-1', maliciousPayload, mockSupabase)

    const insertedContent = mockInsert.mock.calls[0][0].content as string
    expect(insertedContent).not.toContain('<script>')
    expect(insertedContent).toContain('Hello')
  })

  it('throws on supabase error', async () => {
    mockSingle.mockResolvedValue({ data: null, error: new Error('DB error') })
    await expect(createKudo('user-1', payload, mockSupabase)).rejects.toThrow('DB error')
  })
})
