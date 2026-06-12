using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace _Codificar_ControleChamadosInternos.Objects
{
    public class Ticket
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Key]
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string Requester { get; set; } = null!;
        public Priority Priority { get; set; }
        public StatusTicket Status { get; set; }
        public int TechnicianId { get; set; }
        public string TechnicianName { get; set; } = null!;
        public DateTimeOffset IssueDate { get; set; } = DateTimeOffset.Now;
        public DateTimeOffset? CloseDate { get; set; } = null;
    }

    public enum StatusTicket
    {
        Aberto = 1,
        EmAndamento = 2,
        Resolvido = 3,
        Fechado = 4
    }

    public enum Priority
    {
        Baixa = 1,
        Media = 2,
        Alta = 3
    }
}
