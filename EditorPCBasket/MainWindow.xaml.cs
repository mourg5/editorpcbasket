using Editor_PCBasket___Mou.Services;
using static Editor_PCBasket___Mou.Config.NavigationEnums;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows;

namespace Editor_PCBasket___Mou
{
	/// <summary>
	/// Lógica de interacción para MainWindow.xaml
	/// </summary>
	public partial class MainWindow
	{
		private INavigationService _navigationService;

		public MainWindow(INavigationService navigationService)
		{
			InitializeComponent();
			_navigationService = navigationService;
		}

		#region Appbar buttons

		private void GoBackButtonClick(object sender, RoutedEventArgs e)
		{
			_navigationService.GoBack(NavigationRegion.MainRegion);
		}
		private void GoForwardButtonClick(object sender, RoutedEventArgs e)
		{
			_navigationService.GoForward(NavigationRegion.MainRegion);
		}
		private void GoHomeButtonClick(object sender, RoutedEventArgs e)
		{
			_navigationService.NavigateTo(NavigationView.MainMenuView, this);
		}
		private void MinimizeClick(object sender, RoutedEventArgs e)
		{
			WindowState = WindowState.Minimized;
		}
		private void MaximizeClick(object sender, RoutedEventArgs e)
		{
			MaximizeWindow();
		}
		private void CloseClick(object sender, RoutedEventArgs e)
		{
			Application.Current.Shutdown();
		}
		private void ColorZone_MouseDown(object sender, MouseButtonEventArgs e)
		{
			if (e.ChangedButton == MouseButton.Left)
				DragMove();
		}
		private void ColorZone_MouseDoubleClick(object sender, MouseButtonEventArgs e)
		{
			if (e.OriginalSource.GetType() != typeof(Border)) return;

			MaximizeWindow();
		}

		private void MaximizeWindow()
		{
			if (WindowState == WindowState.Maximized)
			{
				WindowState = WindowState.Normal;
			}
			else
			{
				WindowStyle = WindowStyle.SingleBorderWindow;
				WindowState = WindowState.Maximized;
				WindowStyle = WindowStyle.None;
			}
		}

		#endregion

		private void Window_MouseDown(object sender, MouseButtonEventArgs e)
		{
			Keyboard.ClearFocus();
			MainRegion.Focus();
		}

		private void Window_Loaded(object sender, RoutedEventArgs e)
		{
			MaximizeWindow();
		}
	}
}
