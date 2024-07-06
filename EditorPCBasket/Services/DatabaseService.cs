using EpcbModel;
using EpcbUtils;
using System.IO;
using System;
using System.Linq;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Threading.Tasks;
using System.Windows;

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

		public async Task GenerateInitialDatabase()
		{
			try
			{
				Reset();

				var tcs = new TaskCompletionSource<List<Equipo>>(TaskCreationOptions.RunContinuationsAsynchronously);

				await CreateTeams(tcs);
				await tcs.Task;

				DataBase.Equipos.AddRange(tcs.Task.Result);
				DataBase.SaveChanges();

				TeamsList = new ObservableCollection<Equipo>(GetTeams().ToList().OrderBy(e => e.Puntero));
			}
			catch (Exception ex)
			{
				LoggerUtils.LogException(ex);
			}
		}

		public Task CreateTeams(TaskCompletionSource<List<Equipo>> teamList)
		{
			var equiposList = new List<Equipo>();

			foreach (var dbc in Directory.GetFiles(Properties.Settings.Default.Path + "\\DBDAT\\EQ022022"))
			{
				using (var eqFile = File.OpenRead(dbc))
				{
					var equipo = HexUtils.ReadEquipoBytes(eqFile);
					if (equipo.Puntero == -5) continue;
					equiposList.Add(equipo);
				}
			}

			teamList.SetResult(equiposList);
			return Task.CompletedTask;
		}

		public void Reset()
		{
			_locator.Reset();
			DataBase.Database.ExecuteSqlCommand("delete from Jugadores");
			DataBase.Database.ExecuteSqlCommand("delete from Equipos");

			DataBase.SaveChanges();

			Application.Current.Dispatcher.Invoke(TeamsList.Clear);
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
			try
			{
				DataBase.Equipos.Remove(team);
				DataBase.SaveChanges();
			}
			catch (Exception ex)
			{
				LoggerUtils.LogException(ex);
			}

			try
			{
				TeamsList.Remove(team);
			}
			catch (Exception ex)
			{
				LoggerUtils.LogException(ex);
			}
		}

		public void AddTeam(Equipo team)
		{
			if (!DataBase.Equipos.Where(p => p.Puntero == team.Puntero).Any())
			{
				DataBase.Equipos.Add(team);
				TeamsList.Add(team);
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
