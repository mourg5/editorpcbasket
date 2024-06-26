using EpcbUtils;
using Prism.Regions;
using System.Linq;
using static Editor_PCBasket___Mou.Config.NavigationEnums;

namespace Editor_PCBasket___Mou.Services
{
	internal class NavigationService : INavigationService
	{
		private IRegionManager _regionManager;

		public NavigationService(IRegionManager regionManager)
		{
			_regionManager = regionManager;
		}

		public void NavigateTo(NavigationRegion region, NavigationView view, object sender)
		{
			if (CheckSameView(region, view)) return;

			_regionManager.RequestNavigate(region.ToString(), view.ToString());
			LoggerUtils.LogString(string.Format("[NAVIGATION] Navigated from {0} to {1}", sender.GetType().Name, view.ToString()));
		}

		public void GoBack(NavigationRegion region)
		{
			_regionManager.Regions[region.ToString()].NavigationService.Journal.GoBack();
			LoggerUtils.LogString("[NAVIGATION] Back");
		}

		public void GoForward(NavigationRegion region)
		{
			_regionManager.Regions[region.ToString()].NavigationService.Journal.GoForward();
			LoggerUtils.LogString("[NAVIGATION] Forward");
		}

		public void NavigateTo(NavigationRegion region, NavigationView view, object sender, NavigationParameters parameters)
		{
			_regionManager.RequestNavigate(region.ToString(), view.ToString(), parameters);
			LoggerUtils.LogString(string.Format("[NAVIGATION] Navigated from {0} to {1}", sender.GetType().Name, view.ToString()));
		}

		private bool CheckSameView(NavigationRegion region, NavigationView view)
		{
			var currentView = _regionManager.Regions[region.ToString()].ActiveViews.FirstOrDefault();
			var currentViewName = currentView?.GetType().ToString().Substring(currentView.GetType().ToString().LastIndexOf('.') + 1);

			return string.Equals(view.ToString(), currentViewName);
		}

		public void NavigateTo(NavigationView view, object sender, NavigationParameters navigationParameters = null)
		{
			if (navigationParameters != null)
			{
				NavigateTo(NavigationRegion.MainRegion, view, sender, navigationParameters);
			}
			else
			{
				NavigateTo(NavigationRegion.MainRegion, view, sender);
			}
		}
	}
}
