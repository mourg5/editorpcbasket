using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EpcbModel
{
	public class PcBasketContext : DbContext
	{
		public PcBasketContext() : base()
		{
			//Configuration.LazyLoadingEnabled = false;
		}

		public DbSet<Equipo> Equipos { get; set; }
		public DbSet<Jugador> Jugadores { get; set; }

		public Equipo GetEquipo(int puntero)
		{
			return Equipos.Where(e => e.Puntero == puntero).FirstOrDefault();
		}

		public ObservableCollection<Jugador> GetPlantillaOfEquipo(int punteroEquipo)
		{
			var lista = Jugadores.SqlQuery("SELECT * WHERE Equipo_EquipoId = " + punteroEquipo).ToList();

			var plantilla = new ObservableCollection<Jugador>();

			foreach (var jug in lista)
			{
				plantilla.Add(jug);
			}

			return plantilla;
		}
	}
}
