export async function buildJobDocumentPdfBlob(docPreviewNode: HTMLDivElement | null): Promise<Blob | null> {
  if (!docPreviewNode) return null

  const documentNode = docPreviewNode.querySelector<HTMLElement>('.doc-landscape-root') ?? docPreviewNode
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
    await waitForDocumentAssets(documentNode)

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
