import { useCallback, useRef } from 'react'
import type { DetailedJobData } from '../../types/jobDetails'
import { useCreateDocumentMutation } from '../../hooks/useDocumentQueries'
import {
  buildDocumentShareText,
  buildWhatsAppURL,
} from '../invoice/documentHelpers'
import type { BrandConfig, InvoiceType } from '../invoice/documentTypes'
import type { Job } from '../../types/job'
import { isNativePdfSupported, savePdf, sharePdf } from '../../lib/nativePdf'
import { buildDocumentNumber, createPdfFile, documentFileName, triggerPdfDownload } from './jobDocumentHelpers'
import { buildJobDocumentPdfBlob } from './jobPdfExport'

export function useJobDocumentActions({
  brand,
  job,
  details,
  balanceToCollect,
}: {
  brand: BrandConfig
  job: Job
  details: DetailedJobData
  balanceToCollect: number
}) {
  const docPreviewRef = useRef<HTMLDivElement | null>(null)
  const canPersistDocument = isUuid(job.id)
  const createDocumentMutation = useCreateDocumentMutation(canPersistDocument ? job.id : '')

  const buildPdfBlob = useCallback(
    (preparedBlob?: Blob | null): Promise<Blob | null> =>
      preparedBlob ? Promise.resolve(preparedBlob) : buildJobDocumentPdfBlob(docPreviewRef.current),
    [],
  )

  const shareText = useCallback(
    (type: InvoiceType): string =>
      buildDocumentShareText({
        type,
        shopName: brand.shopName,
        clientName: job.clientName,
        clientPhone: job.clientPhone,
        service: details.itemType,
        charge: job.chargeAmount,
        deposit: details.depositAmount,
        balance: balanceToCollect,
        deadlineDate: job.deadlineDate,
      }),
    [balanceToCollect, brand.shopName, details.depositAmount, details.itemType, job],
  )

  const saveDocumentRecord = useCallback(
    async (type: InvoiceType, file: File, options: { markSent?: boolean; sentViaWhatsApp?: boolean } = {}): Promise<void> => {
      if (!canPersistDocument) return
      await createDocumentMutation.mutateAsync({
        documentNumber: buildDocumentNumber(type, job.id),
        file,
        jobId: job.id,
        markSent: options.markSent,
        sentViaWhatsApp: options.sentViaWhatsApp,
        type,
      })
    },
    [canPersistDocument, createDocumentMutation, job.id],
  )

  /** Returns a short confirmation to show, if any. */
  const handleDownload = useCallback(
    async (type: InvoiceType, preparedBlob?: Blob | null): Promise<string | void> => {
      const blob = await buildPdfBlob(preparedBlob)
      if (!blob) return
      if (isNativePdfSupported()) {
        const fileName = documentFileName(brand, type, job.id)
        const outcome = await savePdf(blob, fileName)
        return outcome === 'saved' ? `Saved to Documents/TailorDeck/${fileName}` : undefined
      }
      triggerPdfDownload(blob, brand, type, job.id)
    },
    [brand, buildPdfBlob, job.id],
  )

  /** Returns false when nothing was sent (the tailor closed the share sheet). */
  const handleWhatsAppToClient = useCallback(
    async (type: InvoiceType, preparedBlob?: Blob | null): Promise<boolean> => {
      // Android app: attach the real PDF through the share sheet; the tailor picks WhatsApp and the client.
      if (isNativePdfSupported()) {
        const blob = await buildPdfBlob(preparedBlob)
        if (!blob) throw new Error('Could not prepare the PDF.')
        const label = type === 'invoice' ? 'Send invoice' : 'Send receipt'
        const shared = await sharePdf(blob, documentFileName(brand, type, job.id), shareText(type), label)
        if (shared) await saveDocumentRecord(type, createPdfFile(blob, brand, type, job.id), { markSent: true, sentViaWhatsApp: true })
        return shared
      }

      const whatsappUrl = buildWhatsAppURL(job.clientPhone, shareText(type))
      const whatsappWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
      const blob = await buildPdfBlob(preparedBlob)

      if (blob) {
        const pdfFile = createPdfFile(blob, brand, type, job.id)
        await saveDocumentRecord(type, pdfFile, { markSent: true, sentViaWhatsApp: true })
      }

      if (!whatsappWindow) {
        window.location.href = whatsappUrl
      }
      return true
    },
    [brand, buildPdfBlob, job, saveDocumentRecord, shareText],
  )

  return {
    docPreviewRef,
    handleDownload,
    handleWhatsAppToClient,
  }
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}
