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
      <div className="job-photo-grid">
        {photos.map((photo, index) => (
          <button
            key={`${photo}-${index}`}
            type="button"
            className="job-photo-button"
            onClick={() => onOpen(index)}
            aria-label={`Open reference photo ${index + 1}`}
          >
            <img src={photo} alt={`Reference ${index + 1}`} className="job-photo-item" />
          </button>
        ))}
      </div>
    </article>
  )
}
