import { getTranslations } from 'next-intl/server'

export async function Footer() {
  const t = await getTranslations('footer')

  return (
    <footer
      className="flex items-center justify-between"
      style={{
        padding: '40px 90px',
        borderTop: '1px solid var(--color-divider)',
        fontFamily: 'var(--font-montserrat-alt), "Montserrat Alternates", sans-serif',
        fontWeight: 700,
        fontSize: 16,
        lineHeight: '24px',
        color: '#fff',
      }}
    >
      <p>{t('copyright')}</p>
    </footer>
  )
}
