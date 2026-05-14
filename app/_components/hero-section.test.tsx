// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'

vi.mock('next-intl/server', () => ({
  getTranslations: () => Promise.resolve((key: string) => key),
}))

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

vi.mock('./countdown-timer', () => ({
  CountdownTimer: () => <div data-testid="countdown-timer" />,
}))

import { HeroSection } from './hero-section'

async function renderHero() {
  const jsx = await HeroSection()
  let container!: ReturnType<typeof render>
  await act(async () => { container = render(jsx) })
  return container
}

describe('HeroSection', () => {
  it('renders ABOUT AWARDS CTA linking to /awards-information', async () => {
    await renderHero()
    const links = screen.getAllByRole('link')
    const awardsLink = links.find((l) => l.getAttribute('href') === '/awards-information')
    expect(awardsLink).toBeDefined()
  })

  it('renders ABOUT KUDOS CTA linking to /sun-kudos', async () => {
    await renderHero()
    const links = screen.getAllByRole('link')
    const kudosLink = links.find((l) => l.getAttribute('href') === '/sun-kudos')
    expect(kudosLink).toBeDefined()
  })

  it('renders the CountdownTimer component', async () => {
    await renderHero()
    expect(screen.getByTestId('countdown-timer')).toBeDefined()
  })

  it('renders hero keyvisual image', async () => {
    await renderHero()
    expect(screen.getByAltText('SAA 2025 keyvisual')).toBeDefined()
  })
})
