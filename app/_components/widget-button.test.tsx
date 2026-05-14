// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WidgetButton } from './widget-button'

describe('WidgetButton', () => {
  it('is present in the DOM on mount', () => {
    render(<WidgetButton />)
    expect(screen.getByRole('button')).toBeDefined()
  })

  it('has fixed CSS positioning', () => {
    const { container } = render(<WidgetButton />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper?.className).toContain('fixed')
  })

  it('open state is false initially (menu not shown)', () => {
    render(<WidgetButton />)
    expect(screen.queryByTestId('widget-menu')).toBeNull()
  })

  it('click toggles open to true (menu appears)', () => {
    render(<WidgetButton />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByTestId('widget-menu')).toBeDefined()
  })

  it('click again toggles open to false (menu disappears)', () => {
    render(<WidgetButton />)
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByRole('button'))
    expect(screen.queryByTestId('widget-menu')).toBeNull()
  })
})
