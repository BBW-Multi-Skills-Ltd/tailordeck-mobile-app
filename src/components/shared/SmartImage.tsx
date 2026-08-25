import { useState, type ImgHTMLAttributes, type ReactNode } from 'react'

type SmartImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: string | null
  fallback?: ReactNode
  wrapperClassName?: string
}

export function SmartImage({
  alt,
  className,
  fallback,
  loading = 'lazy',
  src,
  wrapperClassName = '',
  ...props
}: SmartImageProps) {
  const [imageState, setImageState] = useState({ failed: false, loaded: false, src: '' })
  const imageSrc = src?.trim() || ''
  const loaded = imageState.src === imageSrc && imageState.loaded
  const failed = imageState.src === imageSrc && imageState.failed

  return (
    <span className={`smart-image${loaded ? ' is-loaded' : ''}${failed || !imageSrc ? ' is-failed' : ''}${wrapperClassName ? ` ${wrapperClassName}` : ''}`}>
      {imageSrc && !failed ? (
        <img
          {...props}
          alt={alt}
          className={className}
          decoding="async"
          loading={loading}
          src={imageSrc}
          onError={(event) => {
            setImageState({ failed: true, loaded: false, src: imageSrc })
            props.onError?.(event)
          }}
          onLoad={(event) => {
            setImageState({ failed: false, loaded: true, src: imageSrc })
            props.onLoad?.(event)
          }}
        />
      ) : null}
      {!loaded || failed || !imageSrc ? <span className="smart-image-fallback" aria-hidden>{fallback}</span> : null}
    </span>
  )
}
