using EpcbModel;
using EpcbUtils;
using EpcbUtils.Messages;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.Command;
using GalaSoft.MvvmLight.Messaging;
using GalaSoft.MvvmLight.Threading;
using System.Collections.ObjectModel;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using System.Timers;
using Timer = System.Timers.Timer;

namespace Editor_PCBasket___Mou
{
	public class MainViewModel : ViewModelBase
	{
		public MainViewModel()
		{
			LoggerUtils.LogString(string.Format("============= Iniciando Editor PCBasket. Versión {0} =============", Assembly.GetExecutingAssembly().GetName().Version));
			ReloadEquiposList();
			//ReloadJugadoresList();
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
			DispatcherHelper.CheckBeginInvokeOnUI(() =>
			{
				StatusBarText = obj.Message;
			});

			_statusBarTimer.Start();
		}

		private ObservableCollection<Equipo> _equiposList;
		public ObservableCollection<Equipo> EquiposList
		{
			get { return _equiposList; }
			set { Set(() => EquiposList, ref _equiposList, value); }
		}

		private ObservableCollection<Jugador> _jugadoresList;
		public ObservableCollection<Jugador> JugadoresList
		{
			get { return _jugadoresList; }
			set { Set(() => JugadoresList, ref _jugadoresList, value); }
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

		private async void ExecuteCreateDatabase()
		{
			LoggerUtils.LogString("Generando base de datos desde EQ022022...");
			EquiposList.Clear();
			_statusBarTimer.Stop();

			await Task.Run(() => DataBaseUtils.CreateInitialDataBase());

			ReloadEquiposList();
			if (EquiposList.Any()) LoggerUtils.LogString("Base de datos generada correctamente. Importados " + EquiposList.Count + " equipos.");
		}

		private bool CanExecuteCreateDatabase()
		{
			//TODO: Implement condition
			return true;
		}

		private void ReloadEquiposList()
		{
			var lista = DataBaseUtils.DataBase.Equipos.Include("Plantilla").Where(e => e.Puntero > 0).ToList();
			EquiposList = new ObservableCollection<Equipo>(lista);
		}

		private void ReloadJugadoresList()
		{
			var listaJ = DataBaseUtils.DataBase.Jugadores.ToList();
			JugadoresList = new ObservableCollection<Jugador>(listaJ);
		}
	}
}
