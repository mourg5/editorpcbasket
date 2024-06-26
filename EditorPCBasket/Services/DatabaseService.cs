using EpcbModel;
using EpcbUtils;
using System.IO;
using System;
using System.Linq;
using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace Editor_PCBasket___Mou.Services
{
	public class DatabaseService : IDatabaseService
	{
		public PcBasketContext DataBase { get { return _locator.Current; } }

		private PcBasketDbLocator _locator;

		public ObservableCollection<Equipo> TeamsList { get; private set; }

		public DatabaseService()
		{
			_locator = new PcBasketDbLocator();
			TeamsList = new ObservableCollection<Equipo>(GetTeams().ToList().OrderBy(e => e.Puntero));
		}

		#region DB Creation

		public void GenerateInitialDatabase()
		{
			try
			{
				Reset();

				foreach (var dbc in Directory.GetFiles(Properties.Settings.Default.Path + "\\DBDAT\\EQ022022"))
				{
					using (var eqFile = File.OpenRead(dbc))
					{
						var equipo = HexUtils.ReadEquipoBytes(eqFile);
						if (equipo.Puntero == -5) continue;
						if (DataBase.Equipos.Where(e => e.Puntero == equipo.Puntero).Any())
						{
							DataBase.Equipos.Remove(DataBase.Equipos.Where(e => e.Puntero == equipo.Puntero).FirstOrDefault());
						}
						DataBase.Equipos.Add(equipo);
					}
				}

				DataBase.SaveChanges();

				TeamsList = new ObservableCollection<Equipo>(GetTeams().ToList().OrderBy(e => e.Puntero));
			}
			catch (Exception ex)
			{
				LoggerUtils.LogException(ex);
			}
		}

		public void Reset()
		{
			_locator.Reset();
			DataBase.Database.ExecuteSqlCommand("delete from Jugadores");
			DataBase.Database.ExecuteSqlCommand("delete from Equipos");

			DataBase.SaveChanges();

			TeamsList.Clear();
		}

		#endregion

		#region Teams

		public Equipo GetTeam(int puntero)
		{
			var team = DataBase.GetEquipo(puntero);
			return team;
		}

		public IEnumerable<Equipo> GetTeams()
		{
			return DataBase.Equipos.Include("Plantilla").Where(e => e.Puntero > 0).ToList();
		}

		public void DeleteTeam(Equipo team)
		{
			DataBase.Equipos.Remove(team);
			DataBase.SaveChanges();

			TeamsList.Remove(team);
		}

		public void AddTeam(Equipo team)
		{
			if (!DataBase.Equipos.Where(p => p.Puntero == team.Puntero).Any())
			{
				DataBase.Equipos.Add(team);
			}

			DataBase.SaveChanges();
		}

		public int GetNumberOfTeams()
		{
			return DataBase.Equipos.Count();
		}

		#endregion

		#region Players

		public int GetNumberOfPlayers()
		{
			return DataBase.Jugadores.Count();
		}

		#endregion
	}
}
