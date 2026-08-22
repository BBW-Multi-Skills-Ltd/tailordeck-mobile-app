const productionOrigins = [
  'https://tailordeck.com.ng',
  'https://www.tailordeck.com.ng',
  'https://tailor-deck.vercel.app',
]

const localDevelopmentOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173']

function normalizeOrigin(origin: string): string {
  return origin.replace(/\/$/, '')
}

function getAllowedOrigins(): string[] {
  const allowLocalhost =
    Deno.env.get('ALLOW_LOCALHOST_CORS') === 'true' ||
    Deno.env.get('APP_ENV') === 'development' ||
    Deno.env.get('ENVIRONMENT') === 'development'

  const configuredOrigins = [
    Deno.env.get('APP_URL'),
    ...(Deno.env.get('ALLOWED_ORIGINS') ?? '').split(','),
    ...productionOrigins,
    ...(allowLocalhost ? localDevelopmentOrigins : []),
  ]

  return [...new Set(configuredOrigins.map((origin) => normalizeOrigin(origin.trim())).filter(Boolean))]
}

export function corsHeadersForRequest(request?: Request): HeadersInit {
  const requestOrigin = request?.headers.get('origin')
  const normalizedRequestOrigin = requestOrigin ? normalizeOrigin(requestOrigin) : null
  const allowedOrigins = getAllowedOrigins()
  const responseOrigin =
    normalizedRequestOrigin && allowedOrigins.includes(normalizedRequestOrigin) ? normalizedRequestOrigin : allowedOrigins[0] ?? productionOrigins[0]

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
