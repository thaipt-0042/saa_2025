import { AWARDS } from '../../lib/homepage/awards.config'
import { AwardCard } from './award-card'

export function AwardGrid() {
  return (
    <section style={{ padding: '80px 144px' }}>
      {/* Section header */}
      <div style={{ marginBottom: 48 }}>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
            fontSize: 24,
            fontWeight: 700,
            color: '#fff',
          }}
        >
          Sun* annual awards 2025
        </p>
        <div
          style={{
            width: 80,
            height: 2,
            backgroundColor: 'var(--color-divider)',
            margin: '8px 0 12px',
          }}
        />
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
            fontSize: 57,
            fontWeight: 700,
            color: 'var(--color-cta-primary)',
          }}
        >
          Hệ thống giải thưởng
        </p>
      </div>

      {/* Award cards grid */}
      <div
        className="grid grid-cols-2 lg:grid-cols-3"
        style={{ gap: 80 }}
      >
        {AWARDS.map((award) => (
          <AwardCard key={award.slug} award={award} />
        ))}
      </div>
    </section>
  )
}
