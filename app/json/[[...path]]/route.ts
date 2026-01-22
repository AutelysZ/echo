import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

interface ClientInfo {
  ip: string
  realIp: string | null
  protocol: string
  host: string
  userAgent: string | null
}

interface EchoResponse {
  method: string
  httpVersion: string
  url: string
  pathname: string
  search: string
  query: Record<string, string>
  client: ClientInfo
  headers: Record<string, string>
  body: string
  data: unknown
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

function parseQuery(search: string): Record<string, string> {
  const query: Record<string, string> = {}
  const params = new URLSearchParams(search)
  params.forEach((value, key) => {
    if (key !== '__body') {
      query[key] = value
    }
  })
  return query
}

async function handleRequest(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url)
  const search = url.search
  const query = parseQuery(search)

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

  // Parse JSON data
  let data: unknown = null
  if (body) {
    try {
      data = JSON.parse(body)
    } catch {
      data = null
    }
  }

  const response: EchoResponse = {
    method: request.method,
    httpVersion: '1.1',
    url: request.url,
    pathname: url.pathname,
    search: search,
    query: query,
    client: getClientInfo(request),
    headers: await getHeaders(),
    body: body,
    data: data,
  }

  return NextResponse.json(response, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function GET(request: NextRequest) {
  return handleRequest(request)
}

export async function POST(request: NextRequest) {
  return handleRequest(request)
}

export async function PUT(request: NextRequest) {
  return handleRequest(request)
}

export async function PATCH(request: NextRequest) {
  return handleRequest(request)
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request)
}

export async function OPTIONS(request: NextRequest) {
  return handleRequest(request)
}
