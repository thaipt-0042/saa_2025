import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const { mockGetUser, mockGetUnreadCount } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockGetUnreadCount: vi.fn(),
}))

vi.mock('../../../../lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}))

vi.mock('../../../../lib/notifications/notification-service', () => ({
  getUnreadCount: mockGetUnreadCount,
}))

import { GET } from './route'

describe('GET /api/notifications/unread-count', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns count for authenticated user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
    mockGetUnreadCount.mockResolvedValue(5)

    const req = new NextRequest('http://localhost/api/notifications/unread-count')
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual({ count: 5 })
  })

  it('returns count 0 for unauthenticated request (not 401)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

    const req = new NextRequest('http://localhost/api/notifications/unread-count')
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual({ count: 0 })
    expect(mockGetUnreadCount).not.toHaveBeenCalled()
  })

  it('returns count 0 when DB query errors', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
    mockGetUnreadCount.mockResolvedValue(0)

    const req = new NextRequest('http://localhost/api/notifications/unread-count')
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual({ count: 0 })
  })

  it('response shape matches Zod schema {count: number}', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
    mockGetUnreadCount.mockResolvedValue(3)

    const req = new NextRequest('http://localhost/api/notifications/unread-count')
    const res = await GET(req)
    const body = await res.json()

    expect(typeof body.count).toBe('number')
  })
})
