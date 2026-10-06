import { isRecoverableChunkError, recoverFromStaleAppShell } from '../../lib/appRecovery'

// Below this share of the full page width, a one-page document is too small to read comfortably.
const MIN_ONE_PAGE_SCALE = 0.7

export async function buildJobDocumentPdfBlob(docPreviewNode: HTMLDivElement | null): Promise<Blob | null> {
  if (!docPreviewNode) return null

  const documentNode = docPreviewNode.querySelector<HTMLElement>('.doc-landscape-root') ?? docPreviewNode
  const captureNode = createOffscreenCaptureNode(documentNode)

  const [{ default: html2canvas }, { default: jsPDF }] = await loadPdfDependencies()

  try {
    await waitForDocumentAssets(captureNode)

    const canvas = await html2canvas(captureNode, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      onclone: (clonedDoc) => {
        clonedDoc.querySelectorAll('.job-doc-ui-title').forEach((node) => node.remove())
      },
    })

    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 6
    const usableWidth = pageWidth - margin * 2
    const usableHeight = pageHeight - margin * 2
    const fitRatio = Math.min(usableWidth / canvas.width, usableHeight / canvas.height)
    const fullWidthRatio = usableWidth / canvas.width

    // Normal documents keep the one-page layout. Long ones (many items) would shrink until unreadable,
    // so they continue onto extra pages at full width instead.
    if (fitRatio >= fullWidthRatio * MIN_ONE_PAGE_SCALE) {
      const width = canvas.width * fitRatio
      const height = canvas.height * fitRatio
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', (pageWidth - width) / 2, (pageHeight - height) / 2, width, height)
      return pdf.output('blob')
    }

    const sliceHeightPx = Math.floor(usableHeight / fullWidthRatio)
    for (let top = 0, page = 0; top < canvas.height; top += sliceHeightPx, page += 1) {
      const slice = document.createElement('canvas')
      slice.width = canvas.width
      slice.height = Math.min(sliceHeightPx, canvas.height - top)
      slice.getContext('2d')?.drawImage(canvas, 0, top, canvas.width, slice.height, 0, 0, canvas.width, slice.height)
      if (page > 0) pdf.addPage()
      pdf.addImage(slice.toDataURL('image/png'), 'PNG', margin, margin, usableWidth, slice.height * fullWidthRatio)
    }
    return pdf.output('blob')
  } finally {
    captureNode.parentElement?.remove()
  }
}

async function loadPdfDependencies() {
  try {
    return await Promise.all([import('html2canvas'), import('jspdf')])
  } catch (error) {
    if (isRecoverableChunkError(error) && (await recoverFromStaleAppShell(error))) {
      return new Promise<never>(() => undefined)
    }
    throw error
  }
}

function createOffscreenCaptureNode(documentNode: HTMLElement): HTMLElement {
  const host = document.createElement('div')
  const clone = documentNode.cloneNode(true) as HTMLElement
  const width = documentNode.scrollWidth || documentNode.offsetWidth

  host.style.position = 'fixed'
  host.style.left = '-10000px'
  host.style.top = '0'
  host.style.width = `${width}px`
  host.style.background = '#ffffff'
  host.style.pointerEvents = 'none'
  host.style.zIndex = '-1'

  clone.style.width = `${width}px`
  clone.style.maxWidth = 'none'
  clone.style.transform = 'none'
  clone.style.transformOrigin = 'top left'

  host.appendChild(clone)
  document.body.appendChild(host)
  return clone
}

async function waitForDocumentAssets(documentNode: HTMLElement): Promise<void> {
  const imagePromises = Array.from(documentNode.querySelectorAll('img')).map((image) => waitForImage(image))
  const fontReady = 'fonts' in document ? document.fonts.ready.catch(() => undefined) : Promise.resolve()
  await Promise.race([
    Promise.all([...imagePromises, fontReady]),
    new Promise((resolve) => window.setTimeout(resolve, 1800)),
  ])
}

function waitForImage(image: HTMLImageElement): Promise<void> {
  if (image.complete && image.naturalWidth > 0) return Promise.resolve()
  if (typeof image.decode === 'function') {
    return image.decode().catch(() => undefined)
  }
  return new Promise((resolve) => {
    const finish = () => resolve()
    image.addEventListener('load', finish, { once: true })
    image.addEventListener('error', finish, { once: true })
  })
}
