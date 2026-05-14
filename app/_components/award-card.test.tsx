// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { AwardConfig } from '../../lib/homepage/awards.config'

vi.mock('next/image', () => ({
  default: ({ alt, fill: _fill, ...props }: { alt: string; fill?: boolean; [k: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [k: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

import { AwardCard } from './award-card'

const baseAward: AwardConfig = {
  slug: 'top-talent',
  title: 'Top Talent',
  description: 'Vinh danh những cá nhân xuất sắc.',
  imageBg: '/assets/homepage/images/award-bg.png',
  imageNameOverlay: '/assets/homepage/images/award-name-top-talent.png',
}

describe('AwardCard', () => {
  it('renders the award title', () => {
    render(<AwardCard award={baseAward} />)
    expect(screen.getByText('Top Talent')).toBeDefined()
  })

  it('renders the award description', () => {
    render(<AwardCard award={baseAward} />)
    expect(screen.getByText('Vinh danh những cá nhân xuất sắc.')).toBeDefined()
  })

  it('renders "Chi tiết" link with href=/awards-information#top-talent', () => {
    render(<AwardCard award={baseAward} />)
    const links = screen.getAllByRole('link')
    const chiTietLink = links.find((l) => l.getAttribute('href') === '/awards-information#top-talent')
    expect(chiTietLink).toBeDefined()
  })

  it('falls back to /awards-information when slug is undefined', () => {
    const noSlug = { ...baseAward, slug: '' }
    render(<AwardCard award={noSlug} />)
    const links = screen.getAllByRole('link')
    const chiTietLink = links.find((l) => l.getAttribute('href') === '/awards-information')
    expect(chiTietLink).toBeDefined()
  })

  it('renders the background image', () => {
    render(<AwardCard award={baseAward} />)
    const img = screen.getByAltText('Top Talent award')
    expect(img).toBeDefined()
  })

  it('description container has line-clamp-2 styling', () => {
    render(<AwardCard award={baseAward} />)
    const desc = screen.getByText('Vinh danh những cá nhân xuất sắc.')
    expect(desc.className).toContain('line-clamp-2')
  })

  it('renders arrow icon next to Chi tiết label', () => {
    render(<AwardCard award={baseAward} />)
    const arrowImg = screen.getByAltText('arrow')
    expect(arrowImg).toBeDefined()
  })
})
