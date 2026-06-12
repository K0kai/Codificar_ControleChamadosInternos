using _Codificar_ControleChamadosInternos.Services;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace _Codificar_ControleChamadosInternos.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TicketController : ControllerBase
    {
        private readonly TicketService ticketService;

        public TicketController(TicketService ticketService)
        {
            this.ticketService = ticketService;
        }

        [HttpGet]
        public async Task<IActionResult> GetTickets()
        {
            try
            {
                var tickets = await ticketService.GetTickets();
                return Ok(tickets);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public IActionResult CreateTicket([FromBody] TicketCreateRequest request)
        {
            try
            {
                ticketService.CreateTicket(request);
                return Created();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTicket(int id)
        {
            try
            {
                var ticket = await ticketService.GetById(id);
                return Ok(ticket);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public IActionResult EditTicket(int id, [FromBody] TicketUpdateRequest request)
        {
            try
            {
                ticketService.EditTicket(id, request);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPatch("{id}/status")]
        public IActionResult UpdateTicketStatus(int id, [FromBody] TicketStatusRequest request)
        {
            try
            {
                ticketService.UpdateTicketStatus(id, request.Status);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        //ENDPOINT DESIGNED SPECIFICALLY FOR FRONTEND

        [HttpGet("metrics")]
        public async Task<IActionResult> GetMetrics()
        {
            try
            {
                var (highPriorityTickets, closedTickets, openTickets, totalTickets) = await ticketService.GetMetrics();
                return Ok(new { highPriorityTickets, closedTickets, openTickets, totalTickets });

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("count")]
        public async Task<IActionResult> CountTickets([FromQuery] string? statusesAsString, [FromQuery] int? priority)
        {
            try
            {
                var options = new CountTicketsOptions
                {
                    Priority = priority
                };

                if (!string.IsNullOrWhiteSpace(statusesAsString))
                {
                    int[] statuses = [.. statusesAsString.Split(',').Select(int.Parse)];
                    options.Status = statuses;
                }                
                var resp = await ticketService.CountTickets(options);
                return Ok(resp);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchTickets([FromQuery] string? palavraChave, [FromQuery] int? idResponsavel, [FromQuery] string? prioridade, [FromQuery] string? status, [FromQuery] int? page)
        {
            try
            {
                var queryRequest = new TicketQueryRequest
                {
                    Keyword = palavraChave,
                    TechnicianId = idResponsavel,
                    Priority = prioridade,
                    IssueDate = null,
                    CloseDate = null,
                    Status = status,
                    Page = page ?? 1
                };
                var tickets = await ticketService.FilterTickets(queryRequest);
                Debug.WriteLine(tickets.Tickets.Length);
                return Ok(tickets);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return BadRequest(ex.Message);
            }
        }
    }

    public class TicketStatusRequest
    {
        public string Status { get; set; } = null!;
    }
}


