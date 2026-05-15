// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'

vi.mock('isomorphic-dompurify', () => ({
  default: { sanitize: (s: string) => s },
}))

import { useKudoForm } from './use-kudo-form'

const mockUser = { id: 'u1', full_name: 'Nguyen Van An', avatar_url: null }

describe('useKudoForm', () => {
  it('initial state is correct', () => {
    const { result } = renderHook(() => useKudoForm())
    expect(result.current.recipient).toBeNull()
    expect(result.current.content).toBe('')
    expect(result.current.hashtags).toEqual([])
    expect(result.current.imageUrls).toEqual([])
    expect(result.current.isAnonymous).toBe(false)
    expect(result.current.anonymousName).toBe('')
    expect(result.current.isSubmitting).toBe(false)
    expect(result.current.submitError).toBeNull()
    expect(result.current.fieldErrors).toEqual({})
  })

  it('setRecipient updates recipient state', () => {
    const { result } = renderHook(() => useKudoForm())
    act(() => { result.current.setRecipient(mockUser) })
    expect(result.current.recipient).toEqual(mockUser)
  })

  it('isFormValid is false when missing recipient', () => {
    const { result } = renderHook(() => useKudoForm())
    act(() => {
      result.current.setContent('<p>Hello</p>')
      result.current.setHashtags(['ht-1'])
    })
    expect(result.current.isFormValid).toBe(false)
  })

  it('isFormValid is false when missing content', () => {
    const { result } = renderHook(() => useKudoForm())
    act(() => {
      result.current.setRecipient(mockUser)
      result.current.setHashtags(['ht-1'])
    })
    expect(result.current.isFormValid).toBe(false)
  })

  it('isFormValid is false when missing hashtags', () => {
    const { result } = renderHook(() => useKudoForm())
    act(() => {
      result.current.setRecipient(mockUser)
      result.current.setContent('<p>Great work!</p>')
    })
    expect(result.current.isFormValid).toBe(false)
  })

  it('isFormValid is true when all required fields are set', () => {
    const { result } = renderHook(() => useKudoForm())
    act(() => {
      result.current.setRecipient(mockUser)
      result.current.setContent('<p>Great work!</p>')
      result.current.setHashtags(['ht-1'])
    })
    expect(result.current.isFormValid).toBe(true)
  })

  it('fieldErrors populated when submitting empty form', async () => {
    const { result } = renderHook(() => useKudoForm())
    await act(async () => { await result.current.handleSubmit() })
    expect(result.current.fieldErrors.recipient).toBeDefined()
    expect(result.current.fieldErrors.content).toBeDefined()
    expect(result.current.fieldErrors.hashtags).toBeDefined()
  })

  it('reset() clears all state', () => {
    const { result } = renderHook(() => useKudoForm())
    act(() => {
      result.current.setRecipient(mockUser)
      result.current.setContent('<p>Hello</p>')
      result.current.setHashtags(['ht-1'])
      result.current.reset()
    })
    expect(result.current.recipient).toBeNull()
    expect(result.current.content).toBe('')
    expect(result.current.hashtags).toEqual([])
    expect(result.current.isAnonymous).toBe(false)
    expect(result.current.fieldErrors).toEqual({})
  })
})

describe('useKudoForm — anonymous mode', () => {
  it('isAnonymous defaults to false, anonymousName defaults to empty', () => {
    const { result } = renderHook(() => useKudoForm())
    expect(result.current.isAnonymous).toBe(false)
    expect(result.current.anonymousName).toBe('')
  })

  it('setIsAnonymous(true) toggles isAnonymous', () => {
    const { result } = renderHook(() => useKudoForm())
    act(() => { result.current.setIsAnonymous(true) })
    expect(result.current.isAnonymous).toBe(true)
  })

  it('setIsAnonymous(false) clears anonymousName', () => {
    const { result } = renderHook(() => useKudoForm())
    act(() => {
      result.current.setIsAnonymous(true)
      result.current.setAnonymousName('Ninja')
      result.current.setIsAnonymous(false)
    })
    expect(result.current.isAnonymous).toBe(false)
  })

  it('handleSubmit with isAnonymous=true and empty name sends anonymousDisplayName=null', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
    global.fetch = mockFetch

    const { result } = renderHook(() => useKudoForm())
    act(() => {
      result.current.setRecipient(mockUser)
      result.current.setContent('<p>Hello</p>')
      result.current.setHashtags(['ht-1'])
      result.current.setIsAnonymous(true)
      result.current.setAnonymousName('   ')
    })

    await act(async () => { await result.current.handleSubmit() })

    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.anonymousDisplayName).toBeNull()
  })

  it('handleSubmit with isAnonymous=true and name "Ninja" sends anonymousDisplayName="Ninja"', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
    global.fetch = mockFetch

    const { result } = renderHook(() => useKudoForm())
    act(() => {
      result.current.setRecipient(mockUser)
      result.current.setContent('<p>Hello</p>')
      result.current.setHashtags(['ht-1'])
      result.current.setIsAnonymous(true)
      result.current.setAnonymousName('Ninja')
    })

    await act(async () => { await result.current.handleSubmit() })

    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.anonymousDisplayName).toBe('Ninja')
  })
})
