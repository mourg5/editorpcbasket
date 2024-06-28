using Editor_PCBasket___Mou.Services;
using EpcbModel;
using EpcbUtils;
using Prism.Commands;
using Prism.Mvvm;

namespace Editor_PCBasket___Mou.ViewModels
{
	public class EquipoViewModel : BindableBase
	{
		private IDatabaseService _databaseService { get; set; }

		public EquipoViewModel(IDatabaseService databaseService)
		{
			_databaseService = databaseService;
		}

		private Equipo _equipo;
		public Equipo Equipo
		{
			get { return _equipo; }
			set { SetProperty(ref _equipo, value); }
		}

		private DelegateCommand _generateDbcCommand;

		public DelegateCommand GenerateDbcCommand
		{
			get
			{
				if (_generateDbcCommand == null)
				{
					_generateDbcCommand = new DelegateCommand(ExecuteGenerateDbc, CanExecuteGenerateDbc);
				}
				return _generateDbcCommand;
			}
		}

		private void ExecuteGenerateDbc()
		{
			LoggerUtils.LogString("Creando DBC para el equipo '" + Equipo.NombreCorto + "' (" + Equipo.Puntero + ")...");
			HexUtils.SaveEquipoBytes(Equipo);
			PhotoUtils.CopyPhotos(Equipo);
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

		private DelegateCommand _saveEquipoCommand;

		public DelegateCommand SaveEquipoCommand
		{
			get
			{
				if (_saveEquipoCommand == null)
				{
					_saveEquipoCommand = new DelegateCommand(ExecuteSaveEquipo, CanExecuteSaveEquipo);
				}
				return _saveEquipoCommand;
			}
		}

		private DelegateCommand _subirMediaCommand;

		public DelegateCommand SubirMediaCommand
		{
			get
			{
				if (_subirMediaCommand == null)
				{
					_subirMediaCommand = new DelegateCommand(ExecuteSubirMedia, CanExecuteSubirMedia);
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

		private DelegateCommand _bajarMediaCommand;

		public DelegateCommand BajarMediaCommand
		{
			get
			{
				if (_bajarMediaCommand == null)
				{
					_bajarMediaCommand = new DelegateCommand(ExecuteBajarMedia, CanExecuteBajarMedia);
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

		public void DeleteJugador(Jugador jug)
		{
			if (Equipo.Plantilla.Contains(jug))
			{
				Equipo.Plantilla.Remove(jug);
				LoggerUtils.LogString(string.Format("El jugador {0} ha sido eliminado de {1}. Ahora aparece en jugadores libres.", jug.NombreLargo, Equipo.NombreCorto));
			}
		}

		public void AddJugador(Jugador jug)
		{
			Equipo.Plantilla.Add(jug);
		}

		private bool CanExecuteBajarMedia()
		{
			//TODO: Implement condition
			return true;
		}

		private void ExecuteSaveEquipo()
		{
			_databaseService.AddTeam(Equipo);
			LoggerUtils.LogString("Guardando equipo '" + Equipo.NombreCorto + "' en la base de datos...");			
		}

		private bool CanExecuteSaveEquipo()
		{
			//TODO: Implement condition
			return true;
		}
	}
}
