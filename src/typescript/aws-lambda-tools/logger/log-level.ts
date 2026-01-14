/**
 * Log message Severity level
 * Source: https://docs.microsoft.com/en-us/dotnet/api/microsoft.extensions.logging.loglevel?view=dotnet-plat-ext-5.0
 * 0 -   Trace - Logs that contain the most detailed messages.These messages may contain sensitive application data.
 * 1 -   Debug - Logs that are used for interactive investigation during development.
 * 2 -   Information - Logs that track the general flow of the application.These logs should have long-term value.
 * 3 -   Warning - Logs that highlight an abnormal or unexpected event in the application flow.
 * 4 -   Error - Logs that highlight when the current flow of execution is stopped due to a failure.
 * 5 -   Critical - Logs that describe an unrecoverable application or system crash, or a catastrophic failure that requires immediate attention.
 * 6 -   Alert - Explicit severity level that tells reporting framework to alert on this event
 * 100 - None - Not used for writing log messages.Specifies that a logging category should not write any messages.
 */
export enum LogLevel {
  Trace = 0,
  Debug = 1,
  Information = 2,
  Warning = 3,
  Error = 4,
  Critical = 5,
  Alert = 6,
  None = 100,
}
