using EpcbCommon.Contracts;
using EpcbModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EpcbDatabaseServiceSqlite
{
	public class SqliteDatabaseService : IDatabaseService
	{
		public System.Collections.ObjectModel.ObservableCollection<Equipo> TeamsList => throw new NotImplementedException();

		public void AddTeam(Equipo team)
		{
			throw new NotImplementedException();
		}

		public void DeleteTeam(Equipo team)
		{
			throw new NotImplementedException();
		}

		public void GenerateInitialDatabase()
		{
			throw new NotImplementedException();
		}

		public int GetNumberOfPlayers()
		{
			throw new NotImplementedException();
		}

		public int GetNumberOfTeams()
		{
			throw new NotImplementedException();
		}

		public Equipo GetTeam(int puntero)
		{
			throw new NotImplementedException();
		}

		public IEnumerable<Equipo> GetTeams()
		{
			throw new NotImplementedException();
		}

		public void Reset()
		{
			throw new NotImplementedException();
		}
	}
}
