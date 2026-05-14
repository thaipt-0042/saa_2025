import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockGetUser = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
    }),
  ),
  createServiceClient: vi.fn(),
}))

const BASE_URL = 'http://localhost:3000'
const POST_LOGIN_URL = process.env.NEXT_PUBLIC_POST_LOGIN_URL ?? '/'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('middleware', () => {
  it('redirects authenticated user away from /login to POST_LOGIN_URL', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })

    const { middleware } = await import('./middleware')
    const request = new NextRequest(new URL('/login', BASE_URL))
    const response = await middleware(request)

    expect(response?.status).toBe(307)
    const location = response?.headers.get('location') ?? ''
    const expectedPath = POST_LOGIN_URL === '/' ? BASE_URL + '/' : POST_LOGIN_URL
    expect(location).toContain(expectedPath.replace(/\/$/, ''))
  })

  it('passes through unauthenticated user on /login', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

    const { middleware } = await import('./middleware')
    const request = new NextRequest(new URL('/login', BASE_URL))
    const response = await middleware(request)

    // next() — no redirect, status 200 or undefined location
    expect(response?.headers.get('location')).toBeNull()
  })
})
