type LogLevel = 'debug' | 'info' | 'warn' | 'error'
type LogContext = Record<string, unknown>
type LogSink = (level: LogLevel, message: string, context?: LogContext) => void

const sensitiveKeyPattern =
  /password|token|cookie|authorization|secret|credential|session/i

const redactValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(redactValue)
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [
        key,
        sensitiveKeyPattern.test(key) ? '[REDACTED]' : redactValue(entryValue),
      ]),
    )
  }

  return value
}

const defaultSink: LogSink = (level, message, context) => {
  if (import.meta.env.PROD && level === 'debug') {
    return
  }

  const payload = context ? [message, redactValue(context)] : [message]

  if (level === 'warn') {
    console.warn(...payload)
    return
  }

  if (level === 'error') {
    console.error(...payload)
    return
  }

  if (import.meta.env.DEV) {
    console[level](...payload)
  }
}

const createLogger = (sink: LogSink = defaultSink) => ({
  debug: (message: string, context?: LogContext) =>
    sink('debug', message, context),
  info: (message: string, context?: LogContext) =>
    sink('info', message, context),
  warn: (message: string, context?: LogContext) =>
    sink('warn', message, context),
  error: (message: string, context?: LogContext) =>
    sink('error', message, context),
})

export const logger = createLogger()
