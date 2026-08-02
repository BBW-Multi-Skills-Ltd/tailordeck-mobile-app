import { useState } from 'react'
import type { DetailedJobData } from '../../../types/jobDetails'
import type { MockJob } from '../../../types/job'
import type { BrandConfig, InvoiceType } from '../../invoice/documentTypes'
import { useJobDocumentActions } from '../useJobDocumentActions'
import { useJobImageViewer } from '../useJobImageViewer'

export function useJobDetailInteractions({
  balanceToCollect,
  brand,
  details,
  job,
}: {
  brand: BrandConfig
  job: MockJob
  details: DetailedJobData
  balanceToCollect: number
}) {
  const [openDrawer, setOpenDrawer] = useState<InvoiceType | null>(null)
  const [sentDocuments, setSentDocuments] = useState<Record<InvoiceType, boolean>>({ invoice: false, receipt: false })
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)

  useJobImageViewer({ viewerIndex, photoCount: details.referencePhotos.length, setViewerIndex })

  const activePhoto = viewerIndex === null ? null : details.referencePhotos[viewerIndex]
  const documentActions = useJobDocumentActions({ brand, job, details, balanceToCollect })

  function showPreviousPhoto(): void {
    setViewerIndex((prev) => (prev === null ? 0 : (prev - 1 + details.referencePhotos.length) % details.referencePhotos.length))
  }

  function showNextPhoto(): void {
    setViewerIndex((prev) => (prev === null ? 0 : (prev + 1) % details.referencePhotos.length))
  }

  async function handleSharedDocument(type: InvoiceType, shareAction: (type: InvoiceType) => Promise<void>): Promise<void> {
    await shareAction(type)
    setSentDocuments((prev) => ({ ...prev, [type]: true }))
  }

  return {
    activePhoto,
    documentActions,
    handleSharedDocument,
    openDrawer,
    sentDocuments,
    setOpenDrawer,
    setViewerIndex,
    showNextPhoto,
    showPreviousPhoto,
    viewerIndex,
  }
}
