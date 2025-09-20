import { vi } from 'vitest'
import http from '../http'
import { API_BASE } from '../../config'

describe('shared http client', () => {
  it('uses the configured base URL and JSON header', () => {
    expect(http.defaults.baseURL).toBe(API_BASE)
    expect(http.defaults.headers.common['Content-Type']).toBe('application/json')
  })

  it('logs failed requests in development environments', async () => {
    const handlers = (http.interceptors.response as unknown as {
      handlers: Array<{ rejected?: (reason: unknown) => unknown }>
    }).handlers

    const rejectHandler = handlers[0]?.rejected
    expect(typeof rejectHandler).toBe('function')

    const originalDev = import.meta.env.DEV
    ;(import.meta.env as unknown as Record<string, unknown>).DEV = true

    const error = new Error('boom')
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect((rejectHandler as (reason: unknown) => unknown)(error)).rejects.toThrow(error)
    expect(consoleSpy).toHaveBeenCalledWith('API request failed', error)

    consoleSpy.mockRestore()
    ;(import.meta.env as unknown as Record<string, unknown>).DEV = originalDev
  })
})
