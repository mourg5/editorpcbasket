using Editor_PCBasket___Mou.Properties;
using EpcbModel;
using EpcbUtils;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.Command;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Reflection;

namespace Editor_PCBasket___Mou
{
	public class MainViewModel : ViewModelBase
	{
		public MainViewModel()
		{
			LoggerUtils.LogString(string.Format("============= Iniciando Editor PCBasket. Versión {0}=============", Assembly.GetExecutingAssembly().GetName().Version));
			ReloadEquiposList();
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
