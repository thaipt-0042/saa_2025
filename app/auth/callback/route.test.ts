import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/auth/auth-service', () => ({
  handleOAuthCallback: vi.fn(),
}))
vi.mock('@/lib/auth/profile-service', () => ({
  upsertProfile: vi.fn(),
}))
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({ mockClient: true })),
  createServiceClient: vi.fn(() => Promise.resolve({ mockServiceClient: true })),
}))

import { handleOAuthCallback } from '@/lib/auth/auth-service'
import { upsertProfile } from '@/lib/auth/profile-service'

const mockHandleOAuthCallback = vi.mocked(handleOAuthCallback)
const mockUpsertProfile = vi.mocked(upsertProfile)

const POST_LOGIN_URL = process.env.NEXT_PUBLIC_POST_LOGIN_URL ?? '/'
const BASE_URL = 'http://localhost:3000'

function makeRequest(params: Record<string, string>) {
  const url = new URL('/auth/callback', BASE_URL)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return new NextRequest(url.toString())
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /auth/callback', () => {
  it('redirects to POST_LOGIN_URL on successful code exchange', async () => {
    const mockSession = { user: { id: 'u1', email: 'a@b.com', user_metadata: {} } }
    mockHandleOAuthCallback.mockResolvedValue({ type: 'success', session: mockSession as never })
    mockUpsertProfile.mockResolvedValue({ error: null })

    const { GET } = await import('./route')
    const response = await GET(makeRequest({ code: 'valid_code' }))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain(POST_LOGIN_URL === '/' ? BASE_URL : POST_LOGIN_URL)
    expect(mockUpsertProfile).toHaveBeenCalled()
  })

  it('redirects to /login on access_denied', async () => {
    mockHandleOAuthCallback.mockResolvedValue({ type: 'cancelled' })

    const { GET } = await import('./route')
    const response = await GET(makeRequest({ error: 'access_denied' }))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/login')
    expect(response.headers.get('location')).not.toContain('error=')
    expect(mockUpsertProfile).not.toHaveBeenCalled()
  })

  it('redirects to /login?error=auth_failed on other OAuth error', async () => {
    mockHandleOAuthCallback.mockResolvedValue({ type: 'auth_failed' })

    const { GET } = await import('./route')
    const response = await GET(makeRequest({ error: 'server_error' }))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/login?error=auth_failed')
  })

  it('redirects to /login when no params provided', async () => {
    mockHandleOAuthCallback.mockResolvedValue({ type: 'no_params' })

    const { GET } = await import('./route')
    const response = await GET(makeRequest({}))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/login')
    expect(response.headers.get('location')).not.toContain('error=')
  })
})
