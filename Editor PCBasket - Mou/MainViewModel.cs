using Editor_PCBasket___Mou.Properties;
using EpcbModel;
using EpcbUtils;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.Command;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Data.Entity;
using System.Threading;

namespace Editor_PCBasket___Mou
{
	public class MainViewModel : ViewModelBase
	{
		public bool Loading = true;

		public MainViewModel()
		{
			LoggerUtils.LogString(string.Format("============= Iniciando Editor PCBasket. Versión {0}=============", Assembly.GetExecutingAssembly().GetName().Version));

			var thread = new Thread(() =>
			{
				DataBaseUtils.DataBase.Equipos.Load();
				DataBaseUtils.DataBase.Jugadores.Load();
				Loading = false;
			});
			thread.Start();
		}

		private RelayCommand _createDatabaseCommand;

		public RelayCommand CreateDatabaseCommand
		{
			get
			{
				if (_createDatabaseCommand == null)
				{
					_createDatabaseCommand = new RelayCommand(ExecuteCreateDatabase, CanExecuteCreateDatabase);
				}
				return _createDatabaseCommand;
			}
		}

		private void ExecuteCreateDatabase()
		{
			LoggerUtils.LogString("Generando base de datos desde EQ022022...");
			DataBaseUtils.CreateInitialDataBase();
		}

		private bool CanExecuteCreateDatabase()
		{
			//TODO: Implement condition
			return true;
		}
	}
}
