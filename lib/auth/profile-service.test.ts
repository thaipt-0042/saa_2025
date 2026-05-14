import { describe, it, expect, vi, beforeEach } from 'vitest'
import { upsertProfile } from './profile-service'

const mockUpsert = vi.fn()
const mockFrom = vi.fn(() => ({ upsert: mockUpsert }))

const mockSupabase = {
  from: mockFrom,
}

beforeEach(() => {
  vi.clearAllMocks()
  mockUpsert.mockResolvedValue({ error: null })
})

const mockUser = {
  id: 'user-uuid-123',
  email: 'test@sun-asterisk.com',
  user_metadata: {
    full_name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg',
  },
}

describe('upsertProfile', () => {
  it('calls supabase.from("profiles").upsert with correct payload', async () => {
    await upsertProfile(mockUser as never, mockSupabase as never)

    expect(mockFrom).toHaveBeenCalledWith('profiles')
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'user-uuid-123',
        email: 'test@sun-asterisk.com',
        full_name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg',
      }),
      expect.objectContaining({ onConflict: 'id' }),
    )
  })

  it('does NOT include role in the upsert payload', async () => {
    await upsertProfile(mockUser as never, mockSupabase as never)

    const [payload] = mockUpsert.mock.calls[0]
    expect(payload).not.toHaveProperty('role')
  })

  it('does NOT include created_at in the upsert payload', async () => {
    await upsertProfile(mockUser as never, mockSupabase as never)

    const [payload] = mockUpsert.mock.calls[0]
    expect(payload).not.toHaveProperty('created_at')
  })

  it('includes updated_at in the upsert payload', async () => {
    await upsertProfile(mockUser as never, mockSupabase as never)

    const [payload] = mockUpsert.mock.calls[0]
    expect(payload).toHaveProperty('updated_at')
  })

  it('propagates error from supabase', async () => {
    const dbError = new Error('DB error')
    mockUpsert.mockResolvedValue({ error: dbError })

    const result = await upsertProfile(mockUser as never, mockSupabase as never)

    expect(result.error).toBe(dbError)
  })
})
