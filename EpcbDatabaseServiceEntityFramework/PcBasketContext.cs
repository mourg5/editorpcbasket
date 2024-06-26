using EpcbModel;
using Microsoft.EntityFrameworkCore;
using System.Collections.ObjectModel;

namespace EpcbDatabaseServiceEntityFramework
{
	public class PcBasketContext : DbContext
	{
		public PcBasketContext()
		{
			//Configuration.LazyLoadingEnabled = false;
		}

		public DbSet<Equipo> Equipos { get; set; }
		public DbSet<Jugador> Jugadores { get; set; }

		public Equipo GetEquipo(int puntero)
		{
			return Equipos.Where(e => e.Puntero == puntero).Include("Plantilla").FirstOrDefault();
		}

		public Equipo GetEquipoOfJugador(Jugador jug)
		{			
			return Equipos.Where(e => e.Plantilla.Any(j => j.Puntero == jug.Puntero)).FirstOrDefault();
		}

		public ObservableCollection<Jugador> GetPlantillaOfEquipo(int punteroEquipo)
		{
			return new ObservableCollection<Jugador>();

			//var lista = Jugadores.FromSql(string.Format("SELECT * WHERE Equipo_EquipoId = {0}", punteroEquipo)).ToList();

			//var plantilla = new ObservableCollection<Jugador>();

			//foreach (var jug in lista)
			//{
			//	plantilla.Add(jug);
			//}

			//return plantilla;
		}

		protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
		{
			if (!optionsBuilder.IsConfigured)
			{
				optionsBuilder.UseSqlite("Data Source=pcbasket.db");
			}
		}
	}
}
