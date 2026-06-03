interface KudoImageGalleryProps {
  images: string[]
}

export function KudoImageGallery({ images }: KudoImageGalleryProps) {
  if (images.length === 0) return null

  const visible = images.slice(0, 5)

  return (
    <div className="flex gap-2 flex-wrap mt-2">
      {visible.map((url, i) => (
        <a key={i} href={url} target="_blank" rel="noopener noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt=""
            className="w-16 h-16 object-cover rounded-lg border transition-opacity hover:opacity-80" style={{ borderColor: 'var(--color-divider)' }}
          />
        </a>
      ))}
    </div>
  )
}
