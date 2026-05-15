import { useState, useMemo } from 'react'
import type { UserSearchResult } from '@/lib/kudos/kudo-types'

interface FieldErrors {
  recipient?: string
  content?: string
  hashtags?: string
}

export interface KudoFormState {
  recipient: UserSearchResult | null
  content: string
  hashtags: string[]
  imageUrls: string[]
  isAnonymous: boolean
  anonymousName: string
  isSubmitting: boolean
  submitError: string | null
  fieldErrors: FieldErrors
  isFormValid: boolean
  setRecipient: (user: UserSearchResult | null) => void
  setContent: (html: string) => void
  setHashtags: (ids: string[]) => void
  setImageUrls: (urls: string[]) => void
  setIsAnonymous: (v: boolean) => void
  setAnonymousName: (name: string) => void
  setSubmitError: (err: string | null) => void
  handleSubmit: (onSuccess?: () => void) => Promise<void>
  reset: () => void
}

export function useKudoForm(): KudoFormState {
  const [recipient, setRecipient] = useState<UserSearchResult | null>(null)
  const [content, setContent] = useState('')
  const [hashtags, setHashtags] = useState<string[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [anonymousName, setAnonymousName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const isFormValid = useMemo(() => {
    const textContent = content.replace(/<[^>]*>/g, '').trim()
    return !!recipient && textContent.length > 0 && hashtags.length > 0
  }, [recipient, content, hashtags])

  function validate(): FieldErrors {
    const errors: FieldErrors = {}
    if (!recipient) errors.recipient = 'Vui lòng chọn người nhận'
    const textContent = content.replace(/<[^>]*>/g, '').trim()
    if (!textContent) errors.content = 'Vui lòng nhập nội dung'
    if (hashtags.length === 0) errors.hashtags = 'Vui lòng chọn ít nhất 1 hashtag'
    return errors
  }

  async function handleSubmit(onSuccess?: () => void) {
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)
    setFieldErrors({})

    try {
      const payload = {
        recipientId: recipient!.id,
        content,
        hashtags,
        imageUrls,
        isAnonymous,
        anonymousDisplayName: isAnonymous ? (anonymousName.trim() || null) : null,
      }

      const res = await fetch('/api/kudos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error ?? 'Gửi kudo thất bại')
      }

      reset()
      onSuccess?.()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Đã xảy ra lỗi')
    } finally {
      setIsSubmitting(false)
    }
  }

  function reset() {
    setRecipient(null)
    setContent('')
    setHashtags([])
    setImageUrls([])
    setIsAnonymous(false)
    setAnonymousName('')
    setIsSubmitting(false)
    setSubmitError(null)
    setFieldErrors({})
  }

  return {
    recipient,
    content,
    hashtags,
    imageUrls,
    isAnonymous,
    anonymousName,
    isSubmitting,
    submitError,
    fieldErrors,
    isFormValid,
    setRecipient,
    setContent,
    setHashtags,
    setImageUrls,
    setIsAnonymous,
    setAnonymousName,
    setSubmitError,
    handleSubmit,
    reset,
  }
}
