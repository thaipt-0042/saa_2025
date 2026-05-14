'use client'

interface NotificationPanelProps {
  open: boolean
  onClose: () => void
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 80,
        right: 144,
        zIndex: 50,
        width: 360,
        minHeight: 120,
        backgroundColor: 'var(--color-header-bg)',
        border: '1px solid var(--color-divider)',
        borderRadius: 8,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 8 }}>
        <button
          onClick={onClose}
          aria-label="Đóng thông báo"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }}
        >
          ✕
        </button>
      </div>
      {/* Notification list — out of scope per spec */}
    </div>
  )
}
