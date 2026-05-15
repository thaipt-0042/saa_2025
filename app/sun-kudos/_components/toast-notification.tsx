'use client'

interface ToastNotificationProps {
  message: string | null
  onClose: () => void
}

export function ToastNotification({ message, onClose }: ToastNotificationProps) {
  if (!message) return null

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        backgroundColor: '#d4271d',
        color: '#fff',
        padding: '12px 16px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        marginBottom: '12px',
      }}
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng thông báo"
        style={{
          background: 'none',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '18px',
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  )
}
