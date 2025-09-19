export const FALLBACK_API_BASE = 'https://tempoforge-api.fly.dev'

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

