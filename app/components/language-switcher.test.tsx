// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => (
    <img alt={props.alt as string} src={props.src as string} />
  ),
}))

const mockRefresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = { selectLabel: 'Select language' }
    return map[key] ?? key
  },
}))

import { LanguageSwitcher } from './language-switcher'

beforeEach(() => {
  vi.clearAllMocks()
  document.cookie = ''
})

describe('LanguageSwitcher', () => {
  it('renders current locale label', () => {
    render(<LanguageSwitcher currentLocale="vi" />)
    expect(screen.getByText('VN')).toBeInTheDocument()
  })

  it('has aria-label="Select language"', () => {
    render(<LanguageSwitcher currentLocale="vi" />)
    expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument()
  })

  it('toggles aria-expanded on click', async () => {
    render(<LanguageSwitcher currentLocale="vi" />)
    const trigger = screen.getByRole('button', { name: /select language/i })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('opens dropdown listing available locales', async () => {
    render(<LanguageSwitcher currentLocale="vi" />)
    await userEvent.click(screen.getByRole('button', { name: /select language/i }))
    expect(screen.getByRole('option', { name: /english/i })).toBeInTheDocument()
  })

  it('writes lang cookie and calls router.refresh() on locale select', async () => {
    render(<LanguageSwitcher currentLocale="vi" />)
    await userEvent.click(screen.getByRole('button', { name: /select language/i }))
    await userEvent.click(screen.getByRole('option', { name: /english/i }))
    await waitFor(() => expect(mockRefresh).toHaveBeenCalledOnce())
    expect(document.cookie).toContain('lang=en')
  })
})
