interface WriteKudoTriggerProps {
  onClick: () => void
}

export function WriteKudoTrigger({ onClick }: WriteKudoTriggerProps) {
  return (
    <button
      role="button"
      aria-label="Gửi lời cảm ơn đến đồng nghiệp"
      onClick={onClick}
      className="flex items-center gap-3 w-full rounded-2xl border px-4 py-3 text-left transition-colors" style={{ backgroundColor: 'rgba(11, 15, 18, 0.6)', borderColor: 'var(--color-divider)', color: 'var(--color-cta-primary)' }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(11, 15, 18, 0.8)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(11, 15, 18, 0.6)')}
    >
      <span className="text-sm">Gửi lời cảm ơn...</span>
    </button>
  )
}
