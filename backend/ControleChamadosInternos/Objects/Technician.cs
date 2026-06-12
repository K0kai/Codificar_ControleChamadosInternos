using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace _Codificar_ControleChamadosInternos.Objects
{
    public class Technician
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Icon { get; set; } = null!;
        public int OpenTickets { get; set; }
    }
}
