const process = {
  env: {},
}

function checkConfiguration(
  requiredVariableNames: string[],
  shouldThrow: boolean = true
): boolean {
  const missingVars: string[] = []
  for (const variable of requiredVariableNames) {
    if (process.env[variable] == null) {
      missingVars.push(variable)
    }
  }
  if (missingVars.length > 0) {
    if (shouldThrow) {
      throw new Error(
        `Missing required environment variables: [${missingVars.join(', ')}]`
      )
    }
    return false
  }
  return true
}

type HealthCheckFunction = () => boolean

function healthCheck(functions: HealthCheckFunction[]): {
  healthState: { [key: string]: string }
  state: string
} {
  const healthState: { [key: string]: string } = {}
  let overallHealthy = true

  functions.forEach((func, index) => {
    const isHealthy = func() // Execute the health check function
    const funcName = func.name || `Function${index + 1}` // Use the function name or fallback to a default name
    healthState[funcName] = isHealthy ? 'healthy' : 'unhealthy'

    if (!isHealthy) {
      overallHealthy = false
    }
  })

  return {
    healthState,
    state: overallHealthy ? 'healthy' : 'unhealthy',
  }
}

// Example usage:

const checkDBConnection = () => true // Healthy
const checkCache = () => false // Unhealthy
const checkServiceAPI = () => true // Healthy

const healthResult = healthCheck([
  checkDBConnection,
  checkCache,
  checkServiceAPI,
])

console.log(healthResult)
// Output:
// {
//     healthState: {
//         checkDBConnection: "healthy",
//         checkCache: "unhealthy",
//         checkServiceAPI: "healthy"
//     },
//     state: "unhealthy"
// }
