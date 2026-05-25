import type { ReactNode } from 'react'

interface AuthShellProps {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
  pageClassName?: string
  wrapClassName?: string
}

export default function AuthShell({ title, subtitle, children, footer, pageClassName, wrapClassName }: AuthShellProps) {
  return (
    <main className={`page-full auth-page${pageClassName ? ` ${pageClassName}` : ''}`}>
      <div className={`auth-wrap${wrapClassName ? ` ${wrapClassName}` : ''}`}>
        <div className="auth-brand">
          <div className="auth-brand-icon" aria-hidden>
            <img
              src="/Tailor%20deck%20app%20icon%20for%20phone%20screen.png"
              alt=""
              className="auth-brand-logo"
            />
          </div>
          <h1 className="auth-title">{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>
        </div>

        {children}
        {footer ? <div className="auth-footer">{footer}</div> : null}
      </div>
    </main>
  )
}
