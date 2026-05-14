'use client'

import Image from 'next/image'

interface LoginButtonProps {
  label: string
  onLogin: () => void
  isPending: boolean
}

export function LoginButton({ label, onLogin, isPending }: LoginButtonProps) {
  return (
    <button
      type="button"
      onClick={onLogin}
      disabled={isPending}
      aria-label="Sign in with Google"
      className="flex items-center justify-start gap-2 rounded-lg px-6 py-4 font-bold text-[22px] leading-7 transition-colors"
      style={{
        width: 305,
        height: 60,
        backgroundColor: 'var(--color-cta-primary)',
        color: 'var(--color-cta-text)',
        fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
        opacity: isPending ? 0.6 : 1,
        cursor: isPending ? 'not-allowed' : 'pointer',
      }}
    >
      {/* text LEFT per Figma node 662:14426 */}
      <span className="flex-1 text-center leading-7">{label}</span>
      {/* icon RIGHT per Figma */}
      <Image
        src="/assets/login/icons/google-icon.svg"
        alt="Google"
        width={24}
        height={24}
        aria-hidden="true"
      />
    </button>
  )
}
