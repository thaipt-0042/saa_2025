// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorAlert } from './error-alert'

const mockReplace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ErrorAlert', () => {
  it('renders the error message', () => {
    render(<ErrorAlert message="Đăng nhập thất bại. Vui lòng thử lại." />)
    expect(screen.getByText('Đăng nhập thất bại. Vui lòng thử lại.')).toBeInTheDocument()
  })

  it('has role="alert" for screen readers', () => {
    render(<ErrorAlert message="Error message" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders a dismiss button', () => {
    render(<ErrorAlert message="Error" />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('calls router.replace("/login") when dismiss is clicked', async () => {
    render(<ErrorAlert message="Error" />)
    await userEvent.click(screen.getByRole('button'))
    expect(mockReplace).toHaveBeenCalledWith('/login')
  })
})
