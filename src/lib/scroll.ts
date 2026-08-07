const PAGE_SCROLL_CONTAINERS = ['main.page', 'main.page-full', '#root']

export function scrollAppToTop(behavior: ScrollBehavior = 'auto'): void {
  if (typeof window === 'undefined') return

  const scroll = () => {
    window.scrollTo({ top: 0, left: 0, behavior })
    document.scrollingElement?.scrollTo({ top: 0, left: 0, behavior })

    PAGE_SCROLL_CONTAINERS.forEach((selector) => {
      document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
        element.scrollTo({ top: 0, left: 0, behavior })
      })
    })
  }

  scroll()
  window.requestAnimationFrame(scroll)
  window.setTimeout(scroll, 40)
}

export function scrollFirstFormErrorIntoView(scopeSelector?: string): void {
  if (typeof window === 'undefined') return

  window.setTimeout(() => {
    const scope = scopeSelector ? document.querySelector(scopeSelector) : document
    const target = scope?.querySelector<HTMLElement>(
      '.input-invalid, .input-invalid-wrap, .input-error-text, [aria-invalid="true"]',
    )
    target?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
  }, 80)
}
