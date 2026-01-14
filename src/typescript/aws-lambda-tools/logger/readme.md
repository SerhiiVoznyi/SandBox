# Simple Logger

## Intro

In AWS Lambda, logging should be designed around the fact that executions are short-lived, parallel, and can be killed at any moment, so the best pattern is hybrid logging: keep a few always-on, minimal “breadcrumb” logs written directly to console.log to show high-level progress that survives crashes and timeouts, while buffering rich, structured logs in memory during the invocation and only flushing them to CloudWatch on errors; this gives you near-zero cost and overhead on successful runs, full context when something fails, and still preserves enough trace when Lambda is terminated before your code can catch an exception.

- `console.log` is slow in Lambda (network flush)
- too many logs = higher Lambda duration + CloudWatch cost
- logs can be lost if Lambda crashes before flush
- ordering is not guaranteed between parallel Lambdas

### 1. Where logs come from?

Anything that runs in AWS (Lambda, ECS, EC2, EKS, API Gateway, ALB, etc.) ultimately does:

- writes to stdout
- writes to stderr
- or writes to a local log file
  That’s it.

Examples:

Lambda: `console.log()` (Node), `Console.WriteLine()` (.NET), `print()` (Python)
Docker containers: `STDOUT / STDERR`
EC2 apps: files like `/var/log/...`

### 2. How Lambda logs reach CloudWatch

Lambda runtime is wrapped by AWS.
Inside every Lambda execution environment there is a log collector:

```pgsql
Your code
   ↓
STDOUT / STDERR
   ↓
Lambda runtime
   ↓
Lambda log agent
   ↓
CloudWatch Logs API
   ↓
Log Group + Log Stream
```

When you do:

```js
console.log('hello')
```

it is literally written to `STDOUT`.
AWS runtime captures that stream and pushes it to CloudWatch Logs.

You don’t need credentials.
You don’t need a library.
The Lambda service uses its own IAM role to write logs.

That’s why every Lambda must have:

```nginx
AWSLambdaBasicExecutionRole
→ logs:CreateLogGroup
→ logs:CreateLogStream
→ logs:PutLogEvents
```
