import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

type RouteParams = {
  params: Promise<{
    parts?: string[]
  }>
}

interface ClientInfo {
  ip: string
  realIp: string | null
  protocol: string
  host: string
  userAgent: string | null
}

function getClientInfo(request: NextRequest): ClientInfo {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = forwardedFor ? forwardedFor.split(',')[0].trim() : null
  const ip = request.headers.get('x-real-ip') || realIp || '127.0.0.1'
  const protocol = request.headers.get('x-forwarded-proto') || 'http'
  const host = request.headers.get('host') || 'localhost'
  const userAgent = request.headers.get('user-agent')

  return {
    ip,
    realIp,
    protocol,
    host,
    userAgent,
  }
}

async function getHeaders(): Promise<Record<string, string>> {
  const headersList = await headers()
  const result: Record<string, string> = {}
  headersList.forEach((value, key) => {
    result[key] = value
  })
  return result
}

async function handleRequest(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { parts } = await params
  const partsStr = parts?.[0]

  // Only /raw/h and /raw/b are special, everything else prints all
  let requestedParts: Set<string>
  if (partsStr === 'h') {
    requestedParts = new Set(['h'])
  } else if (partsStr === 'b') {
    requestedParts = new Set(['b'])
  } else {
    // Default to all parts for /raw or /raw/anything-else
    requestedParts = new Set(['c', 'h', 'b'])
  }

  const url = new URL(request.url)
  const search = url.search

  // Get body - check for __body override for GET requests
  let body = ''
  const bodyOverride = url.searchParams.get('__body')

  if (bodyOverride !== null) {
    body = bodyOverride
  } else if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      body = await request.text()
    } catch {
      body = ''
    }
  }

  // Raw format - HTTP request format
  const lines: string[] = []
  const headersMap = await getHeaders()
  const client = getClientInfo(request)

  // Request line
  lines.push(`${request.method} ${url.pathname}${search} HTTP/1.1`)

  // Client info as pseudo-headers
  if (requestedParts.has('c')) {
    lines.push(`X-Client-IP: ${client.ip}`)
    if (client.realIp) {
      lines.push(`X-Real-IP: ${client.realIp}`)
    }
    lines.push(`X-Protocol: ${client.protocol}`)
    lines.push(`X-Host: ${client.host}`)
    if (client.userAgent) {
      lines.push(`X-User-Agent: ${client.userAgent}`)
    }
  }

  // Headers
  if (requestedParts.has('h')) {
    for (const [key, value] of Object.entries(headersMap)) {
      // Capitalize header names
      const headerName = key
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('-')
      lines.push(`${headerName}: ${value}`)
    }
  }

  // Body - separated by blank line per HTTP spec
  if (requestedParts.has('b')) {
    lines.push('')
    lines.push(body)
  }

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}

export async function GET(request: NextRequest, context: RouteParams) {
  return handleRequest(request, context)
}

export async function POST(request: NextRequest, context: RouteParams) {
  return handleRequest(request, context)
}

export async function PUT(request: NextRequest, context: RouteParams) {
  return handleRequest(request, context)
}

export async function PATCH(request: NextRequest, context: RouteParams) {
  return handleRequest(request, context)
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  return handleRequest(request, context)
}

export async function OPTIONS(request: NextRequest, context: RouteParams) {
  return handleRequest(request, context)
}
