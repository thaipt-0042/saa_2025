import Image from 'next/image'
import Link from 'next/link'
import type { AwardConfig } from '../../lib/homepage/awards.config'

interface AwardCardProps {
  award: AwardConfig
}

export function AwardCard({ award }: AwardCardProps) {
  const { slug, title, description, imageBg, imageNameOverlay } = award
  const href = slug ? `/awards-information#${slug}` : '/awards-information'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        width: 336,
      }}
    >
      {/* Card image */}
      <div
        style={{
          position: 'relative',
          width: 336,
          height: 336,
          borderRadius: 24,
          border: '1px solid var(--color-cta-primary)',
          boxShadow: '0 0 24px var(--color-card-glow)',
          overflow: 'hidden',
        }}
      >
        <Image
          src={imageBg}
          alt={`${title} award`}
          fill
          style={{ objectFit: 'cover', mixBlendMode: 'screen' }}
          sizes="336px"
          loading="lazy"
        />
        <Image
          src={imageNameOverlay}
          alt=""
          fill
          style={{ objectFit: 'contain' }}
          sizes="336px"
          loading="lazy"
          aria-hidden="true"
        />
      </div>

      {/* Title */}
      <p
        style={{
          margin: 0,
          fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
          fontSize: 24,
          fontWeight: 400,
          color: 'var(--color-cta-primary)',
        }}
      >
        {title}
      </p>

      {/* Description */}
      <p
        className="line-clamp-2"
        style={{
          margin: 0,
          fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
          fontSize: 16,
          fontWeight: 400,
          color: '#fff',
          overflow: 'hidden',
        }}
      >
        {description}
      </p>

      {/* Chi tiết CTA */}
      <Link
        href={href}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          paddingTop: 4,
          paddingBottom: 4,
          fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
          fontSize: 16,
          fontWeight: 500,
          color: '#fff',
          textDecoration: 'none',
        }}
      >
        Chi tiết
        <Image
          src="/assets/homepage/icons/arrow-up.svg"
          alt="arrow"
          width={24}
          height={24}
        />
      </Link>
    </div>
  )
}
