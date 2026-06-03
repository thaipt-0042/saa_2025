'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ImageUploadState } from '@/lib/kudos/kudo-types'

const MAX_IMAGES = 5
const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME || 'kudo-images'

interface ImageUploaderProps {
  images: ImageUploadState[]
  onImagesChange: (images: ImageUploadState[]) => void
}

export function ImageUploader({ images, onImagesChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [typeError, setTypeError] = useState<string | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!e.target.files) return
    e.target.value = ''

    if (!file) return

    if (!file.type.startsWith('image/')) {
      setTypeError('Chỉ chấp nhận file ảnh (jpg, png, gif, webp, ...)')
      return
    }

    setTypeError(null)

    const placeholder: ImageUploadState = {
      file,
      url: URL.createObjectURL(file),
      status: 'uploading',
    }
    const next = [...images, placeholder]
    onImagesChange(next)

    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from(BUCKET).upload(path, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)

      onImagesChange(
        next.map((img) =>
          img.file === file ? { ...img, url: publicUrl, status: 'done' } : img
        )
      )
    } catch {
      onImagesChange(
        next.map((img) =>
          img.file === file ? { ...img, status: 'error' } : img
        )
      )
    }
  }

  function removeImage(index: number) {
    onImagesChange(images.filter((_, i) => i !== index))
  }

  return (
    <div>
      {/* Thumbnails */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
        {images.map((img, i) => (
          <div
            key={i}
            style={{
              position: 'relative',
              width: '64px',
              height: '64px',
              borderRadius: '8px',
              overflow: 'hidden',
              border: `1px solid ${img.status === 'error' ? '#d4271d' : 'var(--color-divider)'}`,
            }}
          >
            {img.status !== 'error' && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={img.url}
                alt={img.file.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
            {img.status === 'uploading' && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '11px',
                }}
              >
                ...
              </div>
            )}
            {img.status === 'error' && (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#d4271d',
                  fontSize: '11px',
                }}
              >
                Lỗi
              </div>
            )}
            <button
              type="button"
              aria-label="Xóa ảnh"
              onClick={() => removeImage(i)}
              style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                lineHeight: '18px',
                textAlign: 'center',
                padding: 0,
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {typeError && (
        <p style={{ color: '#d4271d', fontSize: '12px', marginBottom: '6px' }}>{typeError}</p>
      )}

      {images.length < MAX_IMAGES && (
        <>
          <button
            type="button"
            aria-label="Thêm ảnh"
            onClick={() => inputRef.current?.click()}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px dashed var(--color-divider)',
              background: 'none',
              color: '#aaa',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            + Ảnh
          </button>
          <input
            ref={inputRef}
            data-testid="image-file-input"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </>
      )}
    </div>
  )
}
