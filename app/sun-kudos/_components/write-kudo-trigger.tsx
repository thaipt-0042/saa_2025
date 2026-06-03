interface WriteKudoTriggerProps {
  onClick: () => void
}

export function WriteKudoTrigger({ onClick }: WriteKudoTriggerProps) {
  return (
    <button
      role="button"
      aria-label="Gửi lời cảm ơn đến đồng nghiệp"
      onClick={onClick}
      className="flex items-center gap-3 w-full rounded-2xl bg-white border border-gray-200 px-4 py-3 text-left text-gray-400 hover:bg-gray-50 transition-colors"
    >
      <span className="text-sm">Gửi lời cảm ơn...</span>
    </button>
  )
}
