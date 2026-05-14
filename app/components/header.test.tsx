// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { User } from '@supabase/supabase-js'

vi.mock('next/image', () => ({
  default: ({ alt, ...props }: { alt: string; [k: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [k: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

vi.mock('./language-switcher', () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher" />,
}))

vi.mock('../_components/notification-bell', () => ({
  NotificationBell: ({ user }: { user: User | null }) =>
    user ? <div data-testid="notification-bell" /> : null,
}))

vi.mock('../_components/account-dropdown', () => ({
  AccountDropdown: ({ user }: { user: User | null }) =>
    user ? <div data-testid="account-dropdown" /> : null,
}))

import { Header } from './header'

describe('Header', () => {
  it('renders "About SAA 2025" nav link href="/"', () => {
    render(<Header currentLocale="vi" currentPath="/" />)
    const links = screen.getAllByRole('link')
    const link = links.find((l) => l.getAttribute('href') === '/')
    expect(link).toBeDefined()
  })

  it('renders "Awards Information" nav link href="/awards-information"', () => {
    render(<Header currentLocale="vi" currentPath="/" />)
    const links = screen.getAllByRole('link')
    const link = links.find((l) => l.getAttribute('href') === '/awards-information')
    expect(link).toBeDefined()
  })

  it('renders "Sun* Kudos" nav link href="/sun-kudos"', () => {
    render(<Header currentLocale="vi" currentPath="/" />)
    const links = screen.getAllByRole('link')
    const link = links.find((l) => l.getAttribute('href') === '/sun-kudos')
    expect(link).toBeDefined()
  })

  it('marks the nav link matching currentPath as active', () => {
    render(<Header currentLocale="vi" currentPath="/" />)
    const links = screen.getAllByRole('link')
    const homeLink = links.find((l) => l.getAttribute('href') === '/')
    expect(homeLink?.getAttribute('data-active')).toBe('true')
  })

  it('does not render notification bell or account dropdown when user is null', () => {
    render(<Header currentLocale="vi" currentPath="/" user={null} />)
    expect(screen.queryByTestId('notification-bell')).toBeNull()
    expect(screen.queryByTestId('account-dropdown')).toBeNull()
  })

  it('renders notification bell and account dropdown when user is provided', () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' } as User
    render(<Header currentLocale="vi" currentPath="/" user={mockUser} role="user" />)
    expect(screen.getByTestId('notification-bell')).toBeDefined()
    expect(screen.getByTestId('account-dropdown')).toBeDefined()
  })
})
