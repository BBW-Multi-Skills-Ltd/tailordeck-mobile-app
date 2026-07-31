import { X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

export type ReferencePreviewPhoto = {
  id: string
  file: File
  label: string
}

function useObjectUrls(photos: ReferencePreviewPhoto[]) {
  const urls = useMemo(
    () => photos.map((photo) => ({ ...photo, url: URL.createObjectURL(photo.file) })),
    [photos],
  )

  useEffect(() => {
    return () => {
      urls.forEach((photo) => URL.revokeObjectURL(photo.url))
    }
  }, [urls])

  return urls
}

export function ReferencePhotoPreviewGrid({ photos }: { photos: ReferencePreviewPhoto[] }) {
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null)
  const photosWithUrls = useObjectUrls(photos)
  const activePhoto = photosWithUrls.find((photo) => photo.id === activePhotoId)

  if (!photos.length) return null

  return (
    <>
      <div className="wizard-reference-preview-grid">
        {photosWithUrls.map((photo) => (
          <button key={photo.id} type="button" className="wizard-reference-preview-btn" onClick={() => setActivePhotoId(photo.id)}>
            <img src={photo.url} alt={photo.label} />
          </button>
        ))}
      </div>

      {activePhoto ? (
        <div className="wizard-reference-viewer" role="dialog" aria-modal="true" aria-label="Reference photo preview">
          <button type="button" className="wizard-reference-viewer-close" onClick={() => setActivePhotoId(null)} aria-label="Close photo preview">
            <X size={18} />
          </button>
          <img src={activePhoto.url} alt={activePhoto.label} />
          <p>{activePhoto.label}</p>
        </div>
      ) : null}
    </>
  )
}
