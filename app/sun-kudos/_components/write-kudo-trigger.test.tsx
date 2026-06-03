// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WriteKudoTrigger } from './write-kudo-trigger'

describe('WriteKudoTrigger', () => {
  it('renders with placeholder text', () => {
    render(<WriteKudoTrigger onClick={vi.fn()} />)
    expect(screen.getByText(/gửi lời cảm ơn/i)).toBeDefined()
  })

  it('has role="button" and aria-label', () => {
    render(<WriteKudoTrigger onClick={vi.fn()} />)
    const btn = screen.getByRole('button')
    expect(btn).toBeDefined()
    expect(btn.getAttribute('aria-label')).toBeTruthy()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<WriteKudoTrigger onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
