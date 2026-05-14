// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => (
    <img alt={props.alt as string} src={props.src as string} />
  ),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      button: 'LOGIN With Google',
      errorMessage: 'Đăng nhập thất bại. Vui lòng thử lại.',
    }
    return map[key] ?? key
  },
}))

const mockSignInWithGoogle = vi.fn()
vi.mock('@/lib/auth/auth-service', () => ({
  signInWithGoogle: (...args: unknown[]) => mockSignInWithGoogle(...args),
}))
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({ auth: {} })),
}))

import { LoginPageClient } from './login-page-client'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('LoginPageClient', () => {
  it('renders the login button enabled initially', () => {
    render(<LoginPageClient hasError={false} />)
    expect(screen.getByRole('button', { name: 'Sign in with Google' })).not.toBeDisabled()
  })

  it('disables button while OAuth is pending', async () => {
    // signInWithGoogle never resolves — simulates navigation away
    mockSignInWithGoogle.mockReturnValue(new Promise(() => {}))
    render(<LoginPageClient hasError={false} />)
    await userEvent.click(screen.getByRole('button', { name: 'Sign in with Google' }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Sign in with Google' })).toBeDisabled(),
    )
  })

  it('re-enables button and shows error alert when signInWithGoogle returns error', async () => {
    mockSignInWithGoogle.mockResolvedValue({ error: new Error('network') })
    render(<LoginPageClient hasError={false} />)
    await userEvent.click(screen.getByRole('button', { name: 'Sign in with Google' }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'Sign in with Google' })).not.toBeDisabled()
  })

  it('shows error alert when hasError prop is true', () => {
    render(<LoginPageClient hasError={true} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('hides error alert when hasError prop is false', () => {
    render(<LoginPageClient hasError={false} />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
