'use client'

import { useRouter } from 'next/navigation'

interface ErrorAlertProps {
  message: string
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  const router = useRouter()

  function handleDismiss() {
    router.replace('/login')
  }

  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-4 rounded-lg border border-red-400 bg-red-900/30 px-4 py-3 text-sm text-white"
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss error"
        className="shrink-0 text-white opacity-70 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  )
}
