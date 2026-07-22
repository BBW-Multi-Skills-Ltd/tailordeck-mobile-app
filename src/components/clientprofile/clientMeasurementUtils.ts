export function blockKey(jobId: string, personId?: string): string {
  return personId ? `${jobId}:${personId}` : `${jobId}:non-body`
}

export function toTitleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}
