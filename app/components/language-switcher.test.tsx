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

  it('shows UK flag when currentLocale is "en"', () => {
    render(<LanguageSwitcher currentLocale="en" />)
    const trigger = screen.getByRole('button', { name: /select language/i })
    const flagImg = trigger.querySelector('img')
    expect(flagImg).not.toBeNull()
    expect(flagImg!.getAttribute('src')).toContain('flag-en.svg')
  })

  it('closes dropdown when clicking outside the component', async () => {
    render(
      <div>
        <LanguageSwitcher currentLocale="vi" />
        <button type="button">outside</button>
      </div>,
    )
    const trigger = screen.getByRole('button', { name: /select language/i })
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await userEvent.click(screen.getByRole('button', { name: /outside/i }))
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes dropdown and returns focus to trigger on Escape', async () => {
    render(<LanguageSwitcher currentLocale="vi" />)
    const trigger = screen.getByRole('button', { name: /select language/i })
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const listbox = screen.getByRole('listbox')
    await userEvent.type(listbox, '{Escape}')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(document.activeElement).toBe(trigger)
  })

  describe('keyboard navigation (US3)', () => {
    it('Enter on trigger opens dropdown and focuses first option', async () => {
      render(<LanguageSwitcher currentLocale="vi" />)
      const trigger = screen.getByRole('button', { name: /select language/i })
      trigger.focus()
      await userEvent.keyboard('{Enter}')
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      const options = screen.getAllByRole('option')
      expect(document.activeElement).toBe(options[0])
    })

    it('Space on trigger opens dropdown and focuses first option', async () => {
      render(<LanguageSwitcher currentLocale="vi" />)
      const trigger = screen.getByRole('button', { name: /select language/i })
      trigger.focus()
      await userEvent.keyboard(' ')
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      const options = screen.getAllByRole('option')
      expect(document.activeElement).toBe(options[0])
    })

    it('ArrowDown moves focus to next option', async () => {
      render(<LanguageSwitcher currentLocale="vi" />)
      const trigger = screen.getByRole('button', { name: /select language/i })
      trigger.focus()
      await userEvent.keyboard('{Enter}')
      const options = screen.getAllByRole('option')
      await userEvent.keyboard('{ArrowDown}')
      expect(document.activeElement).toBe(options[1])
    })

    it('ArrowUp moves focus to previous option', async () => {
      render(<LanguageSwitcher currentLocale="vi" />)
      const trigger = screen.getByRole('button', { name: /select language/i })
      trigger.focus()
      await userEvent.keyboard('{Enter}')
      const options = screen.getAllByRole('option')
      await userEvent.keyboard('{ArrowDown}')
      await userEvent.keyboard('{ArrowUp}')
      expect(document.activeElement).toBe(options[0])
    })

    it('Enter on focused option selects locale and closes dropdown', async () => {
      render(<LanguageSwitcher currentLocale="vi" />)
      const trigger = screen.getByRole('button', { name: /select language/i })
      trigger.focus()
      await userEvent.keyboard('{Enter}')
      await userEvent.keyboard('{ArrowDown}')
      await userEvent.keyboard('{Enter}')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      await waitFor(() => expect(mockRefresh).toHaveBeenCalledOnce())
      expect(document.cookie).toContain('lang=en')
    })

    it('Tab while open closes dropdown', async () => {
      render(<LanguageSwitcher currentLocale="vi" />)
      const trigger = screen.getByRole('button', { name: /select language/i })
      trigger.focus()
      await userEvent.keyboard('{Enter}')
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      await userEvent.keyboard('{Tab}')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })
  })
})
