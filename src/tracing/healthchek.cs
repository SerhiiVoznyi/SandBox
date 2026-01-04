using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace P4C.Authentication.API.Controllers
{
    [Route("api/[controller]")]
    public class HealthCheckController : BaseController
    {
        private readonly HealthCheckService _healthCheckService;

        public HealthCheckController(HealthCheckService healthCheckService)
        {
            _healthCheckService = healthCheckService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> Get(CancellationToken ct)
        {
            var result = await _healthCheckService.CheckHealthAsync(ct);
            return new ObjectResult(result)
            {
                StatusCode = result.Status == HealthStatus.Unhealthy ? 503 : 200
            };
        }
    }
}