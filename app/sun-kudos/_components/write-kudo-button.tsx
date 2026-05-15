'use client'

interface WriteKudoButtonProps {
  onClick: () => void
}

export function WriteKudoButton({ onClick }: WriteKudoButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '12px 24px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: 'var(--color-cta-primary)',
        color: 'var(--color-cta-text)',
        fontSize: '15px',
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      Viết Kudo
    </button>
  )
}
