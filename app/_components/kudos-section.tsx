import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export async function KudosSection() {
  const t = await getTranslations('homepage')

  return (
    <section
      style={{
        position: 'relative',
        width: 1120,
        height: 500,
        margin: '0 auto',
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      {/* Background image */}
      <Image
        src="/assets/homepage/images/kudos-bg.png"
        alt=""
        fill
        loading="lazy"
        style={{ objectFit: 'cover' }}
        sizes="1120px"
        aria-hidden="true"
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 24,
          padding: '40px 80px',
        }}
      >
        {/* Kudos logo */}
        <Image
          src="/assets/homepage/logos/kudos-logo.svg"
          alt="Sun* Kudos"
          width={364}
          height={72}
        />

        {/* Description */}
        <p
          style={{
            fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
            fontSize: 16,
            fontWeight: 400,
            color: '#fff',
            textAlign: 'center',
            margin: 0,
          }}
        >
          {t('kudos.description')}
        </p>

        {/* CTA */}
        <Link
          href="/sun-kudos"
          aria-label="Xem chi tiết Sun* Kudos"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 126,
            height: 56,
            borderRadius: 4,
            backgroundColor: 'var(--color-cta-primary)',
            fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
            fontSize: 16,
            fontWeight: 500,
            color: 'var(--color-cta-text)',
            textDecoration: 'none',
          }}
        >
          {t('kudos.chiTiet')}
        </Link>
      </div>
    </section>
  )
}
