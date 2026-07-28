import { useCallback, useRef } from 'react'
import type { DetailedJobData } from '../../data/mockJobDetails'
import { useCreateDocumentMutation } from '../../hooks/useDocumentQueries'
import {
  buildDocumentShareText,
  buildWhatsAppURL,
} from '../invoice/documentHelpers'
import type { BrandConfig, InvoiceType } from '../invoice/documentTypes'
import type { MockJob } from '../../types/job'
import { canSharePdfFile, createPdfFile, triggerPdfDownload } from './jobDocumentHelpers'
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

  const buildPdfBlob = useCallback((): Promise<Blob | null> => buildJobDocumentPdfBlob(docPreviewRef.current), [])

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
    async (type: InvoiceType): Promise<void> => {
      const blob = await buildPdfBlob()
      if (!blob) return
      const pdfFile = createPdfFile(blob, brand, type, job.id)
      await saveDocumentRecord(type, pdfFile)
      triggerPdfDownload(blob, brand, type, job.id)
    },
    [brand, buildPdfBlob, job.id, saveDocumentRecord],
  )

  const handleSystemShare = useCallback(
    async (type: InvoiceType): Promise<void> => {
      const blob = await buildPdfBlob()
      if (!blob) return

      const pdfFile = createPdfFile(blob, brand, type, job.id)

      if (navigator.share) {
        try {
          if (!canSharePdfFile(pdfFile)) throw new Error('File share unsupported')

          await navigator.share({
            title: `${brand.shopName} ${type === 'invoice' ? 'Invoice' : 'Receipt'}`,
            text: shareText(type),
            files: [pdfFile],
          })
          await saveDocumentRecord(type, pdfFile, { markSent: true })
          return
        } catch {
          await saveDocumentRecord(type, pdfFile)
          triggerPdfDownload(blob, brand, type, job.id)
          return
        }
      }

      await saveDocumentRecord(type, pdfFile)
      triggerPdfDownload(blob, brand, type, job.id)
    },
    [brand, buildPdfBlob, job.id, saveDocumentRecord, shareText],
  )

  const handleWhatsAppToClient = useCallback(
    async (type: InvoiceType): Promise<void> => {
      const blob = await buildPdfBlob()
      if (blob && navigator.share) {
        const pdfFile = createPdfFile(blob, brand, type, job.id)
        try {
          if (canSharePdfFile(pdfFile)) {
            await navigator.share({
              title: `${brand.shopName} ${type === 'invoice' ? 'Invoice' : 'Receipt'}`,
              text: `For ${job.clientName} (${job.clientPhone})`,
              files: [pdfFile],
            })
          } else {
            triggerPdfDownload(blob, brand, type, job.id)
          }
        } catch {
          triggerPdfDownload(blob, brand, type, job.id)
        }
        await saveDocumentRecord(type, pdfFile, { markSent: true, sentViaWhatsApp: true })
      } else if (blob) {
        const pdfFile = createPdfFile(blob, brand, type, job.id)
        await saveDocumentRecord(type, pdfFile, { markSent: true, sentViaWhatsApp: true })
        triggerPdfDownload(blob, brand, type, job.id)
      }

      window.open(buildWhatsAppURL(job.clientPhone, shareText(type)), '_blank', 'noopener,noreferrer')
    },
    [brand, buildPdfBlob, job, saveDocumentRecord, shareText],
  )

  return {
    docPreviewRef,
    handleDownload,
    handleSystemShare,
    handleWhatsAppToClient,
  }
}

function buildDocumentNumber(type: InvoiceType, jobId: string): string {
  const prefix = type === 'invoice' ? 'INV' : 'RCT'
  return `${prefix}-${jobId.slice(0, 8).toUpperCase()}`
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}
