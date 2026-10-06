/** Rows per page for long lists (jobs, clients). Each request fetches one extra row to know if more exist. */
export const LIST_PAGE_SIZE = 50

export type ListPage<T> = { items: T[]; nextOffset: number | null }

export function toListPage<TRow, TItem>(rows: TRow[], offset: number, map: (row: TRow) => TItem): ListPage<TItem> {
  return {
    items: rows.slice(0, LIST_PAGE_SIZE).map(map),
    nextOffset: rows.length > LIST_PAGE_SIZE ? offset + LIST_PAGE_SIZE : null,
  }
}

/** `%term%` for a case-insensitive "contains" search, with LIKE wildcards in the user's text escaped. */
export function toIlikeTerm(search?: string): string | null {
  const term = search?.trim()
  if (!term) return null
  return `%${term.replace(/[\\%_]/g, (char) => `\\${char}`)}%`
}
