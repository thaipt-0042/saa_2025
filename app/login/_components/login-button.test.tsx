// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginButton } from './login-button'

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={props.alt as string} src={props.src as string} />
  },
}))

describe('LoginButton', () => {
  it('renders with the provided label', () => {
    render(<LoginButton label="LOGIN With Google" onLogin={vi.fn()} isPending={false} />)
    expect(screen.getByText('LOGIN With Google')).toBeInTheDocument()
  })

  it('renders Google icon image', () => {
    render(<LoginButton label="LOGIN With Google" onLogin={vi.fn()} isPending={false} />)
    const img = screen.getByAltText('Google')
    expect(img).toBeInTheDocument()
  })

  it('calls onLogin when clicked', async () => {
    const onLogin = vi.fn()
    render(<LoginButton label="LOGIN With Google" onLogin={onLogin} isPending={false} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onLogin).toHaveBeenCalledOnce()
  })

  it('has aria-label "Sign in with Google"', () => {
    render(<LoginButton label="LOGIN With Google" onLogin={vi.fn()} isPending={false} />)
    expect(screen.getByRole('button', { name: 'Sign in with Google' })).toBeInTheDocument()
  })

  it('is disabled when isPending is true', () => {
    render(<LoginButton label="LOGIN With Google" onLogin={vi.fn()} isPending={true} />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('does not call onLogin when disabled', async () => {
    const onLogin = vi.fn()
    render(<LoginButton label="LOGIN With Google" onLogin={onLogin} isPending={true} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onLogin).not.toHaveBeenCalled()
  })
})
