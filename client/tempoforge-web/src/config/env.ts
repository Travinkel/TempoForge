const DEFAULT_API_BASE_URL = 'https://tempoforge-api.fly.dev'

export function getApiBaseUrl(): string {
  const fromEnv =
    typeof import.meta.env.VITE_API_BASE_URL === 'string'
      ? import.meta.env.VITE_API_BASE_URL.trim()
      : ''

  if (fromEnv.length === 0) {
    return DEFAULT_API_BASE_URL
  }

  return fromEnv.endsWith('/') ? fromEnv.slice(0, -1) : fromEnv
}

export const API_BASE_URL = getApiBaseUrl()
