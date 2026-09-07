import { useCallback, useRef } from 'react'
import type { DetailedJobData } from '../../types/jobDetails'
import { useCreateDocumentMutation } from '../../hooks/useDocumentQueries'
import {
  buildDocumentShareText,
  buildWhatsAppURL,
} from '../invoice/documentHelpers'
import type { BrandConfig, InvoiceType } from '../invoice/documentTypes'
import type { MockJob } from '../../types/job'
import { buildDocumentNumber, createPdfFile, triggerPdfDownload } from './jobDocumentHelpers'
import { buildJobDocumentPdfBlob } from './jobPdfExport'

export function useJobDocumentActions({
  brand,
  job,
  details,
  balanceToCollect,
}: {
  brand: BrandConfig
  job: MockJob
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

  const handleDownload = useCallback(
    async (type: InvoiceType, preparedBlob?: Blob | null): Promise<void> => {
      const blob = await buildPdfBlob(preparedBlob)
      if (!blob) return
      triggerPdfDownload(blob, brand, type, job.id)
    },
    [brand, buildPdfBlob, job.id],
  )

  const handleWhatsAppToClient = useCallback(
    async (type: InvoiceType, preparedBlob?: Blob | null): Promise<void> => {
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
