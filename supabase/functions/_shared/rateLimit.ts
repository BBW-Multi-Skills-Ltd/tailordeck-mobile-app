export class RateLimitError extends Error {
  status = 429
}

type RateLimitClient = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        eq: (column: string, value: string) => {
          maybeSingle: () => Promise<{ data: { window_start: string; request_count: number } | null; error: Error | null }>
        }
      }
    }
    upsert: (row: Record<string, unknown>, options?: Record<string, unknown>) => Promise<{ error: Error | null }>
    update: (row: Record<string, unknown>) => {
      eq: (column: string, value: string) => {
        eq: (column: string, value: string) => Promise<{ error: Error | null }>
      }
    }
  }
}

export function isRateLimitError(error: unknown): error is RateLimitError {
  return error instanceof RateLimitError
}

export async function enforceRateLimit({
  action,
  actorId,
  admin,
  limit,
  windowSeconds,
}: {
  action: string
  actorId: string
  admin: RateLimitClient
  limit: number
  windowSeconds: number
}) {
  const now = new Date()
  const { data, error } = await admin
    .from('edge_rate_limits')
    .select('window_start, request_count')
    .eq('action', action)
    .eq('actor_id', actorId)
    .maybeSingle()

  if (error) throw error

  const isInsideWindow = data && now.getTime() - new Date(data.window_start).getTime() < windowSeconds * 1000

  if (isInsideWindow && data.request_count >= limit) {
    throw new RateLimitError('Too many attempts. Please wait before trying again.')
  }

  if (isInsideWindow) {
    const { error: updateError } = await admin
      .from('edge_rate_limits')
      .update({
        request_count: data.request_count + 1,
        updated_at: now.toISOString(),
      })
      .eq('action', action)
      .eq('actor_id', actorId)

    if (updateError) throw updateError
    return
  }

  const { error: upsertError } = await admin.from('edge_rate_limits').upsert(
    {
      action,
      actor_id: actorId,
      request_count: 1,
      updated_at: now.toISOString(),
      window_start: now.toISOString(),
    },
    { onConflict: 'action,actor_id' },
  )

  if (upsertError) throw upsertError
}
