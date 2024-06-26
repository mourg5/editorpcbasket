using Editor_PCBasket___Mou.ViewModels;
using Editor_PCBasket___Mou.ViewModels.Manager;
using Editor_PCBasket___Mou.ViewModels.Players;
using Editor_PCBasket___Mou.ViewModels.Settings;
using Editor_PCBasket___Mou.ViewModels.Teams;
using Editor_PCBasket___Mou.Views;
using Editor_PCBasket___Mou.Views.Manager;
using Editor_PCBasket___Mou.Views.Players;
using Editor_PCBasket___Mou.Views.Settings;
using Editor_PCBasket___Mou.Views.Teams;
using Prism.Ioc;

namespace Editor_PCBasket___Mou.Config
{
	public static class ViewsRegistration
	{
		public static IContainerRegistry AddViews(this IContainerRegistry containerRegistry)
		{
			containerRegistry.RegisterForNavigation<MainMenuView, MainMenuViewModel>();
			containerRegistry.RegisterForNavigation<SettingsView, SettingsViewModel>();
			containerRegistry.RegisterForNavigation<TeamsView, TeamsViewModel>();
			containerRegistry.RegisterForNavigation<PlayersView, PlayersViewModel>();
			containerRegistry.RegisterForNavigation<ManagerView, ManagerViewModel>();

			return containerRegistry;
		}
	}
}
