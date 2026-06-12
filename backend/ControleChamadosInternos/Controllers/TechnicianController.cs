using _Codificar_ControleChamadosInternos.DB;
using _Codificar_ControleChamadosInternos.Objects;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace _Codificar_ControleChamadosInternos.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TechnicianController : ControllerBase
    {
        private readonly AppDbContext db;

        public TechnicianController(AppDbContext db)
        {
            this.db = db;
        }

        [HttpGet]
        public async Task<IActionResult> ListTechnicians()
        {
            var technicians = await db.Technicians
                .Select(t => 
                new Technician
                {
                    Id = t.Id,
                    Name = t.Name,
                    Icon = t.Icon,
                    OpenTickets = db.Tickets.Count(ticket => ticket.TechnicianId == t.Id && ticket.Status == StatusTicket.Aberto || ticket.Status == StatusTicket.EmAndamento)
                })
                .OrderBy(t => t.Name)
                .ToArrayAsync();

            return Ok(technicians);
        }
    }
}
