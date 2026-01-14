/**
 * Trace Date type is describe the minimum params required for log record tracing
 * - traceId - unique log session id. Helps distinguish log records between lambda executions.
 */
export type TraceData = {
  [key: string]: string
  traceId: string
}
