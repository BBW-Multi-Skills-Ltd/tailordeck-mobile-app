import { ChevronLeft, ChevronRight, ImageIcon, X } from 'lucide-react'
import { SmartImage } from '../shared/SmartImage'

export function JobImageViewer({
  activePhoto,
  currentIndex,
  total,
  onClose,
  onPrevious,
  onNext,
}: {
  activePhoto: string
  currentIndex: number
  total: number
  onClose: () => void
  onPrevious: () => void
  onNext: () => void
}) {
  return (
    <div
      className="sheet-overlay job-image-viewer"
      role="dialog"
      aria-modal="true"
      aria-label="Reference image viewer"
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="btn btn-ghost btn-icon job-image-nav job-image-nav-left"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation()
          onPrevious()
        }}
        aria-label="Previous image"
      >
        <ChevronLeft size={22} />
      </button>

      <div className="job-image-stage">
        <button
          type="button"
          className="btn btn-ghost btn-icon job-image-close"
          onPointerDown={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onClose()
          }}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
          }}
          aria-label="Close image viewer"
        >
          <X size={20} />
        </button>
        <SmartImage
          src={activePhoto}
          alt="Full reference"
          wrapperClassName="job-image-full"
          fallback={<ImageIcon size={28} />}
        />
      </div>

      <button
        type="button"
        className="btn btn-ghost btn-icon job-image-nav job-image-nav-right"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation()
          onNext()
        }}
        aria-label="Next image"
      >
        <ChevronRight size={22} />
      </button>

      <p className="job-image-counter">
        {currentIndex + 1} / {total}
      </p>
    </div>
  )
}
