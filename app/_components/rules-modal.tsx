'use client'

import { useEffect, useRef } from 'react'

interface RulesModalProps {
  open: boolean
  onClose: () => void
}

export function RulesModal({ open, onClose }: RulesModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    dialogRef.current?.focus()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: '16px',
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rules-modal-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#0b0f12',
          border: '1px solid var(--color-divider, #2e3940)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          outline: 'none',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          animation: 'rules-modal-in 0.3s cubic-bezier(0.34,1.2,0.64,1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid var(--color-divider, #2e3940)',
          }}
        >
          <h2
            id="rules-modal-title"
            style={{ color: '#fff', fontSize: '18px', fontWeight: 600, margin: 0 }}
          >
            Thể lệ chương trình
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng thể lệ"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#888',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s, background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.color = '#fff'
              ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.05)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.color = '#888'
              ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <line x1="3" y1="3" x2="15" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="15" y1="3" x2="3" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {/* Sun* Kudos là gì */}
          <section style={{ marginBottom: '24px' }}>
            <h3
              style={{
                color: 'var(--color-cta-primary, #ffea9e)',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Sun* Kudos là gì?
            </h3>
            <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>
              Sun* Kudos là nền tảng ghi nhận những đóng góp tích cực của thành viên Sun* — nơi mọi người
              trao gửi lời cảm ơn, trân trọng lẫn nhau và cùng lan tỏa năng lượng tích cực.
            </p>
          </section>

          {/* Quy tắc */}
          <section style={{ marginBottom: '24px' }}>
            <h3
              style={{
                color: 'var(--color-cta-primary, #ffea9e)',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Quy tắc tham gia
            </h3>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                'Chỉ gửi kudo khi bạn muốn biểu dương đóng góp tích cực của người khác.',
                'Mỗi kudo nên có nội dung rõ ràng và ý nghĩa.',
                'Không gửi kudo cho chính mình.',
                'Ghi rõ lý do bạn gửi kudo để người nhận cảm nhận được giá trị.',
                'Tôn trọng và trân trọng mọi thành viên trong cộng đồng Sun*.',
              ].map((rule, i) => (
                <li
                  key={i}
                  style={{
                    color: '#ccc',
                    fontSize: '14px',
                    lineHeight: 1.6,
                    paddingLeft: '20px',
                    position: 'relative',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      color: 'var(--color-cta-primary, #ffea9e)',
                      fontWeight: 700,
                    }}
                  >
                    •
                  </span>
                  {rule}
                </li>
              ))}
            </ul>
          </section>

          {/* Mẹo nhỏ */}
          <section>
            <h3
              style={{
                color: 'var(--color-cta-primary, #ffea9e)',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Mẹo nhỏ
            </h3>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                'Viết kudo cụ thể: nêu rõ hành động và tác động tích cực.',
                'Đừng ngại gửi — một lời cảm ơn nhỏ có thể tạo nên sự khác biệt lớn.',
                'Lan tỏa năng lượng tích cực và hỗ trợ nhau cùng phát triển.',
              ].map((tip, i) => (
                <li
                  key={i}
                  style={{
                    color: '#ccc',
                    fontSize: '14px',
                    lineHeight: 1.6,
                    paddingLeft: '20px',
                    position: 'relative',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      color: '#4caf50',
                      fontWeight: 700,
                    }}
                  >
                    ✓
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--color-divider, #2e3940)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 28px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'var(--color-cta-primary, #ffea9e)',
              color: 'var(--color-cta-text, #00101a)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
          >
            Đã hiểu
          </button>
        </div>
      </div>

      <style>{`
        @keyframes rules-modal-in {
          from { opacity: 0; transform: translateY(-16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)     scale(1); }
        }
      `}</style>
    </div>
  )
}
