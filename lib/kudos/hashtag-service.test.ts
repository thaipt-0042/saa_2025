// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'

const mockSelect = vi.fn()
const mockOrder = vi.fn()

const mockSupabase = {
  from: vi.fn(() => ({ select: mockSelect })),
} as unknown as SupabaseClient

beforeEach(() => {
  vi.clearAllMocks()
  mockSelect.mockReturnValue({ order: mockOrder })
})

import { getHashtags } from './hashtag-service'

describe('getHashtags', () => {
  it('returns localized vi names when locale is vi', async () => {
    mockOrder.mockResolvedValue({
      data: [
        { id: 'h1', name_vi: 'Sáng tạo', name_en: 'Creative' },
        { id: 'h2', name_vi: 'Hỗ trợ', name_en: 'Support' },
      ],
      error: null,
    })

    const result = await getHashtags('vi', mockSupabase)

    expect(result).toEqual([
      { id: 'h1', name: 'Sáng tạo' },
      { id: 'h2', name: 'Hỗ trợ' },
    ])
  })

  it('returns localized en names when locale is en', async () => {
    mockOrder.mockResolvedValue({
      data: [{ id: 'h1', name_vi: 'Sáng tạo', name_en: 'Creative' }],
      error: null,
    })

    const result = await getHashtags('en', mockSupabase)
    expect(result).toEqual([{ id: 'h1', name: 'Creative' }])
  })

  it('falls back to vi when locale is unknown', async () => {
    mockOrder.mockResolvedValue({
      data: [{ id: 'h1', name_vi: 'Sáng tạo', name_en: 'Creative' }],
      error: null,
    })

    const result = await getHashtags('jp', mockSupabase)
    expect(result).toEqual([{ id: 'h1', name: 'Sáng tạo' }])
  })

  it('returns empty array on supabase error', async () => {
    mockOrder.mockResolvedValue({ data: null, error: new Error('DB error') })
    const result = await getHashtags('vi', mockSupabase)
    expect(result).toEqual([])
  })
})
