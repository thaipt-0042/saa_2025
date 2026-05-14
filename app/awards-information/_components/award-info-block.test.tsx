// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { AwardConfig } from '../../../lib/homepage/awards.config'

vi.mock('next/image', () => ({
  default: ({ alt, fill: _fill, ...props }: { alt: string; fill?: boolean; [k: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}))

import { AwardInfoBlock } from './award-info-block'

const baseAward: AwardConfig = {
  slug: 'top-talent',
  title: 'Top Talent',
  description: 'Vinh danh những cá nhân xuất sắc.',
  imageBg: '/assets/homepage/images/award-bg.png',
  imageNameOverlay: '/assets/homepage/images/award-name-top-talent.png',
  quantity: '10',
  unit: 'Đơn vị',
  value: '7.000.000 VNĐ',
  valueLabel: 'cho mỗi giải thưởng',
}

const signatureAward: AwardConfig = {
  slug: 'signature-2025-creator',
  title: 'Signature 2025 - Creator',
  description: 'Tôn vinh những cá nhân sáng tạo.',
  imageBg: '/assets/homepage/images/award-bg.png',
  imageNameOverlay: '/assets/homepage/images/award-name-signature-2025-creator.png',
  quantity: '01',
  unit: '',
  value: ['5.000.000 VNĐ', '8.000.000 VNĐ'],
  valueLabel: ['cá nhân', 'tập thể'],
}

describe('AwardInfoBlock', () => {
  it('renders the award title', () => {
    render(<AwardInfoBlock award={baseAward} />)
    expect(screen.getByText('Top Talent')).toBeDefined()
  })

  it('renders the award description', () => {
    render(<AwardInfoBlock award={baseAward} />)
    expect(screen.getByText('Vinh danh những cá nhân xuất sắc.')).toBeDefined()
  })

  it('renders quantity and unit', () => {
    render(<AwardInfoBlock award={baseAward} />)
    expect(screen.getByText('10')).toBeDefined()
    expect(screen.getByText('Đơn vị')).toBeDefined()
  })

  it('renders single value and valueLabel', () => {
    render(<AwardInfoBlock award={baseAward} />)
    expect(screen.getByText('7.000.000 VNĐ')).toBeDefined()
    expect(screen.getByText('cho mỗi giải thưởng')).toBeDefined()
  })

  it('renders multi-value for Signature 2025', () => {
    render(<AwardInfoBlock award={signatureAward} />)
    expect(screen.getByText('5.000.000 VNĐ')).toBeDefined()
    expect(screen.getByText('8.000.000 VNĐ')).toBeDefined()
    expect(screen.getByText('cá nhân')).toBeDefined()
    expect(screen.getByText('tập thể')).toBeDefined()
  })

  it('renders with id equal to slug (anchor target)', () => {
    const { container } = render(<AwardInfoBlock award={baseAward} />)
    const section = container.querySelector('#top-talent')
    expect(section).toBeDefined()
    expect(section).not.toBeNull()
  })

  it('renders award image with correct alt text', () => {
    render(<AwardInfoBlock award={baseAward} />)
    const img = screen.getByAltText('Top Talent')
    expect(img).toBeDefined()
  })
})
