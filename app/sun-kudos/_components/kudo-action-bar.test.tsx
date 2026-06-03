// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { KudoActionBar } from './kudo-action-bar'

describe('KudoActionBar', () => {
  it('displays like count', () => {
    render(<KudoActionBar likeCount={12} likedByCurrentUser={false} onLike={vi.fn()} disabled={false} />)
    expect(screen.getByText('12')).toBeDefined()
  })

  it('heart button is filled when likedByCurrentUser is true', () => {
    render(<KudoActionBar likeCount={5} likedByCurrentUser={true} onLike={vi.fn()} disabled={false} />)
    const btn = screen.getByRole('button')
    expect(btn.getAttribute('aria-pressed')).toBe('true')
  })

  it('heart button is not filled when likedByCurrentUser is false', () => {
    render(<KudoActionBar likeCount={5} likedByCurrentUser={false} onLike={vi.fn()} disabled={false} />)
    const btn = screen.getByRole('button')
    expect(btn.getAttribute('aria-pressed')).toBe('false')
  })

  it('calls onLike when heart button is clicked', () => {
    const onLike = vi.fn()
    render(<KudoActionBar likeCount={3} likedByCurrentUser={false} onLike={onLike} disabled={false} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onLike).toHaveBeenCalledTimes(1)
  })

  it('heart button is disabled when disabled prop is true', () => {
    render(<KudoActionBar likeCount={0} likedByCurrentUser={false} onLike={vi.fn()} disabled={true} />)
    const btn = screen.getByRole('button')
    expect(btn.hasAttribute('disabled')).toBe(true)
  })
})
