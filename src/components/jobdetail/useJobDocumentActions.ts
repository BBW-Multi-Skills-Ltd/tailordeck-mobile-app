import { useCallback, useRef } from 'react'
import type { DetailedJobData } from '../../data/mockJobDetails'
import {
  buildDocumentShareText,
  buildWhatsAppURL,
} from '../invoice/documentHelpers'
import type { BrandConfig, InvoiceType } from '../invoice/documentTypes'
import type { MockJob } from '../../types/job'
import { canSharePdfFile, createPdfFile, documentFileName } from './jobDocumentHelpers'

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

  const buildPdfBlob = useCallback(async (): Promise<Blob | null> => {
    if (!docPreviewRef.current) return null
    const documentNode = docPreviewRef.current.querySelector<HTMLElement>('.doc-landscape-root') ?? docPreviewRef.current
    const fitStage = documentNode.closest<HTMLElement>('.document-fit-stage')
    const fitShell = documentNode.closest<HTMLElement>('.document-fit-shell')
    const previousStageTransform = fitStage?.style.transform
    const previousShellHeight = fitShell?.style.height

    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ])

    try {
      if (fitStage) fitStage.style.transform = 'none'
      if (fitShell) fitShell.style.height = `${documentNode.offsetHeight}px`

      const canvas = await html2canvas(documentNode, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        onclone: (clonedDoc) => {
          clonedDoc.querySelectorAll('.job-doc-ui-title').forEach((node) => node.remove())
        },
      })

      const imageData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 6
      const imageRatio = Math.min((pageWidth - margin * 2) / canvas.width, (pageHeight - margin * 2) / canvas.height)
      const width = canvas.width * imageRatio
      const height = canvas.height * imageRatio
      const x = (pageWidth - width) / 2
      const y = (pageHeight - height) / 2
      pdf.addImage(imageData, 'PNG', x, y, width, height)
      return pdf.output('blob')
    } finally {
      if (fitStage && previousStageTransform !== undefined) fitStage.style.transform = previousStageTransform
      if (fitShell && previousShellHeight !== undefined) fitShell.style.height = previousShellHeight
    }
  }, [])

  const triggerPdfDownload = useCallback(
    (blob: Blob, type: InvoiceType): void => {
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = documentFileName(brand, type, job.id)
      link.click()
      URL.revokeObjectURL(objectUrl)
    },
    [brand, job.id],
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

  const handleDownload = useCallback(
    async (type: InvoiceType): Promise<void> => {
      const blob = await buildPdfBlob()
      if (!blob) return
      triggerPdfDownload(blob, type)
    },
    [buildPdfBlob, triggerPdfDownload],
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
          triggerPdfDownload(blob, type)
          return
        }
      }

      triggerPdfDownload(blob, type)
    },
    [brand, buildPdfBlob, job.id, shareText, triggerPdfDownload],
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
            triggerPdfDownload(blob, type)
          }
        } catch {
          triggerPdfDownload(blob, type)
        }
      } else if (blob) {
        triggerPdfDownload(blob, type)
      }

      window.open(buildWhatsAppURL(job.clientPhone, shareText(type)), '_blank', 'noopener,noreferrer')
    },
    [brand, buildPdfBlob, job, shareText, triggerPdfDownload],
  )

  return {
    docPreviewRef,
    handleDownload,
    handleSystemShare,
    handleWhatsAppToClient,
  }
}
