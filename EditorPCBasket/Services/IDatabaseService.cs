using EpcbModel;
using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace Editor_PCBasket___Mou.Services
{
	public interface IDatabaseService
	{
		PcBasketContext DataBase { get; }
		ObservableCollection<Equipo> TeamsList { get; }

		Equipo GetTeam(int puntero);
		IEnumerable<Equipo> GetTeams();
		void AddTeam(Equipo team);
		void DeleteTeam(Equipo team);
		int GetNumberOfTeams();


		int GetNumberOfPlayers();

		void GenerateInitialDatabase();
		void Reset();
	}
}
