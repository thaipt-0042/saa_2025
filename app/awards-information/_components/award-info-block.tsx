import Image from 'next/image'
import type { AwardConfig } from '../../../lib/homepage/awards.config'

interface AwardInfoBlockProps {
  award: AwardConfig
}

export function AwardInfoBlock({ award }: AwardInfoBlockProps) {
  const { slug, title, description, imageBg, quantity, unit, value, valueLabel } = award

  const values = Array.isArray(value) ? value : value ? [value] : []
  const labels = Array.isArray(valueLabel) ? valueLabel : valueLabel ? [valueLabel] : []

  return (
    <section
      id={slug}
      style={{ scrollMarginTop: '96px' }}
    >
      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        <div style={{ flexShrink: 0, width: '160px', height: '160px', position: 'relative' }}>
          <Image
            src={imageBg}
            alt={title}
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>

        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: 'var(--font-montserrat)', fontWeight: 700, marginBottom: '8px' }}>
            {title}
          </h2>
          <p style={{ marginBottom: '16px', color: 'var(--color-text-secondary)' }}>{description}</p>

          {quantity && (
            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: 700, fontSize: '1.5rem' }}>{quantity}</span>
              {unit && (
                <span style={{ marginLeft: '8px', color: 'var(--color-text-secondary)' }}>{unit}</span>
              )}
            </div>
          )}

          {values.map((v, i) => (
            <div key={i} style={{ marginBottom: '4px' }}>
              <span style={{ fontWeight: 700, color: 'var(--color-cta-primary)' }}>{v}</span>
              {labels[i] && (
                <span style={{ marginLeft: '8px', color: 'var(--color-text-secondary)' }}>
                  {labels[i]}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
