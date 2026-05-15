// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('isomorphic-dompurify', () => ({
  default: { sanitize: (s: string) => s },
}))
vi.mock('./use-kudo-form', () => ({
  useKudoForm: () => ({
    recipient: null,
    content: '',
    hashtags: [],
    imageUrls: [],
    isAnonymous: false,
    anonymousName: '',
    isSubmitting: false,
    submitError: null,
    fieldErrors: {},
    isFormValid: false,
    setRecipient: vi.fn(),
    setContent: vi.fn(),
    setHashtags: vi.fn(),
    setImageUrls: vi.fn(),
    setIsAnonymous: vi.fn(),
    setAnonymousName: vi.fn(),
    setSubmitError: vi.fn(),
    handleSubmit: vi.fn(),
    reset: vi.fn(),
  }),
}))

import { WriteKudoModal } from './write-kudo-modal'

describe('WriteKudoModal', () => {
  it('renders dialog with aria-modal when open=true', () => {
    render(<WriteKudoModal open={true} onClose={vi.fn()} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('does not render when open=false', () => {
    render(<WriteKudoModal open={false} onClose={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('calls onClose when Hủy button is clicked', () => {
    const onClose = vi.fn()
    render(<WriteKudoModal open={true} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /hủy/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn()
    render(<WriteKudoModal open={true} onClose={onClose} />)
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('submit button is disabled when isFormValid=false', () => {
    render(<WriteKudoModal open={true} onClose={vi.fn()} />)
    const submitBtn = screen.getByRole('button', { name: /gửi/i })
    expect(submitBtn).toBeDisabled()
  })
})
