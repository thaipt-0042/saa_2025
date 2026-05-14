import { describe, it, expect, vi, beforeEach } from 'vitest'
import { signInWithGoogle, handleOAuthCallback } from './auth-service'

const mockSignInWithOAuth = vi.fn()
const mockExchangeCodeForSession = vi.fn()

const mockSupabase = {
  auth: {
    signInWithOAuth: mockSignInWithOAuth,
    exchangeCodeForSession: mockExchangeCodeForSession,
  },
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('signInWithGoogle', () => {
  it('calls signInWithOAuth with provider google and correct redirectTo', async () => {
    mockSignInWithOAuth.mockResolvedValue({ error: null })
    const redirectTo = 'https://example.com/auth/callback'

    await signInWithGoogle(mockSupabase as never, redirectTo)

    expect(mockSignInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo },
    })
  })

  it('returns the error when SDK returns an error', async () => {
    const authError = new Error('network error')
    mockSignInWithOAuth.mockResolvedValue({ error: authError })

    const result = await signInWithGoogle(
      mockSupabase as never,
      'https://example.com/auth/callback',
    )

    expect(result.error).toBe(authError)
  })

  it('returns null error on success', async () => {
    mockSignInWithOAuth.mockResolvedValue({ error: null })

    const result = await signInWithGoogle(
      mockSupabase as never,
      'https://example.com/auth/callback',
    )

    expect(result.error).toBeNull()
  })
})

describe('handleOAuthCallback', () => {
  it('returns type success with session when code exchange succeeds', async () => {
    const mockSession = { access_token: 'tok', user: { id: 'u1' } }
    mockExchangeCodeForSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })

    const result = await handleOAuthCallback(
      { code: 'valid_code' },
      mockSupabase as never,
    )

    expect(result).toEqual({ type: 'success', session: mockSession })
    expect(mockExchangeCodeForSession).toHaveBeenCalledWith('valid_code')
  })

  it('returns type cancelled when error is access_denied', async () => {
    const result = await handleOAuthCallback(
      { error: 'access_denied' },
      mockSupabase as never,
    )

    expect(result).toEqual({ type: 'cancelled' })
    expect(mockExchangeCodeForSession).not.toHaveBeenCalled()
  })

  it('returns type auth_failed when error is any other value', async () => {
    const result = await handleOAuthCallback(
      { error: 'server_error' },
      mockSupabase as never,
    )

    expect(result).toEqual({ type: 'auth_failed' })
  })

  it('returns type no_params when neither code nor error provided', async () => {
    const result = await handleOAuthCallback({}, mockSupabase as never)

    expect(result).toEqual({ type: 'no_params' })
    expect(mockExchangeCodeForSession).not.toHaveBeenCalled()
  })

  it('returns type auth_failed when code exchange returns an error', async () => {
    mockExchangeCodeForSession.mockResolvedValue({
      data: { session: null },
      error: new Error('exchange failed'),
    })

    const result = await handleOAuthCallback(
      { code: 'bad_code' },
      mockSupabase as never,
    )

    expect(result).toEqual({ type: 'auth_failed' })
  })
})
