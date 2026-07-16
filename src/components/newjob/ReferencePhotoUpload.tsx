import { ImagePlus, Upload } from 'lucide-react'

export type ReferencePhotoTarget = {
  id: string
  label: string
  meta: string
  maxFiles: number
}

type ReferencePhotoUploadProps = {
  namesByTarget: Record<string, string[]>
  targets: ReferencePhotoTarget[]
  onReferencePhotoUpload: (targetId: string, files: FileList | null, maxFiles: number) => void
}

export function ReferencePhotoUpload({ namesByTarget, onReferencePhotoUpload, targets }: ReferencePhotoUploadProps) {
  return (
    <section className="stack gap-8">
      <div className="stack gap-4">
        <p className="wizard-section-label">Reference photos</p>
        <p className="text-sm text-muted wizard-helper-inline">Upload inspiration or client style guide if available.</p>
      </div>

      <div className="stack gap-8">
        {targets.map((target) => {
          const names = namesByTarget[target.id] ?? []
          return (
            <article key={target.id} className="card wizard-reference-target-card">
              <div className="wizard-reference-target-head">
                <span className="wizard-reference-target-icon">
                  <ImagePlus size={16} />
                </span>
                <div className="min-w-0">
                  <strong>{target.label}</strong>
                  <p>{target.meta}</p>
                </div>
                <span className="wizard-reference-count">
                  {names.length}/{target.maxFiles}
                </span>
              </div>

              <label className="wizard-upload-box wizard-reference-upload-box">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="wizard-upload-input"
                  onChange={(event) => onReferencePhotoUpload(target.id, event.target.files, target.maxFiles)}
                />
                <div className="row gap-8">
                  <Upload size={18} className="text-muted" />
                  <span className="wizard-upload-title">Tap to upload</span>
                </div>
              </label>

              {names.length > 0 ? (
                <div className="wizard-reference-name-list">
                  {names.map((name) => (
                    <span key={`${target.id}-${name}`} className="wizard-reference-name-chip">
                      {name}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          )
        })}
      </div>
    </section>
  )
}
