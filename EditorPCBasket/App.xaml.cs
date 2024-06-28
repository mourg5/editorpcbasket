using Editor_PCBasket___Mou.Config;
using Editor_PCBasket___Mou.Properties;
using Editor_PCBasket___Mou.Services;
using EpcbUtils;
using Prism.Ioc;
using Prism.Unity;
using System;
using System.Data;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Windows;
using static Editor_PCBasket___Mou.Config.NavigationEnums;

namespace Editor_PCBasket___Mou
{
	/// <summary>
	/// Lógica de interacción para App.xaml
	/// </summary>
	public partial class App : PrismApplication
	{
		public int MaxLogFiles = 11;

		public App()
		{
		}

		protected override void OnStartup(StartupEventArgs e)
		{
			base.OnStartup(e);

			AppDomain.CurrentDomain.UnhandledException += (sender, eventArgs) =>
			{
				LoggerUtils.LogException((Exception)eventArgs.ExceptionObject);
			};

			SetFolders();

			HexUtils.AnoInicio = (short)Settings.Default.AnoInicio;

			LoggerUtils.LogString(string.Format("============= Iniciando Editor PCBasket. Versión {0} =============", Assembly.GetExecutingAssembly().GetName().Version));

			Container.Resolve<INavigationService>().NavigateTo(NavigationRegion.MainRegion, NavigationView.MainMenuView, this);
		}

		private static void SetFolders()
		{
			DbdatUtils.PcbPath = Settings.Default.Path;

			var logsPath = AppDomain.CurrentDomain.BaseDirectory + "Logs";
			var logFile = logsPath + "\\log_" + DateTime.Now.Ticks + ".txt";

			LoggerUtils.LogFilePath = logFile;

			if (!Directory.Exists(logsPath))
			{
				Directory.CreateDirectory(logsPath);
			}

			var medfotoPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, string.Format("Graficos\\MEDFOTO"));
			var minifotoPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, string.Format("Graficos\\MINIFOTO"));
			var nanofotoPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, string.Format("Graficos\\NANOFOTO"));

			if (!Directory.Exists(medfotoPath))
			{
				Directory.CreateDirectory(medfotoPath);
				Directory.CreateDirectory(minifotoPath);
				Directory.CreateDirectory(nanofotoPath);
			}
		}

		protected override void RegisterTypes(IContainerRegistry containerRegistry)
		{
			containerRegistry.AddViews();
			containerRegistry.RegisterSingleton<INavigationService, NavigationService>();
			containerRegistry.RegisterSingleton<IDatabaseService, DatabaseService>();
		}

		protected override Window CreateShell()
		{
			return Container.Resolve<MainWindow>();
		}

		private void Application_Exit(object sender, ExitEventArgs e)
		{
			LoggerUtils.CloseLogger();

			var di = new DirectoryInfo(AppDomain.CurrentDomain.BaseDirectory + "Logs");
			var logFiles = di.GetFileSystemInfos();

			var orderedFiles = logFiles.OrderByDescending(f => f.CreationTime);
			for (int i = MaxLogFiles - 1; i <= orderedFiles.Count() - 1; i++)
			{
				var fileToDelete = orderedFiles.ElementAt(i);
				File.Delete(fileToDelete.FullName);
			}
		}
	}
}
