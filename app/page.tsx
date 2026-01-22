"use client"

import React from "react"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

function useOrigin() {
  const [origin, setOrigin] = useState("")

  if (typeof window !== "undefined" && !origin) {
    setOrigin(window.location.origin)
  }

  return origin || "https://example.com"
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-md hover:bg-muted-foreground/20 transition-colors"
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
  )
}

export default function HomePage() {
  const origin = useOrigin()

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <header className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground">
            Echo Server
          </h1>
          <p className="text-lg text-muted-foreground text-balance">
            A simple HTTP request inspector that echoes back your requests.
            Perfect for debugging webhooks, testing API clients, and inspecting HTTP traffic.
          </p>
        </header>

        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-foreground">How to Use</h2>
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <QuickLink href="/json" title="/json" description="Returns all request data as JSON (method, URL, query, client, headers, body, data)" origin={origin} />
                <QuickLink href="/raw" title="/raw" description="Returns request in raw HTTP format. Use /raw/h for headers only, /raw/b for body only" origin={origin} />
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-foreground">Special Parameters</h3>
                <p className="text-muted-foreground">
                  Use <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">__body</code> query parameter to override the body for GET requests.
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-16 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>Built for developers who need to debug HTTP requests quickly.</p>
        </footer>
      </div>
    </main>
  )
}

function QuickLink({
  href,
  title,
  description,
  origin,
}: {
  href: string
  title: string
  description: string
  origin: string
}) {
  const fullUrl = `${origin}${href}`

  return (
    <div className="group rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent hover:border-accent">
      <div className="flex items-start justify-between">
        <a href={href} className="flex-1">
          <h3 className="font-semibold text-card-foreground group-hover:text-accent-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground group-hover:text-accent-foreground/70">{description}</p>
        </a>
        <CopyButton text={fullUrl} />
      </div>
      <a href={href}>
        <code className="mt-2 inline-block font-mono text-xs text-muted-foreground group-hover:text-accent-foreground/80">
          {href}
        </code>
      </a>
    </div>
  )
}
