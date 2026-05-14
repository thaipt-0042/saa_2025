import { describe, it, expect, vi, beforeEach } from 'vitest'
import { upsertProfile, getProfile } from './profile-service'

const mockUpsert = vi.fn()
const mockSingle = vi.fn()
const mockEq = vi.fn(() => ({ single: mockSingle }))
const mockSelect = vi.fn(() => ({ eq: mockEq }))
const mockFrom = vi.fn((table: string) => {
  if (table === 'profiles') return { upsert: mockUpsert, select: mockSelect }
  return { upsert: mockUpsert, select: mockSelect }
})

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

describe('getProfile', () => {
  const profileData = {
    id: 'user-uuid-123',
    email: 'test@sun-asterisk.com',
    full_name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg',
    role: 'user',
  }

  beforeEach(() => {
    mockSingle.mockResolvedValue({ data: profileData, error: null })
  })

  it('returns profile when user is found', async () => {
    const result = await getProfile('user-uuid-123', mockSupabase as never)

    expect(result).toEqual(profileData)
    expect(mockFrom).toHaveBeenCalledWith('profiles')
    expect(mockEq).toHaveBeenCalledWith('id', 'user-uuid-123')
  })

  it('returns null when user is not found', async () => {
    mockSingle.mockResolvedValue({ data: null, error: null })

    const result = await getProfile('nonexistent', mockSupabase as never)

    expect(result).toBeNull()
  })

  it('returns null when Supabase returns an error', async () => {
    mockSingle.mockResolvedValue({ data: null, error: new Error('DB error') })

    const result = await getProfile('user-uuid-123', mockSupabase as never)

    expect(result).toBeNull()
  })

  it('selects all expected profile fields', async () => {
    await getProfile('user-uuid-123', mockSupabase as never)

    expect(mockSelect).toHaveBeenCalledWith('id, email, full_name, avatar_url, role')
  })
})
