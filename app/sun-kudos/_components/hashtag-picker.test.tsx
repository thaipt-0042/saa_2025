// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const mockFetch = vi.fn()
global.fetch = mockFetch

beforeEach(() => { vi.clearAllMocks() })

import { HashtagPicker } from './hashtag-picker'

const allHashtags = [
  { id: 'ht-1', name: 'Sáng tạo' },
  { id: 'ht-2', name: 'Hỗ trợ' },
  { id: 'ht-3', name: 'Chăm chỉ' },
]

describe('HashtagPicker', () => {
  it('renders selected chips', () => {
    render(
      <HashtagPicker
        selected={['ht-1']}
        allHashtags={allHashtags}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
      />
    )
    expect(screen.getByText(/Sáng tạo/)).toBeInTheDocument()
  })

  it('clicking chip in dropdown calls onAdd', async () => {
    const onAdd = vi.fn()
    render(
      <HashtagPicker
        selected={[]}
        allHashtags={allHashtags}
        onAdd={onAdd}
        onRemove={vi.fn()}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /hashtag/i }))
    await waitFor(() => {
      expect(screen.getByText(/Sáng tạo/)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText(/Sáng tạo/))
    expect(onAdd).toHaveBeenCalledWith('ht-1')
  })

  it('hides add button when 5 chips are selected', () => {
    const fiveIds = ['ht-1', 'ht-2', 'ht-3', 'ht-4', 'ht-5']
    const manyHashtags = fiveIds.map((id, i) => ({ id, name: `Tag ${i}` }))
    render(
      <HashtagPicker
        selected={fiveIds}
        allHashtags={manyHashtags}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
      />
    )
    expect(screen.queryByRole('button', { name: /hashtag/i })).not.toBeInTheDocument()
  })

  it('clicking x on chip calls onRemove', () => {
    const onRemove = vi.fn()
    render(
      <HashtagPicker
        selected={['ht-1']}
        allHashtags={allHashtags}
        onAdd={vi.fn()}
        onRemove={onRemove}
      />
    )
    const removeBtn = screen.getByRole('button', { name: /xóa sáng tạo/i })
    fireEvent.click(removeBtn)
    expect(onRemove).toHaveBeenCalledWith('ht-1')
  })
})
