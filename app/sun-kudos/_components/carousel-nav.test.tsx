// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CarouselNav } from './carousel-nav'

describe('CarouselNav', () => {
  it('renders current/total as "2/5"', () => {
    render(<CarouselNav current={2} total={5} onPrev={vi.fn()} onNext={vi.fn()} />)
    expect(screen.getByText('2/5')).toBeDefined()
  })

  it('prev button is disabled when current === 1', () => {
    render(<CarouselNav current={1} total={5} onPrev={vi.fn()} onNext={vi.fn()} />)
    const buttons = screen.getAllByRole('button')
    const prevBtn = buttons[0]
    expect(prevBtn.hasAttribute('disabled')).toBe(true)
  })

  it('next button is disabled when current === total', () => {
    render(<CarouselNav current={5} total={5} onPrev={vi.fn()} onNext={vi.fn()} />)
    const buttons = screen.getAllByRole('button')
    const nextBtn = buttons[1]
    expect(nextBtn.hasAttribute('disabled')).toBe(true)
  })

  it('clicking prev calls onPrev', () => {
    const onPrev = vi.fn()
    render(<CarouselNav current={3} total={5} onPrev={onPrev} onNext={vi.fn()} />)
    fireEvent.click(screen.getAllByRole('button')[0])
    expect(onPrev).toHaveBeenCalledTimes(1)
  })

  it('clicking next calls onNext', () => {
    const onNext = vi.fn()
    render(<CarouselNav current={3} total={5} onPrev={vi.fn()} onNext={onNext} />)
    fireEvent.click(screen.getAllByRole('button')[1])
    expect(onNext).toHaveBeenCalledTimes(1)
  })
})
