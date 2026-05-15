// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const mockUpload = vi.fn()
const mockGetPublicUrl = vi.fn()
const mockFrom = vi.fn(() => ({
  upload: mockUpload,
  getPublicUrl: mockGetPublicUrl,
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    storage: { from: mockFrom },
  })),
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockUpload.mockResolvedValue({ data: { path: 'kudo-images/test.jpg' }, error: null })
  mockGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://example.com/test.jpg' } })
})

import { ImageUploader } from './image-uploader'

function makeFile(name: string, type: string) {
  return new File(['data'], name, { type })
}

describe('ImageUploader', () => {
  it('renders the add image button', () => {
    render(<ImageUploader images={[]} onImagesChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: /thêm ảnh/i })).toBeInTheDocument()
  })

  it('rejects non-image files and shows error', async () => {
    const onImagesChange = vi.fn()
    render(<ImageUploader images={[]} onImagesChange={onImagesChange} />)

    const input = screen.getByTestId('image-file-input')
    const pdfFile = makeFile('doc.pdf', 'application/pdf')
    fireEvent.change(input, { target: { files: [pdfFile] } })

    await waitFor(() => {
      expect(screen.getByText(/chỉ chấp nhận/i)).toBeInTheDocument()
    })
    expect(onImagesChange).not.toHaveBeenCalled()
  })

  it('hides add button when 5 images are selected', () => {
    const fiveImages = Array.from({ length: 5 }, (_, i) => ({
      file: makeFile(`img${i}.jpg`, 'image/jpeg'),
      url: `https://example.com/img${i}.jpg`,
      status: 'done' as const,
    }))
    render(<ImageUploader images={fiveImages} onImagesChange={vi.fn()} />)
    expect(screen.queryByRole('button', { name: /thêm ảnh/i })).not.toBeInTheDocument()
  })

  it('clicking x on image calls onImagesChange without that image', async () => {
    const img = {
      file: makeFile('img.jpg', 'image/jpeg'),
      url: 'https://example.com/img.jpg',
      status: 'done' as const,
    }
    const onImagesChange = vi.fn()
    render(<ImageUploader images={[img]} onImagesChange={onImagesChange} />)

    fireEvent.click(screen.getByRole('button', { name: /xóa ảnh/i }))
    expect(onImagesChange).toHaveBeenCalledWith([])
  })
})
