using Prism.Regions;
using static Editor_PCBasket___Mou.Config.NavigationEnums;

namespace Editor_PCBasket___Mou.Services
{
	public interface INavigationService
	{
		void NavigateTo(NavigationView view, object sender, NavigationParameters navigationParameters = null);
		void NavigateTo(NavigationRegion region, NavigationView view, object sender, NavigationParameters navigationParameters);
		void NavigateTo(NavigationRegion region, NavigationView view, object sender);
		void GoBack(NavigationRegion region);
		void GoForward(NavigationRegion region);
	}
}
