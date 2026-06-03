// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FilterBar } from './filter-bar'

const hashtags = [
  { id: 'h1', name: 'teamwork' },
  { id: 'h2', name: 'innovation' },
]
const departments = ['Engineering', 'Design']

describe('FilterBar', () => {
  it('renders hashtag dropdown with all options', () => {
    render(<FilterBar filters={{ hashtagId: null, department: null }} onFilterChange={vi.fn()} hashtags={hashtags} departments={departments} />)
    expect(screen.getByText('#teamwork')).toBeDefined()
    expect(screen.getByText('#innovation')).toBeDefined()
  })

  it('renders department dropdown with all options', () => {
    render(<FilterBar filters={{ hashtagId: null, department: null }} onFilterChange={vi.fn()} hashtags={hashtags} departments={departments} />)
    expect(screen.getByText('Engineering')).toBeDefined()
    expect(screen.getByText('Design')).toBeDefined()
  })

  it('calls onFilterChange with hashtagId when hashtag selected', () => {
    const onFilterChange = vi.fn()
    render(<FilterBar filters={{ hashtagId: null, department: null }} onFilterChange={onFilterChange} hashtags={hashtags} departments={departments} />)
    const selects = screen.getAllByRole('combobox')
    fireEvent.change(selects[0], { target: { value: 'h1' } })
    expect(onFilterChange).toHaveBeenCalledWith({ hashtagId: 'h1' })
  })

  it('calls onFilterChange with department when dept selected', () => {
    const onFilterChange = vi.fn()
    render(<FilterBar filters={{ hashtagId: null, department: null }} onFilterChange={onFilterChange} hashtags={hashtags} departments={departments} />)
    const selects = screen.getAllByRole('combobox')
    fireEvent.change(selects[1], { target: { value: 'Engineering' } })
    expect(onFilterChange).toHaveBeenCalledWith({ department: 'Engineering' })
  })

  it('calls onFilterChange with null when "Tất cả" is selected', () => {
    const onFilterChange = vi.fn()
    render(<FilterBar filters={{ hashtagId: 'h1', department: null }} onFilterChange={onFilterChange} hashtags={hashtags} departments={departments} />)
    const selects = screen.getAllByRole('combobox')
    fireEvent.change(selects[0], { target: { value: '' } })
    expect(onFilterChange).toHaveBeenCalledWith({ hashtagId: null })
  })
})
