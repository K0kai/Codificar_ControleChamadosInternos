using _Codificar_ControleChamadosInternos.DB;
using _Codificar_ControleChamadosInternos.Objects;
using Microsoft.EntityFrameworkCore;
using System.Net.WebSockets;

namespace _Codificar_ControleChamadosInternos.Services
{
    public class TicketService
    {
        private readonly AppDbContext _db;

        public TicketService(AppDbContext db)
        {
            _db = db;
        }

        public void CreateTicket(TicketCreateRequest request)
        {
            if (request.TechnicianId <= 0)
            {
                _ = _db.Technicians
                    .Select(r => new
                    {
                        r.Id,
                        r.Name,
                        TicketsAbertos = _db.Tickets.Count(c =>
                            c.TechnicianId == r.Id &&
                            (c.Status == StatusTicket.Aberto || c.Status == StatusTicket.EmAndamento))
                    })
                    .OrderBy(r => r.TicketsAbertos)
                    .FirstOrDefault() is { } freeTechnician
                    ? request.TechnicianId = freeTechnician.Id
                    : throw new Exception("Nenhum responsável disponível");
            }

            var technician = _db.Technicians.Find(request.TechnicianId) ?? throw new Exception("Responsável não encontrado");

            var ticket = new Ticket
            {
                Title = request.Title,
                Description = request.Description,
                Requester = request.Requester,
                Priority = Enum.Parse<Priority>(request.Priority, true),
                Status = StatusTicket.Aberto,
                TechnicianId = request.TechnicianId,
                TechnicianName = technician.Name
            };
            _db.Tickets.Add(ticket);
            _db.SaveChanges();
        }

        public void EditTicket(int id, TicketUpdateRequest request)
        {
            var ticket = _db.Tickets.Find(id) ?? throw new Exception("Chamado não encontrado");
            var technician = _db.Technicians.Find(request.TechnicianId) ?? throw new Exception("Responsável não encontrado");

            ticket.Title = request.Title;
            ticket.Description = request.Description;
            ticket.Requester = request.Requester;
            ticket.Priority = Enum.Parse<Priority>(request.Priority, true);
            ticket.Status = Enum.Parse<StatusTicket>(request.Status, true);
            ticket.TechnicianId = request.TechnicianId;
            ticket.TechnicianName = technician.Name;

            if (ticket.Status == StatusTicket.Resolvido || ticket.Status == StatusTicket.Fechado)
                ticket.CloseDate ??= DateTimeOffset.Now;
            else
                ticket.CloseDate = null;

            _db.SaveChanges();
        }

        public void UpdateTicketStatus(int id, string novoStatus)
        {
            var ticket = _db.Tickets.Find(id) ?? throw new Exception("Chamado não encontrado");
            ticket.Status = Enum.Parse<StatusTicket>(novoStatus, true);
            if (ticket.Status == StatusTicket.Resolvido || ticket.Status == StatusTicket.Fechado)
                ticket.CloseDate = DateTimeOffset.Now;
            _db.SaveChanges();
        }

        public async Task<Ticket[]> GetTickets()
        {
            return [.. _db.Tickets];
        }

        public async Task<(int highPriorityTickets, int closedTickets, int openTickets, int totalTickets)> GetMetrics()
        {
            var metrics = await _db.Tickets
       .GroupBy(_ => 1)
       .Select(g => new
       {
           HighPriorityTickets = g.Count(t => t.Priority == Priority.Alta),
           OpenTickets = g.Count(t =>
               t.Status == StatusTicket.Aberto ||
               t.Status == StatusTicket.EmAndamento),
           ClosedTickets = g.Count(t =>
               t.Status == StatusTicket.Resolvido ||
               t.Status == StatusTicket.Fechado),
           TotalTickets = g.Count()
       })
       .FirstOrDefaultAsync();

            return (
                metrics?.HighPriorityTickets ?? 0,
                metrics?.ClosedTickets ?? 0,
                metrics?.OpenTickets ?? 0,
                metrics?.TotalTickets ?? 0
            );
        }

        public async Task<int> CountTickets(CountTicketsOptions options)
        {
            var query = _db.Tickets.AsQueryable();

            if (options.Status != null && options.Status.Length > 0)
            {
                query = query.Where(t => options.Status.Contains((int)t.Status));
            }

            if (options.Priority > 0)
            {
                query = query.Where(t => t.Priority == (Priority)options.Priority);
            }

            return await query.CountAsync();
        }

        public async Task<TicketQueryResult> FilterTickets(TicketQueryRequest request)
        {
            var pageSize = 10;
            var query = _db.Tickets.AsQueryable();

            if (!string.IsNullOrEmpty(request.Keyword))
                query = query.Where(c => c.Title.ToLower().Contains(request.Keyword.ToLower()) || c.Description.ToLower().Contains(request.Keyword.ToLower()));

            if (request.TechnicianId.HasValue)
                query = query.Where(c => c.TechnicianId == request.TechnicianId.Value);

            if (!string.IsNullOrEmpty(request.Priority))
                query = query.Where(c => c.Priority.ToString() == request.Priority);

            if (request.IssueDate.HasValue)
                query = query.Where(c => c.IssueDate >= request.IssueDate.Value);

            if (request.CloseDate.HasValue)
                query = query.Where(c => c.CloseDate >= request.CloseDate.Value);

            if (!string.IsNullOrEmpty(request.Status))
                query = query.Where(c => c.Status.ToString() == request.Status);

            var total = await query.CountAsync();
            var pages = (int)Math.Ceiling(total / (double)pageSize);

            query = query
                .OrderBy(c => (int) c.Status)
                .ThenByDescending(c => (int) c.Priority)
                .ThenByDescending(c => c.IssueDate)
                .Skip((Math.Max(request.Page, 1) - 1) * pageSize)
                .Take(pageSize);

            var result = new TicketQueryResult
            {
                Tickets = await query.ToArrayAsync(),
                Total = total,
                Pages = pages
            };

            return result;
        }

        public async Task<Ticket?> GetById(int id)
        {
            var ticket = await _db.Tickets.FindAsync(id);
            return ticket;
        }

    }

    public class TicketQueryResult
    {
        public Ticket[] Tickets { get; set; } = null!;
        public int Total { get; set; }
        public int Pages { get; set; }
    }

    public class CountTicketsOptions
    {
        public int[]? Status { get; set; }
        public int? Priority { get; set; }
    }

    public class TicketCreateRequest
    {
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string Requester { get; set; } = null!;
        public string Priority { get; set; } = null!;
        public int TechnicianId { get; set; }
    }

    public class TicketUpdateRequest : TicketCreateRequest
    {
        public string Status { get; set; } = null!;
    }

    public class TicketQueryRequest
    {
        public string? Keyword { get; set; }
        public int? TechnicianId { get; set; }
        public string? Priority { get; set; }
        public DateTimeOffset? IssueDate { get; set; }
        public DateTimeOffset? CloseDate { get; set; }
        public string? Status { get; set; }
        public int Page { get; set; }

    }
}
