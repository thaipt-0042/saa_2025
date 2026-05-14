import { describe, it, expect, vi, afterEach } from 'vitest'
import { isPrelaunchMode } from './event'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('isPrelaunchMode', () => {
  it('returns true when event datetime is in the future', () => {
    vi.stubEnv('NEXT_PUBLIC_EVENT_DATETIME', new Date(Date.now() + 3_600_000).toISOString())
    vi.stubEnv('NEXT_PUBLIC_PRELAUNCH_MODE', '')
    expect(isPrelaunchMode()).toBe(true)
  })

  it('returns false when event datetime is in the past', () => {
    vi.stubEnv('NEXT_PUBLIC_EVENT_DATETIME', new Date(Date.now() - 1000).toISOString())
    vi.stubEnv('NEXT_PUBLIC_PRELAUNCH_MODE', '')
    expect(isPrelaunchMode()).toBe(false)
  })

  it('returns false (fail-safe) when NEXT_PUBLIC_EVENT_DATETIME is undefined', () => {
    vi.stubEnv('NEXT_PUBLIC_EVENT_DATETIME', '')
    vi.stubEnv('NEXT_PUBLIC_PRELAUNCH_MODE', '')
    expect(isPrelaunchMode()).toBe(false)
  })

  it('returns false (fail-safe) when NEXT_PUBLIC_EVENT_DATETIME is malformed', () => {
    vi.stubEnv('NEXT_PUBLIC_EVENT_DATETIME', 'not-a-date')
    vi.stubEnv('NEXT_PUBLIC_PRELAUNCH_MODE', '')
    expect(isPrelaunchMode()).toBe(false)
  })

  it('returns true when NEXT_PUBLIC_PRELAUNCH_MODE=true (override)', () => {
    vi.stubEnv('NEXT_PUBLIC_EVENT_DATETIME', new Date(Date.now() - 1000).toISOString())
    vi.stubEnv('NEXT_PUBLIC_PRELAUNCH_MODE', 'true')
    expect(isPrelaunchMode()).toBe(true)
  })

  it('returns false when NEXT_PUBLIC_PRELAUNCH_MODE=false (override)', () => {
    vi.stubEnv('NEXT_PUBLIC_EVENT_DATETIME', new Date(Date.now() + 3_600_000).toISOString())
    vi.stubEnv('NEXT_PUBLIC_PRELAUNCH_MODE', 'false')
    expect(isPrelaunchMode()).toBe(false)
  })
})
