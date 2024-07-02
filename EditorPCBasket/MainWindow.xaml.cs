using Editor_PCBasket___Mou.Services;
using static Editor_PCBasket___Mou.Config.NavigationEnums;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows;
using EpcbUtils.Dialogs;
using Editor_PCBasket___Mou.ViewModels.Dialogs;
using MaterialDesignThemes.Wpf;
using System.Threading.Tasks;
using System.Windows.Threading;
using System;
using static System.Windows.Forms.Design.AxImporter;

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

			DialogHelper.OnShowDialog += DialogHelper_ShowDialog;
			DialogHelper.OnShowDialogOnUiThread += DialogHelper_ShowDialogOnUiThread;
			DialogHelper.OnCloseDialog += DialogHelper_OnCloseDialogs;
		}

		#region Dialog Host

		private async Task<object> DialogHelper_ShowDialog(object sender, DialogOptions dialogOptions, object args)
		{
			object result = null;
			await Application.Current.Dispatcher.InvokeAsync(new Action(async () =>
			{
				object dialog;
				switch (dialogOptions.Type)
				{
					case DialogEnums.DialogType.SimpleDialog:
						dialog = new SimpleDialogViewModel(dialogOptions);
						break;
					case DialogEnums.DialogType.InputDialog:
						dialog = new InputDialogViewModel(dialogOptions);
						break;
					case DialogEnums.DialogType.ProballersImportDialog:
						dialog = new ProballersImportViewModel(dialogOptions);
						break;
					default:
						dialog = "";
						break;
				}

				result = await DialogHost.Show(dialog, "RootDialog");
			}), DispatcherPriority.Send);

			return result;
		}

		private void DialogHelper_ShowDialogOnUiThread(object sender, DialogOptions options)
		{
			object dialog;

			switch (options.Type)
			{
				case DialogEnums.DialogType.WaitingDialog:
					dialog = new WaitingDialogViewModel(options);
					RootDialog.CloseOnClickAway = false;
					break;
				case DialogEnums.DialogType.ProballersImportDialog:
					dialog = new ProballersImportViewModel(options);
					break;
				default:
					dialog = new SimpleDialogViewModel(options);
					break;
			}

			Application.Current.Dispatcher.Invoke(new Action(() =>
			{
				DialogHost.Show(dialog, "RootDialog");
			}), DispatcherPriority.Send);
		}

		private void DialogHelper_OnCloseDialogs(object sender, EventArgs e)
		{
			Dispatcher.Invoke(new Action(() =>
			{
				try
				{
					DialogHost.Close("RootDialog");
					RootDialog.CloseOnClickAway = true;
				}
				catch (Exception)
				{
					RootDialog.CloseOnClickAway = true;
				}
			}));
		}

		#endregion

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
