import { ImageIcon } from 'lucide-react'
import { SmartImage } from '../shared/SmartImage'

export function JobReferencePhotos({
  photos,
  onOpen,
}: {
  photos: string[]
  onOpen: (index: number) => void
}) {
  return (
    <article className="card stack gap-10">
      <h4>Reference Photos</h4>
      {photos.length === 0 ? (
        <p className="text-sm text-muted">No reference photos added.</p>
      ) : (
        <div className="job-photo-grid">
          {photos.map((photo, index) => (
            <button
              key={`${photo}-${index}`}
              type="button"
              className="job-photo-button"
              onClick={() => onOpen(index)}
              aria-label={`Open reference photo ${index + 1}`}
            >
              <SmartImage
                src={photo}
                alt={`Reference ${index + 1}`}
                wrapperClassName="job-photo-item"
                fallback={<ImageIcon size={18} />}
              />
            </button>
          ))}
        </div>
      )}
    </article>
  )
}
