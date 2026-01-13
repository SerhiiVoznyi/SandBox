import { APIGatewayProxyEvent } from 'aws-lambda'
import { v4 as uuidv4 } from 'uuid'
import { LogLevel, LogRecord, LogTraceData } from '../'
import { isNullOrUndefined } from '../utils/validation'

export const LambdaTraceHeaderKey = '_X_AMZN_TRACE_ID'
export const PropertiesRegExp = /\{@.*?\}/g

export interface LpLoggerConfig {
  traceId?: string
  logAsSingleString?: boolean
  requestContext?: any
}
export class LpLogger {
  private static _traceData: LogTraceData
  private static _minLogLevel: LogLevel
  private static _logAsSingleString: boolean

  private static readonly _sensitiveHeaders = new Set([
    'authorization',
    'cookie',
    'cookies',
    'x-cloudfront-silverline-psk',
  ])

  private static readonly _sensitiveParameters = new Set(['search'])

  public getState(): LogTraceData {
    return LpLogger._traceData
  }

  static setDefault(): void {
    this._minLogLevel =
      LogLevel[process.env.MIN_LOG_LEVEL as keyof typeof LogLevel] ??
      LogLevel.Information
    this._traceData = new LogTraceData()
    this._logAsSingleString = false
  }

  static readonly setup = (
    serviceName: string,
    config: LpLoggerConfig
  ): void => {
    this._minLogLevel =
      LogLevel[process.env.MIN_LOG_LEVEL as keyof typeof LogLevel] ??
      LogLevel.Information
    this._traceData = {
      requestId: config?.requestContext?.requestId,
      serviceName,
      traceId:
        config?.traceId ??
        process.env[LambdaTraceHeaderKey] ??
        `[GENERATED]${uuidv4()}`,
      userLoginCode: config?.requestContext?.authorizer?.User,
    }
    this._logAsSingleString = config?.logAsSingleString ?? false
  }

  static readonly info = (message: string): void =>
    this.writeLog(LogLevel.Information, message)

  static readonly error = (ex: any): void =>
    this.writeLog(LogLevel.Error, 'An exception has occurred.', ex)

  static logEvent(event: APIGatewayProxyEvent): void {
    this.log(
      LogLevel.Information,
      'Request event:',
      this.createSanitizedTrace(event)
    )
  }

  static log(level: LogLevel, message: string, object?: any): void {
    this.writeLog(level, message, object)
  }

  static writeLog(level: LogLevel, message: string, object?: any): void {
    if (level < this._minLogLevel) {
      return
    }
    const record = this.getLogRecord(level, message, object)

    const logMessage: any = this._logAsSingleString
      ? JSON.stringify(record).replaceAll(/(?:\r\n|\r|\n)/g, ' ')
      : record

    switch (+level) {
      case LogLevel.Trace:
        console.trace(logMessage)
        break
      case LogLevel.Warning:
        console.warn(logMessage)
        break
      case LogLevel.Error:
        console.error(logMessage)
        break
      default:
        console.log(logMessage)
        break
    }
  }

  static getLogRecord(
    level: LogLevel,
    message: string,
    details?: any
  ): LogRecord {
    const record: any = {
      severity: LogLevel[level],
      message,
      level,
      timestamp: new Date().toISOString(),
      trace: this._traceData ?? {},
      details: {},
    }

    if (!isNullOrUndefined(details)) {
      const type = typeof details
      switch (type) {
        case 'string':
          record.details.message = details
          break
        case 'object': {
          const sanitized: any = LpLogger.sanitizeObject(details)
          if (Object.getPrototypeOf(sanitized) === Object.prototype) {
            for (const key of Object.getOwnPropertyNames(sanitized)) {
              record.details[key] = sanitized[key]
            }
          } else {
            record.details.value = sanitized
          }
          break
        }
        default:
          record.details.value = LpLogger.sanitizeObject(details)
          break
      }
    }

    return record
  }

  static sanitizeObject(obj: any): any {
    if (obj == null || typeof obj !== 'object') {
      return obj
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item))
    }

    if (Object.getPrototypeOf(obj) !== Object.prototype) {
      return obj
    }

    const result: any = {}
    for (const key of Object.getOwnPropertyNames(obj)) {
      const property: any =
        this._sensitiveHeaders.has(key.toLowerCase()) ||
        this._sensitiveParameters.has(key.toLowerCase())
          ? 'MASKED'
          : obj[key]

      if (typeof property === 'object' && property !== null) {
        result[key] = this.sanitizeObject(property)
      } else {
        result[key] = property
      }
    }

    return result
  }

  static sanitizeHeaders(headers: StringMap): StringMap {
    const headersClone: StringMap = {}
    Object.keys(headers).forEach((key) => {
      headersClone[key] = this._sensitiveHeaders.has(key.toLowerCase())
        ? 'MASKED'
        : headers[key]
    })
    return headersClone
  }

  static sanitizeQueryStringParameters(
    queries: StringMap | undefined
  ): StringMap {
    const clone: StringMap = {}
    if (queries == null) {
      return clone
    }

    Object.keys(queries).forEach((key) => {
      clone[key] = this._sensitiveParameters.has(key.toLowerCase())
        ? 'MASKED'
        : queries[key]
    })
    return clone
  }

  static createSanitizedTrace(event: any): StringMap {
    const {
      path,
      httpMethod,
      queryStringParameters,
      headers,
      resource,
      requestContext,
    } = structuredClone(event)

    return {
      httpMethod,
      path,
      resource,
      queryStringParameters: this.sanitizeQueryStringParameters(
        queryStringParameters
      ),
      requestContext,
      headers: this.sanitizeHeaders(headers),
    }
  }
}
