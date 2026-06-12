using _Codificar_ControleChamadosInternos.Objects;

namespace _Codificar_ControleChamadosInternos.DB
{
    public class DbSeeder
    {
        private readonly AppDbContext _db;

        private static readonly List<string> Solicitantes =
[
    "Ana Oliveira",
    "Bruno Martins",
    "Carlos Souza",
    "Fernanda Lima",
    "Gabriel Rocha",
    "Juliana Costa",
    "Lucas Almeida",
    "Mariana Santos",
    "Pedro Henrique",
    "Rafael Ferreira"
];

        private static readonly List<(string Titulo, string Descricao)> TicketsSeed = new()
{
    (
        "Computador não liga",
        "Ao pressionar o botão de energia, o equipamento não apresenta nenhuma resposta."
    ),
    (
        "Erro ao acessar o sistema",
        "O usuário recebe uma mensagem de erro ao tentar realizar login na aplicação."
    ),
    (
        "Impressora sem conexão",
        "A impressora aparece offline e não recebe novas filas de impressão."
    ),
    (
        "Internet lenta",
        "A conexão está apresentando lentidão excessiva durante a navegação."
    ),
    (
        "Falha no envio de e-mails",
        "As mensagens permanecem na caixa de saída e não são enviadas."
    ),
    (
        "Monitor com tela piscando",
        "A imagem apresenta oscilações e apagamentos intermitentes."
    ),
    (
        "Sistema travando",
        "A aplicação fecha inesperadamente durante o uso."
    ),
    (
        "Acesso negado a pasta compartilhada",
        "O usuário não consegue abrir os arquivos da rede compartilhada."
    ),
    (
        "Senha expirada",
        "O usuário foi bloqueado após a expiração automática da senha."
    ),
    (
        "Atualização pendente",
        "O computador solicita reinicialização para concluir atualizações críticas."
    ),
    (
        "VPN não conecta",
        "A conexão remota falha durante a autenticação."
    ),
    (
        "Teclado com teclas sem resposta",
        "Algumas teclas não registram entrada durante a digitação."
    ),
    (
        "Erro ao gerar relatório",
        "O sistema exibe exceção ao tentar exportar o relatório em PDF."
    ),
    (
        "Aplicativo corporativo indisponível",
        "Os usuários relatam indisponibilidade total do serviço."
    ),
    (
        "Problema na sincronização de arquivos",
        "Os documentos não estão sendo sincronizados entre os dispositivos."
    )
};

        public DbSeeder(AppDbContext db)
        {
            _db = db;
        }

        public void SeedTechnicians()
        {
            if (_db.Technicians.Any())
                return;

            var technicians = new[]
            {
                new Technician { Name = "João Silva", Icon = "JS" },
                new Technician { Name = "Maria Oliveira", Icon = "MO" },
                new Technician { Name = "Carlos Santos", Icon = "CS" },
                new Technician { Name = "Ana Costa", Icon = "AC" }
            };
            _db.Technicians.AddRange(technicians);
            _db.SaveChanges();
            Console.WriteLine("Seeded technicians");
        }

        public void SeedTickets()
        {
            if (_db.Tickets.Any())
                return;



            //var tickets = new[]
            //{
            //    new Ticket {
            //        Titulo = "Erro ao acessar sistema",
            //        Descricao = "Usuário relata que não consegue acessar o sistema de gestão.",
            //        Solicitante = "Pedro Almeida",
            //        Prioridade = Prioridade.Alta,
            //        Status = StatusTicket.Aberto,
            //        IdResponsavel = 1,
            //        NomeResponsavel = "João Silva",
            //        DataAbertura = DateTimeOffset.Now.AddDays(-2)
            //    },
            //    new Ticket {
            //        Titulo = "Solicitação de nova funcionalidade",
            //        Descricao = "Usuário solicita a adição de um novo relatório de vendas.",
            //        Solicitante = "Luciana Pereira",
            //        Prioridade = Prioridade.Media,
            //        Status = StatusTicket.EmAndamento,
            //        IdResponsavel = 2,
            //        NomeResponsavel = "Maria Oliveira",
            //        DataAbertura = DateTimeOffset.Now.AddDays(-5)
            //    },
            //    new Ticket {
            //        Titulo = "Problema de desempenho",
            //        Descricao = "Sistema está lento ao carregar a página de dashboard.",
            //        Solicitante = "Ricardo Gomes",
            //        Prioridade = Prioridade.Alta,
            //        Status = StatusTicket.Resolvido,
            //        IdResponsavel = 3,
            //        NomeResponsavel = "Carlos Santos",
            //        DataAbertura = DateTimeOffset.Now.AddDays(-10),
            //        DataFechamento = DateTimeOffset.Now.AddDays(-1)
            //    }
            //};

            var tickets = GenerateRandomTickets(10);
            _db.Tickets.AddRange(tickets);
            _db.SaveChanges();
            Console.WriteLine("Seeded tickets");
        }

        private List<Ticket> GenerateRandomTickets(int amount)
        {
            var tickets = new List<Ticket>();
            var random = new Random(249229429);
            var numberOfTechnicians = _db.Technicians.Count();

            for (var i = 0; i < amount; i++)
            {
                var ticketBase = TicketsSeed[random.Next(TicketsSeed.Count)];
                var requester = Solicitantes[random.Next(Solicitantes.Count)];

                var ticket = new Ticket
                {
                    Title = ticketBase.Titulo,
                    Description = ticketBase.Descricao,
                    Requester = requester,
                    Priority = (Priority)random.Next(1, 3),
                    Status = (StatusTicket)random.Next(1, 4),
                    TechnicianId = random.Next(1, numberOfTechnicians),
                    IssueDate = DateTime.Now.AddDays(-random.Next(1, 30))
                };
                ticket.TechnicianName = _db.Technicians.Find(ticket.TechnicianId)?.Name ?? throw new Exception("Responsável não pode ser nulo");
                if (ticket.Status == StatusTicket.Resolvido || ticket.Status == StatusTicket.Fechado)
                {
                    TimeSpan difference = DateTimeOffset.Now - ticket.IssueDate;
                    ticket.CloseDate = ticket.IssueDate.AddSeconds(random.Next(3600, (int)Math.Abs(difference.TotalSeconds)));
                }

                tickets.Add(ticket);
            }
            return tickets;
        }
    }
}
