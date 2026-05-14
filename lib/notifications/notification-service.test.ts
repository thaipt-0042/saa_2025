import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getUnreadCount } from './notification-service'

const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockIsFilter = vi.fn()
const mockFrom = vi.fn()

const mockSupabase = { from: mockFrom }

beforeEach(() => {
  vi.clearAllMocks()
  mockFrom.mockReturnValue({ select: mockSelect })
  mockSelect.mockReturnValue({ eq: mockEq })
  mockEq.mockReturnValue({ is: mockIsFilter })
  mockIsFilter.mockResolvedValue({ count: 0, error: null })
})

describe('getUnreadCount', () => {
  it('returns unread count for a user with unread notifications', async () => {
    mockIsFilter.mockResolvedValue({ count: 3, error: null })

    const result = await getUnreadCount('user-123', mockSupabase as never)

    expect(result).toBe(3)
    expect(mockFrom).toHaveBeenCalledWith('notifications')
  })

  it('returns 0 when user has no unread notifications', async () => {
    mockIsFilter.mockResolvedValue({ count: 0, error: null })

    const result = await getUnreadCount('user-123', mockSupabase as never)

    expect(result).toBe(0)
  })

  it('returns 0 when Supabase returns an error', async () => {
    mockIsFilter.mockResolvedValue({ count: null, error: new Error('DB error') })

    const result = await getUnreadCount('user-123', mockSupabase as never)

    expect(result).toBe(0)
  })

  it('filters by user_id and read_at IS NULL', async () => {
    await getUnreadCount('user-abc', mockSupabase as never)

    expect(mockEq).toHaveBeenCalledWith('user_id', 'user-abc')
    expect(mockIsFilter).toHaveBeenCalledWith('read_at', null)
  })
})
