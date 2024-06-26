using Editor_PCBasket___Mou.Services;
using EpcbModel;
using Prism.Mvvm;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Editor_PCBasket___Mou.ViewModels.Teams
{
	public class TeamsViewModel : BindableBase
	{
		private IDatabaseService _databaseService;

		public TeamsViewModel(IDatabaseService databaseService) 
		{
			_databaseService = databaseService;

			Initialize();
		}

		private void Initialize()
		{
			TeamsList = _databaseService.TeamsList;
		}

		#region Binding

		private ObservableCollection<Equipo> _teamsList;
		public ObservableCollection<Equipo> TeamsList
		{
			get { return _teamsList; }
			set { SetProperty(ref _teamsList, value); }
		}	

		#endregion
	}
}
