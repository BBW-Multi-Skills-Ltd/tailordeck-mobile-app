import { useEffect, useState } from 'react'
import { signSupportAttachments, type SupportAttachment } from '../../lib/supportAttachments'

/** Signed links for private support attachments (refreshed when the list changes). */
export function useAttachmentLinks(attachments: SupportAttachment[]): Record<string, string> {
  const key = attachments.map((file) => file.path).join('|')
  const [links, setLinks] = useState<Record<string, string>>({})
  useEffect(() => {
    if (!key) return undefined
    let active = true
    signSupportAttachments(key.split('|'))
      .then((result) => {
        if (active) setLinks(result)
      })
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [key])
  return links
}
