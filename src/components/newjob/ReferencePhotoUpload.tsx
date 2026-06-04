import { Upload } from 'lucide-react'

type ReferencePhotoUploadProps = {
  referencePhotoNames: string[]
  onReferencePhotoUpload: (files: FileList | null) => void
}

export function ReferencePhotoUpload({ referencePhotoNames, onReferencePhotoUpload }: ReferencePhotoUploadProps) {
  return (
    <div className="input-group">
      <span className="input-label wizard-inline-label">Have a reference photo? Upload if available.</span>
      <label className="wizard-upload-box">
        <input type="file" multiple accept="image/*" className="wizard-upload-input" onChange={(event) => onReferencePhotoUpload(event.target.files)} />
        <div className="row gap-8">
          <Upload size={18} className="text-muted" />
          <span className="wizard-upload-title">Tap to Upload Reference Images</span>
        </div>
      </label>
      {referencePhotoNames.length > 0 ? (
        <div className="stack gap-4">
          {referencePhotoNames.map((name) => (
            <p key={name} className="text-sm text-muted">
              {name}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  )
}
