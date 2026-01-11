# Simple Logger

## Intro

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
