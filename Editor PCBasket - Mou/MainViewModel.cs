using Editor_PCBasket___Mou.Properties;
using EpcbModel;
using EpcbUtils;
using EpcbUtils.Messages;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.Command;
using GalaSoft.MvvmLight.Messaging;
using System;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Timers;

namespace Editor_PCBasket___Mou
{
	public class MainViewModel : ViewModelBase
	{
		public MainViewModel()
		{
			LoggerUtils.LogString(string.Format("============= Iniciando Editor PCBasket. Versión {0}=============", Assembly.GetExecutingAssembly().GetName().Version));
			ReloadEquiposList();
			Messenger.Default.Register<StatusMessage>(this, ProcessStatusMessage);
			_statusBarTimer = new Timer()
			{
				Interval = 5000,
				AutoReset = false
			};
			_statusBarTimer.Elapsed += _statusBarTimer_Elapsed;
		}

		private void _statusBarTimer_Elapsed(object sender, ElapsedEventArgs e)
		{
			StatusBarText = "";
		}

		private Timer _statusBarTimer;

		private void ProcessStatusMessage(StatusMessage obj)
		{
			StatusBarText = obj.Message;
			_statusBarTimer.Start();
		}

		private ObservableCollection<Equipo> _equiposList;
		public ObservableCollection<Equipo> EquiposList
		{
			get { return _equiposList; }
			set { Set(() => EquiposList, ref _equiposList, value); }
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

		private string _statusBarText;

		public string StatusBarText
		{
			get { return _statusBarText; }
			set { Set(() => StatusBarText, ref _statusBarText, value); }
		}

		private void ExecuteCreateDatabase()
		{
			LoggerUtils.LogString("Generando base de datos desde EQ022022...");
			DataBaseUtils.CreateInitialDataBase();
			ReloadEquiposList();
			if(EquiposList.Any()) LoggerUtils.LogString("Base de datos generada correctamente. Importados " + EquiposList.Count + " equipos.");
		}

		private bool CanExecuteCreateDatabase()
		{
			//TODO: Implement condition
			return true;
		}

		private void ReloadEquiposList()
		{
			EquiposList = new ObservableCollection<Equipo>();
			var lista = DataBaseUtils.DataBase.Equipos.Include("Plantilla").Where(e => e.Puntero > 0).ToList();
			foreach (var equipo in lista)
			{
				EquiposList.Add(equipo);
			}
		}
	}
}
