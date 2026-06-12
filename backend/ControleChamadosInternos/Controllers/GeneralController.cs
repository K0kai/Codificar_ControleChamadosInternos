using Microsoft.AspNetCore.Mvc;

namespace ControleChamadosInternos.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GeneralController : ControllerBase
    {
        [HttpGet("health")]
        public async Task<IActionResult> CheckServerHealth()
        {
            return Ok();
        }
    }
}
