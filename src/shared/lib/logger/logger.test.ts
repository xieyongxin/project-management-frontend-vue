import { describe, expect, it, vi } from 'vitest'

describe('logger redaction', () => {
  it('redacts sensitive context before writing', async () => {
    const errorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    vi.resetModules()
    const { logger } = await import('./logger')

    logger.error('failed', {
      token: 'secret',
      nested: { password: 'hidden', safe: 'visible' },
    })

    expect(errorSpy).toHaveBeenCalledWith('failed', {
      token: '[REDACTED]',
      nested: { password: '[REDACTED]', safe: 'visible' },
    })
  })
})
