import { ChevronLeft, ChevronRight, X } from 'lucide-react'

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
    <div className="sheet-overlay job-image-viewer" role="dialog" aria-modal="true" aria-label="Reference image viewer">
      <button
        type="button"
        className="btn btn-ghost btn-icon job-image-nav job-image-nav-left"
        onClick={onPrevious}
        aria-label="Previous image"
      >
        <ChevronLeft size={22} />
      </button>

      <div className="job-image-stage">
        <button type="button" className="btn btn-ghost btn-icon job-image-close" onClick={onClose} aria-label="Close image viewer">
          <X size={20} />
        </button>
        <img src={activePhoto} alt="Full reference" className="job-image-full" />
      </div>

      <button
        type="button"
        className="btn btn-ghost btn-icon job-image-nav job-image-nav-right"
        onClick={onNext}
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
