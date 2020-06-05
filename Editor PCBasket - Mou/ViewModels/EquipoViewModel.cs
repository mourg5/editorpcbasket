using EpcbModel;
using EpcbUtils;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.Command;
using System.ComponentModel;

namespace Editor_PCBasket___Mou.ViewModels
{
	public class EquipoViewModel : ViewModelBase, INotifyPropertyChanged
	{		
		public EquipoViewModel(Equipo equipo)
		{
			Equipo = equipo;
		}

		private Equipo _equipo;
		public Equipo Equipo
		{
			get { return _equipo; }
			set { Set(() => Equipo, ref _equipo, value); }
		}

		private RelayCommand _generateDbcCommand;

		public RelayCommand GenerateDbcCommand
		{
			get
			{
				if (_generateDbcCommand == null)
				{
					_generateDbcCommand = new RelayCommand(ExecuteGenerateDbc, CanExecuteGenerateDbc);
				}
				return _generateDbcCommand;
			}
		}

		private void ExecuteGenerateDbc()
		{
			LoggerUtils.LogString("Creando DBC para el equipo '" + Equipo.NombreCorto + "' (" + Equipo.Puntero + ")...");
			HexUtils.SaveEquipoBytes(Equipo);
		}

		private bool CanExecuteGenerateDbc()
		{
			//TODO: Implement condition
			return true;
		}

		public void ReloadMedias()
		{
			Equipo.ReloadMedias();
		}

		private RelayCommand _saveEquipoCommand;

		public RelayCommand SaveEquipoCommand
		{
			get
			{
				if (_saveEquipoCommand == null)
				{
					_saveEquipoCommand = new RelayCommand(ExecuteSaveEquipo, CanExecuteSaveEquipo);
				}
				return _saveEquipoCommand;
			}
		}

		private RelayCommand _subirMediaCommand;

		public RelayCommand SubirMediaCommand
		{
			get
			{
				if (_subirMediaCommand == null)
				{
					_subirMediaCommand = new RelayCommand(ExecuteSubirMedia, CanExecuteSubirMedia);
				}
				return _subirMediaCommand;
			}
		}

		private void ExecuteSubirMedia()
		{
			foreach (var jug in Equipo.Plantilla)
			{
				jug.Medias.Add(1);
			}

			ReloadMedias();
		}

		private bool CanExecuteSubirMedia()
		{
			//TODO: Implement condition
			return true;
		}

		private RelayCommand _bajarMediaCommand;

		public RelayCommand BajarMediaCommand
		{
			get
			{
				if (_bajarMediaCommand == null)
				{
					_bajarMediaCommand = new RelayCommand(ExecuteBajarMedia, CanExecuteBajarMedia);
				}
				return _bajarMediaCommand;
			}
		}

		private void ExecuteBajarMedia()
		{
			foreach (var jug in Equipo.Plantilla)
			{
				jug.Medias.Add(-1);
			}

			ReloadMedias();
		}

		private bool CanExecuteBajarMedia()
		{
			//TODO: Implement condition
			return true;
		}

		private void ExecuteSaveEquipo()
		{
			LoggerUtils.LogString("Guardando equipo '" + Equipo.NombreCorto + "' en la base de datos...");
			DataBaseUtils.GuardarEquipo(Equipo);
		}

		private bool CanExecuteSaveEquipo()
		{
			//TODO: Implement condition
			return true;
		}
	}
}
