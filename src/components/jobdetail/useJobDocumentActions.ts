import { useCallback, useRef } from 'react'
import type { DetailedJobData } from '../../data/mockJobDetails'
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

  const handleDownload = useCallback(
    async (type: InvoiceType): Promise<void> => {
      const blob = await buildPdfBlob()
      if (!blob) return
      triggerPdfDownload(blob, brand, type, job.id)
    },
    [brand, buildPdfBlob, job.id],
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
          return
        } catch {
          triggerPdfDownload(blob, brand, type, job.id)
          return
        }
      }

      triggerPdfDownload(blob, brand, type, job.id)
    },
    [brand, buildPdfBlob, job.id, shareText],
  )

  const handleWhatsAppToClient = useCallback(
    async (type: InvoiceType): Promise<void> => {
      const blob = await buildPdfBlob()
      if (blob && navigator.share) {
        try {
          const pdfFile = createPdfFile(blob, brand, type, job.id)

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
      } else if (blob) {
        triggerPdfDownload(blob, brand, type, job.id)
      }

      window.open(buildWhatsAppURL(job.clientPhone, shareText(type)), '_blank', 'noopener,noreferrer')
    },
    [brand, buildPdfBlob, job, shareText],
  )

  return {
    docPreviewRef,
    handleDownload,
    handleSystemShare,
    handleWhatsAppToClient,
  }
}
