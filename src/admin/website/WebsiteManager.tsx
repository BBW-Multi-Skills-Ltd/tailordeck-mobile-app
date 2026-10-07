import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { ArrowLeft, Eye, EyeOff, Pencil, Plus, Star, Trash2, Upload, X } from 'lucide-react'
import QRCode from 'qrcode'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { buildLinks, COMPANY_FIELDS, STORE_FIELDS, toParts, type LinkKey } from './linkFields'
import PrefixedField from '../PrefixedField'
import { DEFAULT_SITE_SETTINGS, qrImageSrc, reviewerInitials, type SiteSettings } from '../../marketing/siteContent'

// Website manager (/admin/website). Writes go straight to site_settings / site_reviews; RLS only allows
// admins with the 'website' role. Prices are not here: they come from Google Play.

type StoredReview = {
  id: string
  name: string
  shop: string
  city: string
  quote: string
  rating: number
  published: boolean
  sort_order: number
}

type ReviewDraft = Omit<StoredReview, 'id'> & { id?: string }

const EMPTY_REVIEW: ReviewDraft = { name: '', shop: '', city: '', quote: '', rating: 5, published: true, sort_order: 0 }

const MAX_VIDEO_BYTES = 100 * 1024 * 1024 // Cloudinary free plan limit per video.

function errorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message) return error.message
  return fallback
}

function qrSvg(url: string): Promise<string> {
  return QRCode.toString(url, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: '#1f1612', light: '#ffffff' } })
}

function Panel({ title, copy, children }: { title: string; copy?: string; children: ReactNode }) {
  return (
    <section className="ad-panel mk-clay">
      <header>
        <h2>{title}</h2>
        {copy ? <p className="ad-muted">{copy}</p> : null}
      </header>
      {children}
    </section>
  )
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  multiline = false,
  maxLength,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  hint?: string
  multiline?: boolean
  maxLength?: number
}) {
  return (
    <label className="ad-field">
      {label}
      <span className={`ad-input-wrap${multiline ? ' ad-input-multiline' : ''}`}>
        {multiline ? (
          <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} maxLength={maxLength} rows={4} />
        ) : (
          <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} maxLength={maxLength} />
        )}
      </span>
      {hint ? <small className="ad-hint">{hint}</small> : null}
    </label>
  )
}

function LinksPanel({ settings, onSaved }: { settings: SiteSettings; onSaved: (settings: SiteSettings) => void }) {
  const [parts, setParts] = useState(() => toParts(settings))
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{ kind: 'error' | 'notice'; text: string } | null>(null)

  const set = (key: LinkKey) => (value: string) => setParts((current) => ({ ...current, [key]: value }))

  async function save(event: FormEvent) {
    event.preventDefault()
    const checked = buildLinks(parts)
    if ('error' in checked) {
      setStatus({ kind: 'error', text: checked.error })
      return
    }
    setSaving(true)
    setStatus(null)
    try {
      const links = checked.values
      // QR codes are regenerated from the saved links, so they always point where the buttons do.
      const update = {
        ...links,
        play_store_qr_svg: await qrSvg(links.play_store_url || DEFAULT_SITE_SETTINGS.play_store_url),
        app_store_qr_svg: links.app_store_url ? await qrSvg(links.app_store_url) : '',
      }
      const { error } = await supabase.from('site_settings').update(update).eq('id', 1)
      if (error) throw error
      const next = { ...settings, ...update }
      setParts(toParts(next))
      onSaved(next)
      setStatus({ kind: 'notice', text: 'Saved. The website shows the new links on its next visit.' })
    } catch (error) {
      setStatus({ kind: 'error', text: errorMessage(error, 'Could not save the links.') })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save} className="ad-stack">
      <Panel title="App stores & QR codes" copy="QR codes are created automatically from these links when you save.">
        <div className="ad-store-grid">
          {STORE_FIELDS.map((field) => (
            <PrefixedField key={field.key} spec={field} value={parts[field.key]} onChange={set(field.key)} />
          ))}
        </div>
        <div className="ad-qr-previews">
          <figure>
            <img src={qrImageSrc(settings.play_store_qr_svg)} alt="Google Play QR code" width={120} height={120} />
            <figcaption>Google Play</figcaption>
          </figure>
          <figure>
            {settings.app_store_qr_svg ? (
              <img src={qrImageSrc(settings.app_store_qr_svg)} alt="App Store QR code" width={120} height={120} />
            ) : (
              <span className="ad-qr-empty">Coming soon</span>
            )}
            <figcaption>App Store</figcaption>
          </figure>
        </div>
      </Panel>

      <Panel title="Company & social links" copy="Empty social links are hidden on the website.">
        <div className="ad-form-grid">
          {COMPANY_FIELDS.map((field) => (
            <PrefixedField key={field.key} spec={field} value={parts[field.key]} onChange={set(field.key)} />
          ))}
        </div>
      </Panel>

      <div className="ad-save-row">
        {status ? <p className={status.kind === 'error' ? 'ad-error' : 'ad-notice'}>{status.text}</p> : <span />}
        <button type="submit" className="mk-btn mk-btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save links'}
        </button>
      </div>
    </form>
  )
}

type SignedUpload = { cloudName: string; apiKey: string; folder: string; timestamp: number; signature: string }

/** Uploads straight to Cloudinary with a signature from the cloudinary-sign-upload function. */
function uploadToCloudinary(file: File, signed: SignedUpload, onProgress: (percent: number) => void): Promise<{ secure_url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const body = new FormData()
    body.append('file', file)
    body.append('api_key', signed.apiKey)
    body.append('timestamp', String(signed.timestamp))
    body.append('signature', signed.signature)
    body.append('folder', signed.folder)
    const request = new XMLHttpRequest()
    request.open('POST', `https://api.cloudinary.com/v1_1/${encodeURIComponent(signed.cloudName)}/video/upload`)
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100))
    }
    request.onload = () => {
      try {
        const result = JSON.parse(request.responseText) as { secure_url?: string; public_id?: string; error?: { message?: string } }
        if (request.status >= 200 && request.status < 300 && result.secure_url && result.public_id) {
          resolve({ secure_url: result.secure_url, public_id: result.public_id })
        } else {
          reject(new Error(result.error?.message || `Upload failed (${request.status}).`))
        }
      } catch {
        reject(new Error(`Upload failed (${request.status}).`))
      }
    }
    request.onerror = () => reject(new Error('Upload failed. Check your connection and try again.'))
    request.send(body)
  })
}

function DemoVideoPanel({ settings, onSaved }: { settings: SiteSettings; onSaved: (settings: SiteSettings) => void }) {
  const [progress, setProgress] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<{ kind: 'error' | 'notice'; text: string } | null>(null)

  async function saveVideo(url: string, poster: string, message: string) {
    const { error } = await supabase.from('site_settings').update({ demo_video_url: url, demo_video_poster_url: poster }).eq('id', 1)
    if (error) throw error
    onSaved({ ...settings, demo_video_url: url, demo_video_poster_url: poster })
    setStatus({ kind: 'notice', text: message })
  }

  async function upload(file: File) {
    if (!file.type.startsWith('video/')) {
      setStatus({ kind: 'error', text: 'Choose a video file (MP4 works best).' })
      return
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setStatus({ kind: 'error', text: 'That video is over 100 MB. Please export a smaller file.' })
      return
    }
    setBusy(true)
    setStatus(null)
    setProgress(0)
    try {
      const { data, error } = await supabase.functions.invoke<SignedUpload>('cloudinary-sign-upload', { body: {} })
      if (error || !data) throw error ?? new Error('Could not prepare the upload.')
      const uploaded = await uploadToCloudinary(file, data, setProgress)
      // Cloudinary makes a still from the video (1 second in) to show before it plays.
      const poster = `https://res.cloudinary.com/${data.cloudName}/video/upload/so_1/${uploaded.public_id}.jpg`
      await saveVideo(uploaded.secure_url, poster, 'Demo video uploaded. The play button now shows on the website.')
    } catch (error) {
      setStatus({ kind: 'error', text: errorMessage(error, 'Upload failed.') })
    } finally {
      setBusy(false)
      setProgress(null)
    }
  }

  async function remove() {
    if (!window.confirm('Remove the demo video from the website?')) return
    setBusy(true)
    setStatus(null)
    try {
      await saveVideo('', '', 'Demo video removed from the website.')
    } catch (error) {
      setStatus({ kind: 'error', text: errorMessage(error, 'Could not remove the video.') })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Panel title="Demo video" copy="Shown when visitors press the play button next to the phone at the top of the website.">
      {settings.demo_video_url ? (
        <video className="ad-video" src={settings.demo_video_url} poster={settings.demo_video_poster_url || undefined} controls preload="metadata" />
      ) : (
        <p className="ad-muted">No demo video yet. The play button is hidden until you upload one.</p>
      )}
      {progress !== null ? (
        <div className="ad-progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <span className="ad-progress-track">
            <span style={{ width: `${progress}%` }} />
          </span>
          <small>{progress < 100 ? `Uploading… ${progress}%` : 'Processing…'}</small>
        </div>
      ) : null}
      {status ? <p className={status.kind === 'error' ? 'ad-error' : 'ad-notice'}>{status.text}</p> : null}
      <div className="ad-button-row">
        <label className={`mk-btn mk-btn-primary ad-file-btn${busy ? ' is-disabled' : ''}`}>
          <Upload size={16} /> {settings.demo_video_url ? 'Replace video' : 'Upload video'}
          <input
            type="file"
            accept="video/*"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ''
              if (file) void upload(file)
            }}
          />
        </label>
        {settings.demo_video_url ? (
          <button type="button" className="mk-btn mk-btn-secondary" onClick={() => void remove()} disabled={busy}>
            <Trash2 size={16} /> Remove
          </button>
        ) : null}
      </div>
    </Panel>
  )
}

function ReviewForm({ draft, onCancel, onSaved }: { draft: ReviewDraft; onCancel: () => void; onSaved: () => void }) {
  const [values, setValues] = useState(draft)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = <K extends keyof ReviewDraft>(key: K, value: ReviewDraft[K]) => setValues((current) => ({ ...current, [key]: value }))

  async function save(event: FormEvent) {
    event.preventDefault()
    if (!values.name.trim() || !values.quote.trim()) {
      setError('Name and review are required.')
      return
    }
    setSaving(true)
    setError('')
    const row = {
      name: values.name.trim(),
      shop: values.shop.trim(),
      city: values.city.trim(),
      quote: values.quote.trim(),
      rating: values.rating,
      published: values.published,
      sort_order: values.sort_order,
    }
    const { error: saveError } = values.id
      ? await supabase.from('site_reviews').update(row).eq('id', values.id)
      : await supabase.from('site_reviews').insert(row)
    setSaving(false)
    if (saveError) {
      setError(errorMessage(saveError, 'Could not save the review.'))
      return
    }
    onSaved()
  }

  return (
    <form className="ad-review-form" onSubmit={save}>
      <div className="ad-form-grid">
        <TextField label="Name" value={values.name} onChange={(value) => set('name', value)} placeholder="Amaka M." maxLength={80} />
        <TextField label="Shop (optional)" value={values.shop} onChange={(value) => set('shop', value)} placeholder="Amaka Couture" maxLength={80} />
        <TextField label="City (optional)" value={values.city} onChange={(value) => set('city', value)} placeholder="Lagos" maxLength={60} />
        <label className="ad-field">
          Rating
          <span className="ad-rating" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                role="radio"
                aria-checked={values.rating === rating}
                aria-label={`${rating} star${rating > 1 ? 's' : ''}`}
                className={rating <= values.rating ? 'is-on' : ''}
                onClick={() => set('rating', rating)}
              >
                <Star size={20} fill="currentColor" />
              </button>
            ))}
          </span>
        </label>
      </div>
      <TextField label="Review" value={values.quote} onChange={(value) => set('quote', value)} placeholder="What they said about TailorDeck" multiline maxLength={600} />
      <div className="ad-form-grid">
        <label className="ad-field">
          Order on the website
          <span className="ad-input-wrap">
            <input type="number" value={values.sort_order} onChange={(event) => set('sort_order', Number(event.target.value) || 0)} />
          </span>
          <small className="ad-hint">Lower numbers show first.</small>
        </label>
        <label className="ad-check">
          <input type="checkbox" checked={values.published} onChange={(event) => set('published', event.target.checked)} />
          Show on the website
        </label>
      </div>
      {error ? <p className="ad-error">{error}</p> : null}
      <div className="ad-button-row">
        <button type="submit" className="mk-btn mk-btn-primary" disabled={saving}>
          {saving ? 'Saving…' : values.id ? 'Save review' : 'Add review'}
        </button>
        <button type="button" className="mk-btn mk-btn-secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </form>
  )
}

function ReviewsPanel() {
  const [reviews, setReviews] = useState<StoredReview[] | null>(null)
  const [editing, setEditing] = useState<ReviewDraft | null>(null)
  const [error, setError] = useState('')

  const [version, setVersion] = useState(0)
  const load = useCallback(() => setVersion((current) => current + 1), [])

  useEffect(() => {
    let active = true
    void supabase
      .from('site_reviews')
      .select('id,name,shop,city,quote,rating,published,sort_order')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
      .then(({ data, error: loadError }) => {
        if (!active) return
        if (loadError) setError(errorMessage(loadError, 'Could not load reviews.'))
        else setReviews((data ?? []) as StoredReview[])
      })
    return () => {
      active = false
    }
  }, [version])

  async function togglePublished(review: StoredReview) {
    const { error: updateError } = await supabase.from('site_reviews').update({ published: !review.published }).eq('id', review.id)
    if (updateError) setError(errorMessage(updateError, 'Could not update the review.'))
    else void load()
  }

  async function remove(review: StoredReview) {
    if (!window.confirm(`Delete the review from ${review.name}? This cannot be undone.`)) return
    const { error: deleteError } = await supabase.from('site_reviews').delete().eq('id', review.id)
    if (deleteError) setError(errorMessage(deleteError, 'Could not delete the review.'))
    else void load()
  }

  const nextOrder = reviews?.length ? Math.max(...reviews.map((review) => review.sort_order)) + 1 : 0

  return (
    <Panel title="Reviews" copy="Only reviews marked “Show on the website” appear there. Add real feedback from tailors using TailorDeck.">
      {error ? <p className="ad-error">{error}</p> : null}
      {editing && !editing.id ? (
        <ReviewForm
          draft={editing}
          onCancel={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            void load()
          }}
        />
      ) : (
        <div>
          <button type="button" className="mk-btn mk-btn-secondary" onClick={() => setEditing({ ...EMPTY_REVIEW, sort_order: nextOrder })}>
            <Plus size={16} /> Add review
          </button>
        </div>
      )}
      {reviews === null ? (
        <p className="ad-muted">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="ad-muted">No reviews yet. The website shows “Reviews are on the way” until one is published.</p>
      ) : (
        <ul className="ad-review-list">
          {reviews.map((review) =>
            editing?.id === review.id ? (
              <li key={review.id}>
                <ReviewForm
                  draft={editing}
                  onCancel={() => setEditing(null)}
                  onSaved={() => {
                    setEditing(null)
                    void load()
                  }}
                />
              </li>
            ) : (
              <li key={review.id} className={review.published ? '' : 'is-hidden'}>
                <span className="ad-avatar">{reviewerInitials(review.name)}</span>
                <div className="ad-review-body">
                  <div className="ad-review-head">
                    <b>{review.name}</b>
                    <small className="ad-muted">{[review.shop, review.city].filter(Boolean).join(' • ')}</small>
                    <span className="ad-stars" aria-label={`${review.rating} out of 5 stars`}>
                      {'★'.repeat(review.rating)}
                      <span>{'★'.repeat(5 - review.rating)}</span>
                    </span>
                    {review.published ? null : <span className="ad-tag">Hidden</span>}
                  </div>
                  <p>“{review.quote}”</p>
                </div>
                <div className="ad-review-actions">
                  <button
                    type="button"
                    className="mk-icon-btn"
                    onClick={() => void togglePublished(review)}
                    aria-label={review.published ? 'Hide from website' : 'Show on website'}
                    title={review.published ? 'Hide from website' : 'Show on website'}
                  >
                    {review.published ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button type="button" className="mk-icon-btn" onClick={() => setEditing(review)} aria-label="Edit review" title="Edit">
                    <Pencil size={16} />
                  </button>
                  <button type="button" className="mk-icon-btn ad-danger" onClick={() => void remove(review)} aria-label="Delete review" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </Panel>
  )
}

export default function WebsiteManager() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let active = true
    void supabase
      .from('site_settings')
      .select(Object.keys(DEFAULT_SITE_SETTINGS).join(','))
      .eq('id', 1)
      .single()
      .then(({ data, error }) => {
        if (!active) return
        if (error || !data) setLoadError(errorMessage(error, 'Could not load the website settings.'))
        else setSettings({ ...DEFAULT_SITE_SETTINGS, ...(data as unknown as Partial<SiteSettings>) })
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <section className="ad-page">
      <Link to="/admin" className="ad-back">
        <ArrowLeft size={16} /> All areas
      </Link>
      <div className="ad-page-head">
        <h1>Website manager</h1>
        <a className="mk-btn mk-btn-secondary" href="/" target="_blank" rel="noreferrer">
          View website
        </a>
      </div>
      <p className="ad-muted ad-page-copy">
        Plan prices are not edited here. They are set in Google Play Console.
      </p>
      {loadError ? (
        <p className="ad-error">
          <X size={14} /> {loadError}
        </p>
      ) : settings === null ? (
        <p className="ad-muted">Loading…</p>
      ) : (
        <div className="ad-stack">
          <LinksPanel settings={settings} onSaved={setSettings} />
          <DemoVideoPanel settings={settings} onSaved={setSettings} />
          <ReviewsPanel />
        </div>
      )}
    </section>
  )
}
