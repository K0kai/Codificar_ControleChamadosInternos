using _Codificar_ControleChamadosInternos.Objects;
using Microsoft.EntityFrameworkCore;

namespace _Codificar_ControleChamadosInternos.DB
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Ticket> Tickets { get; set; }
        public DbSet<Technician> Technicians { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Ticket>().Property(c => c.Priority).HasConversion<string>();

            if (Database.IsSqlite())
            {
                foreach (var entityType in modelBuilder.Model.GetEntityTypes())
                {
                    var properties = entityType.GetProperties()
                        .Where(p => p.ClrType == typeof(DateTimeOffset)
                                 || p.ClrType == typeof(DateTimeOffset?));

                    foreach (var property in properties)
                    {                        
                        property.SetValueConverter(new Microsoft.EntityFrameworkCore.Storage.ValueConversion.DateTimeOffsetToBinaryConverter());
                    }
                }
            }

            base.OnModelCreating(modelBuilder);
        }
    }
}
