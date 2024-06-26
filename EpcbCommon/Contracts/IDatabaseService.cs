using EpcbModel;
using System.Collections.ObjectModel;

namespace EpcbCommon.Contracts
{
	public interface IDatabaseService
	{
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
