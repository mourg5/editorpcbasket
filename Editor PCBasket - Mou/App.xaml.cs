using EpcbUtils;
using System;
using System.Data;
using System.IO;
using System.Linq;
using System.Windows;

namespace Editor_PCBasket___Mou
{
	/// <summary>
	/// Lógica de interacción para App.xaml
	/// </summary>
	public partial class App : Application
	{
		public int MaxLogFiles = 11;

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
