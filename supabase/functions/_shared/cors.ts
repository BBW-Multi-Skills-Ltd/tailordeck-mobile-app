const fallbackLocalOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173']

function normalizeOrigin(origin: string): string {
  return origin.replace(/\/$/, '')
}

function getAllowedOrigins(): string[] {
  const configuredOrigins = [
    Deno.env.get('APP_URL'),
    ...(Deno.env.get('ALLOWED_ORIGINS') ?? '').split(','),
    ...fallbackLocalOrigins,
  ]

  return configuredOrigins.map((origin) => normalizeOrigin(origin.trim())).filter(Boolean)
}

export function corsHeadersForRequest(request?: Request): HeadersInit {
  const requestOrigin = request?.headers.get('origin')
  const normalizedRequestOrigin = requestOrigin ? normalizeOrigin(requestOrigin) : null
  const allowedOrigins = getAllowedOrigins()
  const responseOrigin =
    normalizedRequestOrigin && allowedOrigins.includes(normalizedRequestOrigin) ? normalizedRequestOrigin : allowedOrigins[0] ?? fallbackLocalOrigins[0]

  return {
    ...baseCorsHeaders,
    'Access-Control-Allow-Origin': responseOrigin,
    Vary: 'Origin',
  }
}

const baseCorsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

export function jsonResponse(body: unknown, status = 200, request?: Request): Response {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeadersForRequest(request), 'Content-Type': 'application/json' },
    status,
  })
}

export function handleOptions(request: Request): Response | null {
  return request.method === 'OPTIONS' ? new Response('ok', { headers: corsHeadersForRequest(request) }) : null
}
