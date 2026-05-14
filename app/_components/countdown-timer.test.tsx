// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, cleanup } from '@testing-library/react'
import { CountdownTimer } from './countdown-timer'

describe('CountdownTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.unstubAllEnvs()
  })

  it('renders DAYS, HOURS, MINUTES labels', () => {
    vi.stubEnv('NEXT_PUBLIC_EVENT_DATETIME', new Date(Date.now() + 90061000).toISOString())
    render(<CountdownTimer />)

    expect(screen.getByText('DAYS')).toBeDefined()
    expect(screen.getByText('HOURS')).toBeDefined()
    expect(screen.getByText('MINUTES')).toBeDefined()
  })

  it('zero-pads single-digit values to 2 digits', () => {
    // 5 minutes in the future → 00 days, 00 hours, 05 minutes
    vi.stubEnv('NEXT_PUBLIC_EVENT_DATETIME', new Date(Date.now() + 5 * 60 * 1000).toISOString())
    render(<CountdownTimer />)

    // All digit tiles: 0,0 for days; 0,0 for hours; 0,5 for minutes
    const tiles = screen.getAllByTestId('digit-tile')
    // minutes tens = "0", minutes units = "5"
    expect(tiles[4].textContent).toBe('0')
    expect(tiles[5].textContent).toBe('5')
  })

  it('shows 00 00 00 when event datetime is in the past', () => {
    vi.stubEnv('NEXT_PUBLIC_EVENT_DATETIME', new Date(Date.now() - 1000).toISOString())
    render(<CountdownTimer />)

    const tiles = screen.getAllByTestId('digit-tile')
    tiles.forEach((tile) => {
      expect(tile.textContent).toBe('0')
    })
  })

  it('shows 00 00 00 when NEXT_PUBLIC_EVENT_DATETIME is invalid', () => {
    vi.stubEnv('NEXT_PUBLIC_EVENT_DATETIME', 'not-a-date')
    render(<CountdownTimer />)

    const tiles = screen.getAllByTestId('digit-tile')
    tiles.forEach((tile) => {
      expect(tile.textContent).toBe('0')
    })
  })

  it('shows 00 00 00 when NEXT_PUBLIC_EVENT_DATETIME is absent', () => {
    vi.stubEnv('NEXT_PUBLIC_EVENT_DATETIME', '')
    render(<CountdownTimer />)

    const tiles = screen.getAllByTestId('digit-tile')
    tiles.forEach((tile) => {
      expect(tile.textContent).toBe('0')
    })
  })

  it('shows "Comming soon" label (double-m) when event has not started', () => {
    vi.stubEnv('NEXT_PUBLIC_EVENT_DATETIME', new Date(Date.now() + 3600000).toISOString())
    render(<CountdownTimer />)

    expect(screen.getByText('Comming soon')).toBeDefined()
  })

  it('hides "Comming soon" label when event has started', () => {
    vi.stubEnv('NEXT_PUBLIC_EVENT_DATETIME', new Date(Date.now() - 1000).toISOString())
    render(<CountdownTimer />)

    expect(screen.queryByText('Comming soon')).toBeNull()
  })

  it('decrements minutes after 60 seconds', () => {
    // 2 minutes in the future
    vi.stubEnv('NEXT_PUBLIC_EVENT_DATETIME', new Date(Date.now() + 2 * 60 * 1000).toISOString())
    render(<CountdownTimer />)

    const tilesBefore = screen.getAllByTestId('digit-tile')
    expect(tilesBefore[5].textContent).toBe('2')

    act(() => { vi.advanceTimersByTime(60_000) })

    const tilesAfter = screen.getAllByTestId('digit-tile')
    expect(tilesAfter[5].textContent).toBe('1')
  })

  it('clears interval on unmount (no memory leak)', () => {
    vi.stubEnv('NEXT_PUBLIC_EVENT_DATETIME', new Date(Date.now() + 3600000).toISOString())
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval')

    const { unmount } = render(<CountdownTimer />)
    unmount()

    expect(clearIntervalSpy).toHaveBeenCalled()
  })

  // Patch 1 — accessibility
  it('has role="timer" on the countdown container', () => {
    vi.stubEnv('NEXT_PUBLIC_EVENT_DATETIME', new Date(Date.now() + 3600000).toISOString())
    render(<CountdownTimer />)

    expect(screen.getByRole('timer')).toBeDefined()
  })

  it('has aria-live="polite" on the countdown container', () => {
    vi.stubEnv('NEXT_PUBLIC_EVENT_DATETIME', new Date(Date.now() + 3600000).toISOString())
    const { container } = render(<CountdownTimer />)

    const timer = container.querySelector('[aria-live="polite"]')
    expect(timer).not.toBeNull()
  })

  it('has aria-label on each countdown unit reflecting current value', () => {
    // 1 day, 2 hours, 3 minutes from now
    const target = new Date(Date.now() + (1 * 86400 + 2 * 3600 + 3 * 60) * 1000)
    vi.stubEnv('NEXT_PUBLIC_EVENT_DATETIME', target.toISOString())
    render(<CountdownTimer />)

    expect(screen.getByLabelText('1 days')).toBeDefined()
    expect(screen.getByLabelText('2 hours')).toBeDefined()
    expect(screen.getByLabelText('3 minutes')).toBeDefined()
  })

  // Patch 2 — DAYS cap at 99
  it('caps DAYS display at 99 when computed value >= 100', () => {
    // 100 days + 1 hour from now
    const target = new Date(Date.now() + (100 * 86400 + 3600) * 1000)
    vi.stubEnv('NEXT_PUBLIC_EVENT_DATETIME', target.toISOString())
    render(<CountdownTimer />)

    const tiles = screen.getAllByTestId('digit-tile')
    // DAYS tiles are [0] and [1]: should show "9" and "9" (capped at 99)
    expect(tiles[0].textContent).toBe('9')
    expect(tiles[1].textContent).toBe('9')
  })
})
