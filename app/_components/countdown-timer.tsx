'use client'

import { useState, useEffect } from 'react'

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
}

function computeRemaining(targetIso: string): TimeRemaining {
  try {
    const target = new Date(targetIso).getTime()
    if (isNaN(target)) return { days: 0, hours: 0, minutes: 0 }

    const diffMs = Math.max(0, target - Date.now())
    const totalMinutes = Math.floor(diffMs / 60_000)
    const minutes = totalMinutes % 60
    const totalHours = Math.floor(totalMinutes / 60)
    const hours = totalHours % 24
    const days = Math.floor(totalHours / 24)

    return { days, hours, minutes }
  } catch {
    return { days: 0, hours: 0, minutes: 0 }
  }
}

function DigitTile({ digit }: { digit: string }) {
  return (
    <div
      style={{
        position: 'relative',
        width: 51,
        height: 82,
        borderRadius: 8,
        border: '0.5px solid var(--color-cta-primary)',
        backdropFilter: 'blur(16.64px)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Tile background at 50% opacity */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.10) 100%)',
          opacity: 0.5,
        }}
      />
      {/* Digit text at full opacity */}
      <span
        data-testid="digit-tile"
        style={{
          position: 'relative',
          fontFamily: 'var(--font-digital)',
          fontSize: 49,
          fontWeight: 400,
          lineHeight: 1,
          color: '#fff',
        }}
      >
        {digit}
      </span>
    </div>
  )
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  const tens = String(Math.floor(value / 10))
  const units = String(value % 10)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: 116,
        height: 128,
        gap: 14,
      }}
    >
      <div style={{ display: 'flex', gap: 4 }}>
        <DigitTile digit={tens} />
        <DigitTile digit={units} />
      </div>
      <span
        style={{
          fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
          fontSize: 24,
          fontWeight: 700,
          lineHeight: '32px',
          color: '#fff',
        }}
      >
        {label}
      </span>
    </div>
  )
}

export function CountdownTimer() {
  const targetIso = process.env.NEXT_PUBLIC_EVENT_DATETIME ?? ''
  const [remaining, setRemaining] = useState<TimeRemaining>(() => computeRemaining(targetIso))

  const eventStarted = remaining.days === 0 && remaining.hours === 0 && remaining.minutes === 0

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(computeRemaining(targetIso))
    }, 60_000)
    return () => clearInterval(id)
  }, [targetIso])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {!eventStarted && (
        <p
          style={{
            fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
            fontSize: 24,
            fontWeight: 700,
            lineHeight: '32px',
            color: '#fff',
            margin: 0,
          }}
        >
          Comming soon
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: 'row', gap: 40 }}>
        <CountdownUnit value={remaining.days} label="DAYS" />
        <CountdownUnit value={remaining.hours} label="HOURS" />
        <CountdownUnit value={remaining.minutes} label="MINUTES" />
      </div>
    </div>
  )
}
