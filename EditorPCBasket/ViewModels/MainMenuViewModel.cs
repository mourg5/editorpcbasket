using Editor_PCBasket___Mou.Services;
using Prism.Commands;
using Prism.Regions;
using static Editor_PCBasket___Mou.Config.NavigationEnums;

namespace Editor_PCBasket___Mou.ViewModels
{
	public class MainMenuViewModel : INavigationAware
	{
		private INavigationService _navigationService;
		public MainMenuViewModel(INavigationService navigationService)
		{
			_navigationService = navigationService;

			InitializeCommands();
		}

		#region Commands

		public DelegateCommand SettingsCommand { get; private set; }
		public DelegateCommand ManagerCommand { get; private set; }
		public DelegateCommand TeamsCommand { get; private set; }
		public DelegateCommand PlayersCommand { get; private set; }

		private void InitializeCommands()
		{
			SettingsCommand = new DelegateCommand(ExecuteSettingsCommand);
			TeamsCommand = new DelegateCommand(ExecuteTeamsCommand, CanExecuteEditCommands);
			PlayersCommand = new DelegateCommand(ExecutePlayersCommand, CanExecuteEditCommands);
			ManagerCommand = new DelegateCommand(ExecuteManagerCommand, CanExecuteEditCommands);
		}

		private void ExecuteSettingsCommand()
		{
			_navigationService.NavigateTo(NavigationView.SettingsView, this);
		}

		private void ExecuteManagerCommand()
		{
			_navigationService.NavigateTo(NavigationView.ManagerView, this);
		}

		private void ExecutePlayersCommand()
		{
			_navigationService.NavigateTo(NavigationView.PlayersView, this);
		}

		private void ExecuteTeamsCommand()
		{
			_navigationService.NavigateTo(NavigationView.TeamsView, this);
		}

		private bool CanExecuteEditCommands()
		{
			return Properties.Settings.Default.SettingsCompleted;
		}

		#endregion

		#region INavigationAware

		public void OnNavigatedTo(NavigationContext navigationContext)
		{
			TeamsCommand.RaiseCanExecuteChanged();
			PlayersCommand.RaiseCanExecuteChanged();
			ManagerCommand.RaiseCanExecuteChanged();
		}

		public bool IsNavigationTarget(NavigationContext navigationContext)
		{
			return true;
		}

		public void OnNavigatedFrom(NavigationContext navigationContext)
		{
		}

		#endregion

	}
}
