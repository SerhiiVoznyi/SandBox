export const executeWithRetry = async (
  func: () => Promise<any>,
  retries: number = 3,
  baseDelayMs: number = 1000,
  maxDelayMs: number = 10000
): Promise<any> => {
  let attempt = 1
  let currentRetries = retries
  let exception: Error | null = null
  do {
    try {
      return await func()
    } catch (ex) {
      exception = ex as Error
      if (ex instanceof NonRetryableException) {
        throw ex
      }
    }

    if (--currentRetries > 0) {
      const delay = Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs)
      await new Promise((resolve) => setTimeout(resolve, delay))
      attempt++
    }
  } while (currentRetries > 0)
  if (exception != null) {
    throw exception
  }
}
