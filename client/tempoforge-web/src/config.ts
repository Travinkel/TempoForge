const REMOTE_API_BASE = 'https://tempoforge-api.fly.dev'
const LOCAL_API_BASE = 'http://localhost:5000'

const inferFallbackBase = (): string => {
  if (typeof window !== 'undefined') {
    const { hostname } = window.location

    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
      return LOCAL_API_BASE
    }
  }

  return REMOTE_API_BASE
}

export const FALLBACK_API_BASE = inferFallbackBase()

function normalizeBaseUrl(value: unknown): string {
  if (typeof value !== 'string') {
    return FALLBACK_API_BASE
  }

  const trimmed = value.trim()

  if (trimmed.length === 0) {
    return FALLBACK_API_BASE
  }

  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed
}

export const API_BASE = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL)

