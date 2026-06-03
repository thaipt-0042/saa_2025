'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useKudoForm } from './use-kudo-form'
import { RecipientSearchInput } from './recipient-search-input'
import { HashtagPicker } from './hashtag-picker'
import { ToastNotification } from './toast-notification'
import { ImageUploader } from './image-uploader'

// Dynamically imported to avoid TipTap/DOMPurify loading during SSR
const RichTextEditor = dynamic(
  () => import('./rich-text-editor').then((m) => ({ default: m.RichTextEditor })),
  { ssr: false }
)
import type { HashtagItem, ImageUploadState, UserSearchResult } from '@/lib/kudos/kudo-types'

interface WriteKudoModalProps {
  open: boolean
  onClose: () => void
  hashtags?: HashtagItem[]
}

export function WriteKudoModal({ open, onClose, hashtags = [] }: WriteKudoModalProps) {
  const form = useKudoForm()
  const dialogRef = useRef<HTMLDivElement>(null)
  const [recipientQuery, setRecipientQuery] = useState('')
  const [imageStates, setImageStates] = useState<ImageUploadState[]>([])

  useEffect(() => {
    if (!open) return
    dialogRef.current?.focus()
  }, [open])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onClose()
  }

  function handleSelectRecipient(user: UserSearchResult) {
    form.setRecipient(user)
    setRecipientQuery(user.full_name ?? user.id)
  }

  function handleClose() {
    form.reset()
    setRecipientQuery('')
    setImageStates([])
    onClose()
  }

  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="write-kudo-title"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        style={{
          backgroundColor: '#0b0f12',
          border: '1px solid var(--color-divider)',
          borderRadius: '16px',
          padding: '24px',
          width: '100%',
          maxWidth: '520px',
          outline: 'none',
        }}
      >
        <h2
          id="write-kudo-title"
          style={{ color: '#fff', fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}
        >
          Viết Kudo
        </h2>

        <ToastNotification
          message={form.submitError}
          onClose={() => form.setSubmitError(null)}
        />

        {/* Recipient */}
        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="recipient-input"
            style={{ display: 'block', color: '#aaa', fontSize: '13px', marginBottom: '6px' }}
          >
            Người nhận <span aria-hidden>*</span>
          </label>
          <RecipientSearchInput
            value={recipientQuery}
            onChange={setRecipientQuery}
            onSelect={handleSelectRecipient}
          />
          {form.fieldErrors.recipient && (
            <p role="alert" style={{ color: '#d4271d', fontSize: '12px', marginTop: '4px' }}>
              {form.fieldErrors.recipient}
            </p>
          )}
        </div>

        {/* Content */}
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{ display: 'block', color: '#aaa', fontSize: '13px', marginBottom: '6px' }}
          >
            Nội dung <span aria-hidden>*</span>
          </label>
          <RichTextEditor onContentChange={form.setContent} />
          {form.fieldErrors.content && (
            <p role="alert" style={{ color: '#d4271d', fontSize: '12px', marginTop: '4px' }}>
              {form.fieldErrors.content}
            </p>
          )}
        </div>

        {/* Hashtags */}
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{ display: 'block', color: '#aaa', fontSize: '13px', marginBottom: '8px' }}
          >
            Hashtag <span aria-hidden>*</span>
          </label>
          <HashtagPicker
            selected={form.hashtags}
            allHashtags={hashtags}
            onAdd={(id) => form.setHashtags([...form.hashtags, id])}
            onRemove={(id) => form.setHashtags(form.hashtags.filter((h) => h !== id))}
          />
          {form.fieldErrors.hashtags && (
            <p role="alert" style={{ color: '#d4271d', fontSize: '12px', marginTop: '4px' }}>
              {form.fieldErrors.hashtags}
            </p>
          )}
        </div>

        {/* Image uploader */}
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{ display: 'block', color: '#aaa', fontSize: '13px', marginBottom: '8px' }}
          >
            Ảnh đính kèm
          </label>
          <ImageUploader
            images={imageStates}
            onImagesChange={(imgs: ImageUploadState[]) => {
              setImageStates(imgs)
              form.setImageUrls(imgs.filter((i) => i.status === 'done').map((i) => i.url))
            }}
          />
        </div>

        {/* Anonymous */}
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#aaa', fontSize: '13px', cursor: 'pointer' }}
          >
            <input
              type="checkbox"
              checked={form.isAnonymous}
              onChange={(e) => form.setIsAnonymous(e.target.checked)}
            />
            Gửi lời cám ơn và ghi nhận ẩn danh
          </label>
          {form.isAnonymous && (
            <input
              type="text"
              value={form.anonymousName}
              onChange={(e) => form.setAnonymousName(e.target.value)}
              placeholder="Tên hiển thị (để trống = Ẩn danh)"
              maxLength={100}
              style={{
                marginTop: '8px',
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--color-divider)',
                background: 'transparent',
                color: '#fff',
                fontSize: '13px',
                boxSizing: 'border-box',
              }}
            />
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            onClick={handleClose}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid var(--color-divider)',
              background: 'none',
              color: '#aaa',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={!form.isFormValid || form.isSubmitting}
            aria-disabled={!form.isFormValid || form.isSubmitting}
            onClick={() => form.handleSubmit(handleClose)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: form.isFormValid ? 'var(--color-cta-primary)' : 'var(--color-divider)',
              color: form.isFormValid ? 'var(--color-cta-text)' : '#666',
              cursor: form.isFormValid ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            {form.isSubmitting ? 'Đang gửi...' : 'Gửi'}
          </button>
        </div>
      </div>
    </div>
  )
}
