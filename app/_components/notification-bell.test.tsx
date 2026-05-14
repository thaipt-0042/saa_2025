// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import type { User } from '@supabase/supabase-js'

const mockFetch = vi.fn()
global.fetch = mockFetch

vi.mock('../_components/notification-panel', () => ({
  NotificationPanel: ({ open }: { open: boolean }) =>
    open ? <div data-testid="notification-panel" /> : null,
}))

import { NotificationBell } from './notification-bell'

const mockUser = { id: 'user-1', email: 'test@example.com' } as User

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when user is null', () => {
    const { container } = render(<NotificationBell user={null as unknown as User} />)
    expect(container.firstChild).toBeNull()
  })

  it('shows badge when unreadCount > 0', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ count: 3 }) })
    await act(async () => { render(<NotificationBell user={mockUser} />) })
    await waitFor(() => {
      expect(screen.getByTestId('notification-badge')).toBeDefined()
    })
  })

  it('hides badge when unreadCount is 0', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ count: 0 }) })
    await act(async () => { render(<NotificationBell user={mockUser} />) })
    await waitFor(() => {
      expect(screen.queryByTestId('notification-badge')).toBeNull()
    })
  })

  it('hides badge while loading (count is null)', async () => {
    mockFetch.mockReturnValue(new Promise(() => {})) // never resolves
    render(<NotificationBell user={mockUser} />)
    expect(screen.queryByTestId('notification-badge')).toBeNull()
  })
})
