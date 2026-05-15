// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

vi.mock('@/lib/hooks/use-debounce', () => ({
  useDebounce: (v: unknown) => v,
}))

const mockFetch = vi.fn()
global.fetch = mockFetch

beforeEach(() => { vi.clearAllMocks() })

afterEach(() => { vi.restoreAllMocks() })

import { RecipientSearchInput } from './recipient-search-input'

describe('RecipientSearchInput', () => {
  it('does not call API when input is empty', () => {
    render(<RecipientSearchInput value="" onSelect={vi.fn()} />)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('calls /api/users/search with trimmed query when typing', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [{ id: 'u1', full_name: 'An Nguyen', avatar_url: null }],
    })

    render(<RecipientSearchInput value="an" onSelect={vi.fn()} />)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/users/search?q=an')
    })
  })

  it('renders suggestions and calls onSelect when clicked', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [{ id: 'u1', full_name: 'An Nguyen', avatar_url: null }],
    })
    const onSelect = vi.fn()
    render(<RecipientSearchInput value="an" onSelect={onSelect} />)

    await waitFor(() => {
      expect(screen.getByText('An Nguyen')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('An Nguyen'))
    expect(onSelect).toHaveBeenCalledWith({ id: 'u1', full_name: 'An Nguyen', avatar_url: null })
  })

  it('shows no-results message when API returns empty array', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => [] })
    render(<RecipientSearchInput value="xyz" onSelect={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByText(/không tìm thấy/i)).toBeInTheDocument()
    })
  })
})
