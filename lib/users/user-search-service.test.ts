// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'

const mockSelect = vi.fn()
const mockIlike = vi.fn()
const mockLimit = vi.fn()

const mockSupabase = {
  from: vi.fn(() => ({ select: mockSelect })),
} as unknown as SupabaseClient

beforeEach(() => {
  vi.clearAllMocks()
  mockSelect.mockReturnValue({ ilike: mockIlike })
  mockIlike.mockReturnValue({ limit: mockLimit })
})

import { searchUsers } from './user-search-service'

describe('searchUsers', () => {
  it('returns empty array when query is empty string', async () => {
    const result = await searchUsers('', mockSupabase)
    expect(result).toEqual([])
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns empty array when query is only whitespace', async () => {
    const result = await searchUsers('   ', mockSupabase)
    expect(result).toEqual([])
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('queries profiles table with trimmed ilike pattern', async () => {
    const mockData = [
      { id: 'uuid-1', full_name: 'Nguyen Van An', avatar_url: null },
    ]
    mockLimit.mockResolvedValue({ data: mockData, error: null })

    const result = await searchUsers('  an  ', mockSupabase)

    expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
    expect(mockSelect).toHaveBeenCalledWith('id, full_name, avatar_url')
    expect(mockIlike).toHaveBeenCalledWith('full_name', '%an%')
    expect(result).toEqual(mockData)
  })

  it('returns empty array on supabase error', async () => {
    mockLimit.mockResolvedValue({ data: null, error: new Error('DB error') })
    const result = await searchUsers('an', mockSupabase)
    expect(result).toEqual([])
  })
})
