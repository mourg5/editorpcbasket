using Editor_PCBasket___Mou.Services;
using Editor_PCBasket___Mou.Views;
using EpcbModel;
using EpcbUtils;
using Prism.Commands;
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
			InitializeCommands();
		}

		#region Binding

		private ObservableCollection<Equipo> _teamsList;
		public ObservableCollection<Equipo> TeamsList
		{
			get { return _teamsList; }
			set { SetProperty(ref _teamsList, value); }
		}

		private Equipo _selectedTeam;
		public Equipo SelectedTeam
		{
			get { return _selectedTeam; }
			set
			{
				SetProperty(ref _selectedTeam, value);
				DeleteTeamCommand.RaiseCanExecuteChanged();
			}
		}

		#endregion

		#region Commands

		public DelegateCommand DeleteTeamCommand { get; private set; }
		public DelegateCommand CreateTeamCommand { get; private set; }
		public DelegateCommand GenerateTeamCommand { get; private set; }
		public DelegateCommand ExportTeamsCommand { get; private set; }

		private void InitializeCommands()
		{
			DeleteTeamCommand = new DelegateCommand(ExecuteDeleteTeam, CanExecuteDeleteTeam);
			CreateTeamCommand = new DelegateCommand(ExecuteCreateTeam);
			GenerateTeamCommand = new DelegateCommand(ExecuteImportTeam);
			ExportTeamsCommand = new DelegateCommand(ExecuteExportTeams);
		}

		private void ExecuteExportTeams()
		{
			foreach (var team in _teamsList)
			{
				HexUtils.SaveEquipoBytes(team);
			}
		}

		private void ExecuteImportTeam()
		{
			
		}

		private void ExecuteCreateTeam()
		{
			var team = new Equipo();
			var teamWindow = new EquipoWindow(team);
			teamWindow.Show();
		}

		private void ExecuteDeleteTeam()
		{
			_databaseService.DeleteTeam(SelectedTeam);
		}

		private bool CanExecuteDeleteTeam()
		{
			return SelectedTeam != null;
		}

		#endregion
	}
}
