import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  subtitle?: string
  leading?: ReactNode
  trailing?: ReactNode
  centered?: boolean
}

export default function PageHeader({ title, subtitle, leading, trailing, centered = false }: PageHeaderProps) {
  return (
    <header className={`td-page-header${centered ? ' centered' : ''}`}>
      <div className="td-page-header-slot">{leading}</div>
      <div className="td-page-header-copy">
        <h1 className="app-page-heading">{title}</h1>
        {subtitle ? <p className="td-page-header-subtitle">{subtitle}</p> : null}
      </div>
      <div className="td-page-header-slot">{trailing}</div>
    </header>
  )
}
