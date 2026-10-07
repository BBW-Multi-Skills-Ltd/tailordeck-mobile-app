import { useRef, useState } from 'react'
import { FileText, Paperclip, Send, Smile, X } from 'lucide-react'
import {
  formatFileSize,
  SUPPORT_ATTACHMENT_ACCEPT,
  SUPPORT_ATTACHMENT_MAX_FILES,
  supportAttachmentProblem,
  type SupportAttachment,
} from '../../lib/supportAttachments'
import './supportChat.css'

// Chat pieces shared by the in-app support screen and the admin support centre.

const QUICK_EMOJI = ['👍', '🙏', '😊', '😀', '😂', '❤️', '🎉', '✅', '👌', '🙌', '😢', '😅', '🤔', '👏', '🔥', '💯', '📸', '📎', '⏳', '✨']

export function AttachmentList({ attachments, links }: { attachments: SupportAttachment[]; links: Record<string, string> }) {
  if (!attachments.length) return null
  return (
    <div className="sc-attachments">
      {attachments.map((file) => {
        const href = links[file.path]
        if (file.type.startsWith('image/')) {
          return href ? (
            <a key={file.path} href={href} target="_blank" rel="noreferrer" className="sc-image" title={file.name}>
              <img src={href} alt={file.name} loading="lazy" />
            </a>
          ) : (
            <span key={file.path} className="sc-image sc-image-loading" aria-label={file.name} />
          )
        }
        return (
          <a key={file.path} href={href || undefined} target="_blank" rel="noreferrer" className="sc-file" aria-disabled={!href}>
            <FileText size={16} aria-hidden />
            <span>
              <b>{file.name}</b>
              <small>{formatFileSize(file.size)}</small>
            </span>
          </a>
        )
      })}
    </div>
  )
}

type ComposerProps = {
  disabled?: boolean
  sending?: boolean
  placeholder?: string
  onSend: (body: string, files: File[]) => Promise<boolean>
}

/** Message box with emoji and attachments. `onSend` returns true when the message was sent. */
export function ChatComposer({ disabled = false, sending = false, placeholder = 'Write a message…', onSend }: ComposerProps) {
  const [body, setBody] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [problem, setProblem] = useState('')
  const [emojiOpen, setEmojiOpen] = useState(false)
  const textRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function addFiles(list: FileList | null) {
    if (!list?.length) return
    const next = [...files]
    let message = ''
    for (const file of Array.from(list)) {
      const issue = supportAttachmentProblem(file)
      if (issue) message = issue
      else if (next.length >= SUPPORT_ATTACHMENT_MAX_FILES) message = `Up to ${SUPPORT_ATTACHMENT_MAX_FILES} files per message.`
      else next.push(file)
    }
    setFiles(next)
    setProblem(message)
  }

  function insertEmoji(emoji: string) {
    const input = textRef.current
    const start = input?.selectionStart ?? body.length
    const end = input?.selectionEnd ?? body.length
    const next = `${body.slice(0, start)}${emoji}${body.slice(end)}`
    setBody(next)
    requestAnimationFrame(() => {
      input?.focus()
      input?.setSelectionRange(start + emoji.length, start + emoji.length)
    })
  }

  async function submit() {
    if (disabled || sending) return
    if (!body.trim() && !files.length) {
      setProblem('Write a message or attach a file.')
      return
    }
    setProblem('')
    const sent = await onSend(body.trim(), files)
    if (sent) {
      setBody('')
      setFiles([])
      setEmojiOpen(false)
    }
  }

  return (
    <div className={`sc-composer${disabled ? ' is-disabled' : ''}`}>
      {files.length ? (
        <div className="sc-pending">
          {files.map((file, index) => (
            <span key={`${file.name}-${index}`} className="sc-pending-file">
              {file.type.startsWith('image/') ? '🖼️' : '📄'} {file.name}
              <button type="button" aria-label={`Remove ${file.name}`} onClick={() => setFiles(files.filter((_, item) => item !== index))}>
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      ) : null}
      {emojiOpen ? (
        <div className="sc-emoji-grid" role="listbox" aria-label="Emoji">
          {QUICK_EMOJI.map((emoji) => (
            <button key={emoji} type="button" onClick={() => insertEmoji(emoji)} aria-label={emoji}>
              {emoji}
            </button>
          ))}
        </div>
      ) : null}
      <div className="sc-composer-row">
        <button type="button" className="sc-tool" onClick={() => setEmojiOpen((open) => !open)} aria-label="Emoji" aria-pressed={emojiOpen} disabled={disabled}>
          <Smile size={20} />
        </button>
        <button type="button" className="sc-tool" onClick={() => fileRef.current?.click()} aria-label="Attach photo or PDF" disabled={disabled}>
          <Paperclip size={20} />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept={SUPPORT_ATTACHMENT_ACCEPT}
          multiple
          hidden
          onChange={(event) => {
            addFiles(event.target.files)
            event.target.value = ''
          }}
        />
        <textarea
          ref={textRef}
          value={body}
          rows={1}
          maxLength={4000}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={(event) => {
            // Enter sends on a keyboard; Shift+Enter makes a new line.
            if (event.key === 'Enter' && !event.shiftKey && window.matchMedia('(pointer: fine)').matches) {
              event.preventDefault()
              void submit()
            }
          }}
        />
        <button type="button" className="sc-send" onClick={() => void submit()} disabled={disabled || sending} aria-label="Send">
          {sending ? <span className="sc-spinner" aria-hidden /> : <Send size={18} />}
        </button>
      </div>
      {problem ? <p className="sc-problem">{problem}</p> : null}
    </div>
  )
}
