// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { User } from '@supabase/supabase-js'

const mockSignOut = vi.fn().mockResolvedValue({ error: null })
const mockPush = vi.fn()

vi.mock('../../lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: { signOut: mockSignOut },
  })),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

import { AccountDropdown } from './account-dropdown'

const mockUser = { id: 'user-1', email: 'test@example.com' } as User

describe('AccountDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders trigger button', () => {
    render(<AccountDropdown user={mockUser} role="user" />)
    expect(screen.getByRole('button')).toBeDefined()
  })

  it('shows Profile and Sign out for all authenticated users', () => {
    render(<AccountDropdown user={mockUser} role="user" />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('Profile')).toBeDefined()
    expect(screen.getByText('Sign out')).toBeDefined()
  })

  it('shows Admin Dashboard only when role is admin', () => {
    render(<AccountDropdown user={mockUser} role="admin" />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('Admin Dashboard')).toBeDefined()
  })

  it('does not show Admin Dashboard when role is user', () => {
    render(<AccountDropdown user={mockUser} role="user" />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.queryByText('Admin Dashboard')).toBeNull()
  })

  it('closes dropdown on Escape keydown', () => {
    render(<AccountDropdown user={mockUser} role="user" />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('Profile')).toBeDefined()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByText('Profile')).toBeNull()
  })

  it('calls signOut and navigates to /login on sign-out click', async () => {
    render(<AccountDropdown user={mockUser} role="user" />)
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByText('Sign out'))
    await vi.waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  it('aria-expanded is false initially, true after open', () => {
    render(<AccountDropdown user={mockUser} role="user" />)
    const btn = screen.getByRole('button')
    expect(btn.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(btn)
    expect(btn.getAttribute('aria-expanded')).toBe('true')
  })
})
