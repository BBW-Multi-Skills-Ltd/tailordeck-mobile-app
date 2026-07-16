import type { ElementType, HTMLAttributes, ReactNode } from 'react'

type ClayCardProps<T extends ElementType = 'section'> = {
  as?: T
  children: ReactNode
  className?: string
} & HTMLAttributes<HTMLElement>

export default function ClayCard<T extends ElementType = 'section'>({
  as,
  children,
  className,
  ...props
}: ClayCardProps<T>) {
  const Component = as ?? 'section'

  return (
    <Component className={`clay-card${className ? ` ${className}` : ''}`} {...props}>
      {children}
    </Component>
  )
}
