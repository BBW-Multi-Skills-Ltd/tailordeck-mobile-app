export type ImageCompressionOptions = {
  maxDimension?: number
  maxBytes?: number
  initialQuality?: number
  minQuality?: number
}

const DEFAULT_MAX_DIMENSION = 1280
const DEFAULT_MAX_BYTES = 1_200_000
const DEFAULT_INITIAL_QUALITY = 0.78
const DEFAULT_MIN_QUALITY = 0.48

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Unable to compress image.'))
    }, type, quality)
  })
}

function getTargetSize(width: number, height: number, maxDimension: number): { width: number; height: number } {
  const largestSide = Math.max(width, height)
  if (largestSide <= maxDimension) return { width, height }

  const scale = maxDimension / largestSide
  return {
    height: Math.round(height * scale),
    width: Math.round(width * scale),
  }
}

function compressedFileName(fileName: string): string {
  const cleanName = fileName.replace(/\.[^.]+$/, '')
  return `${cleanName || 'reference-photo'}.jpg`
}

export async function compressImageFile(file: File, options: ImageCompressionOptions = {}): Promise<File> {
  if (!file.type.startsWith('image/')) return file
  if (typeof createImageBitmap === 'undefined' || typeof document === 'undefined') return file

  const maxDimension = options.maxDimension ?? DEFAULT_MAX_DIMENSION
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES
  const minQuality = options.minQuality ?? DEFAULT_MIN_QUALITY
  let quality = options.initialQuality ?? DEFAULT_INITIAL_QUALITY

  const bitmap = await createImageBitmap(file)
  const targetSize = getTargetSize(bitmap.width, bitmap.height, maxDimension)
  const canvas = document.createElement('canvas')
  canvas.width = targetSize.width
  canvas.height = targetSize.height

  const context = canvas.getContext('2d')
  if (!context) return file

  context.drawImage(bitmap, 0, 0, targetSize.width, targetSize.height)
  bitmap.close?.()

  let blob = await canvasToBlob(canvas, 'image/jpeg', quality)
  while (blob.size > maxBytes && quality > minQuality) {
    quality = Math.max(minQuality, quality - 0.1)
    blob = await canvasToBlob(canvas, 'image/jpeg', quality)
  }

  if (blob.size >= file.size && file.size <= maxBytes) return file

  return new File([blob], compressedFileName(file.name), {
    lastModified: Date.now(),
    type: 'image/jpeg',
  })
}
