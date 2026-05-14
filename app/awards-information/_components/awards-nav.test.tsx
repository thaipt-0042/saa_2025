// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const mockScrollIntoView = vi.hoisted(() => vi.fn())
const mockIntersectionObserver = vi.hoisted(() =>
  vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
)

vi.mock('../../../lib/homepage/awards.config', () => ({
  AWARDS: [
    { slug: 'top-talent', title: 'Top Talent' },
    { slug: 'top-project', title: 'Top Project' },
    { slug: 'best-manager', title: 'Best Manager' },
  ],
}))

import { AwardsNav } from './awards-nav'

beforeEach(() => {
  window.HTMLElement.prototype.scrollIntoView = mockScrollIntoView
  window.IntersectionObserver = mockIntersectionObserver
  window.location.hash = ''
})

describe('AwardsNav', () => {
  it('renders nav with correct role and aria-label', () => {
    render(<AwardsNav />)
    const nav = screen.getByRole('navigation', { name: 'Danh mục giải thưởng' })
    expect(nav).toBeDefined()
  })

  it('renders all award titles as nav items', () => {
    render(<AwardsNav />)
    expect(screen.getByText('Top Talent')).toBeDefined()
    expect(screen.getByText('Top Project')).toBeDefined()
    expect(screen.getByText('Best Manager')).toBeDefined()
  })

  it('defaults to top-talent as active item (aria-current="true")', () => {
    render(<AwardsNav />)
    const activeItem = screen.getByText('Top Talent').closest('button')
    expect(activeItem?.getAttribute('aria-current')).toBe('true')
  })

  it('other items have aria-current="false"', () => {
    render(<AwardsNav />)
    const inactiveItem = screen.getByText('Top Project').closest('button')
    expect(inactiveItem?.getAttribute('aria-current')).toBe('false')
  })

  it('click on nav item sets it as active (aria-current="true")', () => {
    render(<AwardsNav />)
    const bestManagerBtn = screen.getByText('Best Manager').closest('button')!
    fireEvent.click(bestManagerBtn)
    expect(bestManagerBtn.getAttribute('aria-current')).toBe('true')
  })

  it('click on nav item calls scrollIntoView', () => {
    document.body.innerHTML = '<section id="top-project"></section>'
    render(<AwardsNav />)
    fireEvent.click(screen.getByText('Top Project').closest('button')!)
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
  })

  it('click on item with non-existent section does not throw', () => {
    render(<AwardsNav />)
    expect(() => {
      fireEvent.click(screen.getByText('Top Project').closest('button')!)
    }).not.toThrow()
  })
})
