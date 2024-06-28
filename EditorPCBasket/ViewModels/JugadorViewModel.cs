using Editor_PCBasket___Mou.Services;
using EpcbModel;
using EpcbUtils;
using Prism.Commands;
using Prism.Mvvm;
using System;
using System.Windows.Media.Imaging;

namespace Editor_PCBasket___Mou.ViewModels
{
	public class JugadorViewModel : BindableBase
	{
		public JugadorViewModel(IDatabaseService databaseService)
		{
			_jugador = new Jugador();
			MediaDeseada = 70;
			_random = new Random(DateTime.Now.Millisecond);

			_databaseService = databaseService;
		}

		public bool ApplyChanges = false;

		private string _nombreEquipo;

		public string NombreEquipo
		{
			get { return _nombreEquipo; }
			set { SetProperty(ref _nombreEquipo, value); }
		}

		private BitmapImage _escudoImageSource;

		public BitmapImage EscudoImageSource
		{
			get { return _escudoImageSource; }
			set { SetProperty(ref _escudoImageSource, value); }
		}

		private Jugador _jugador;
		public Jugador Jugador
		{
			get { return _jugador; }
			set
			{
				if(!SetProperty(ref _jugador, value)) return;

				var equipo = _databaseService.DataBase.GetEquipoOfJugador(Jugador);

				if (equipo == null) return;

				NombreEquipo = equipo.NombreLargo;
				EscudoImageSource = DbdatUtils.GetNanoesc(equipo.Puntero);
			}
		}

		private BitmapImage _banderaImageSource;
		public BitmapImage BanderaImageSource
		{
			get { return _banderaImageSource; }
			set { SetProperty(ref _banderaImageSource, value); }
		}

		private BitmapImage _fotoImageSource;
		public BitmapImage FotoImageSource
		{
			get { return _fotoImageSource; }
			set { SetProperty(ref _fotoImageSource, value); }
		}

		#region Generador medias 

		private DelegateCommand _generarMediaCommand;

		public DelegateCommand GenerarMediaCommand
		{
			get
			{
				if (_generarMediaCommand == null)
				{
					_generarMediaCommand = new DelegateCommand(ExecuteGenerarMedia, CanExecuteGenerarMedia);
				}
				return _generarMediaCommand;
			}
		}

		private void ExecuteGenerarMedia()
		{
			switch (Jugador.Demarcacion)
			{
				case 0:
					GenerarMediaBase();
					break;
				case 1:
					GenerarMediaEscolta();
					break;
				case 2:
					GenerarMediaAlero();
					break;
				case 3:
					GenerarMediaAlaPivot();
					break;
				default:
					GenerarMediaPivot();
					break;
			}
		}

		private bool CanExecuteGenerarMedia()
		{
			return true;
		}

		private void GenerarMediaBase()
		{
			var totalPoints = MediaDeseada * 13 - 141;
			var mediaBase = totalPoints / 11;

			Jugador.Medias.SetMediasToValue(mediaBase);

			Jugador.Medias.Velocidad = IsVeloz ? (int)(mediaBase * 1.3) + _random.Next(15) : mediaBase - _random.Next(15);
			totalPoints -= Jugador.Medias.Velocidad;

			Jugador.Medias.Salto = IsAtletico ? mediaBase + _random.Next(15) : mediaBase - _random.Next(15);
			totalPoints -= Jugador.Medias.Salto;

			Jugador.Medias.Resistencia = IsAtletico ? mediaBase + _random.Next(20) : mediaBase - _random.Next(10);
			totalPoints -= Jugador.Medias.Resistencia;

			Jugador.Medias.Agresividad = IsIntimidador ? (int)(mediaBase * .8) + _random.Next(15) : (int)(mediaBase * .75) - _random.Next(20);
			totalPoints -= Jugador.Medias.Agresividad;

			Jugador.Medias.Defensa = IsDefensor ? mediaBase + _random.Next(15) : mediaBase - _random.Next(15);
			totalPoints -= Jugador.Medias.Defensa;

			Jugador.Medias.Tiro2 = IsTirador ? (int)(mediaBase * 1.15 + _random.Next(15)) : (int)(mediaBase - _random.Next(10));
			totalPoints -= Jugador.Medias.Tiro2;

			Jugador.Medias.Tiro3 = IsTirador ? (int)(mediaBase * 1.2 + _random.Next(15)) : (int)(mediaBase - _random.Next(10));
			totalPoints -= Jugador.Medias.Tiro3;

			Jugador.Medias.TiroL = IsTirador ? (int)(mediaBase * 1.2 + _random.Next(15)) : (int)(mediaBase - _random.Next(10));
			totalPoints -= Jugador.Medias.TiroL;

			Jugador.Medias.Rebotes = IsIntimidador ? (int)(mediaBase * .7) + _random.Next(10) : (int)(mediaBase * .6) - _random.Next(30);
			totalPoints -= Jugador.Medias.Rebotes;

			Jugador.Medias.Asistencias = IsCreador ? (int)(mediaBase * 1.1) + _random.Next(15) : (int)(mediaBase * 1) - _random.Next(10);
			totalPoints -= Jugador.Medias.Asistencias;

			Jugador.Medias.Oculto = 99; // totalPoints;
										//totalPoints -= Jugador.Medias.Oculto;

			while (MediaDeseada != Jugador.Medias.MediaQuinteto)
			{
				Jugador.Medias.Add(MediaDeseada - Jugador.Medias.MediaQuinteto);
			}
		}

		private void GenerarMediaEscolta()
		{
			var totalPoints = MediaDeseada * 13 - 141;
			var mediaBase = totalPoints / 11;

			Jugador.Medias.SetMediasToValue(mediaBase);

			Jugador.Medias.Velocidad = IsVeloz ? (int)(mediaBase * 1.2) + _random.Next(15) : mediaBase - _random.Next(15);
			totalPoints -= Jugador.Medias.Velocidad;

			Jugador.Medias.Salto = IsAtletico ? mediaBase + _random.Next(25) : mediaBase - _random.Next(15);
			totalPoints -= Jugador.Medias.Salto;

			Jugador.Medias.Resistencia = IsAtletico ? mediaBase + _random.Next(25) : mediaBase - _random.Next(10);
			totalPoints -= Jugador.Medias.Resistencia;

			Jugador.Medias.Agresividad = IsIntimidador ? mediaBase + _random.Next(15) : (int)(mediaBase * .8) - _random.Next(20);
			totalPoints -= Jugador.Medias.Agresividad;

			Jugador.Medias.Defensa = IsDefensor ? mediaBase + _random.Next(15) : mediaBase - _random.Next(15);
			totalPoints -= Jugador.Medias.Defensa;

			Jugador.Medias.Tiro2 = IsTirador ? (int)(mediaBase * 1.15 + _random.Next(20)) : (int)(mediaBase - _random.Next(10));
			totalPoints -= Jugador.Medias.Tiro2;

			Jugador.Medias.Tiro3 = IsTirador ? (int)(mediaBase * 1.2 + _random.Next(25)) : (int)(mediaBase - _random.Next(10));
			totalPoints -= Jugador.Medias.Tiro3;

			Jugador.Medias.TiroL = IsTirador ? (int)(mediaBase * 1.2 + _random.Next(15)) : (int)(mediaBase - _random.Next(10));
			totalPoints -= Jugador.Medias.TiroL;

			Jugador.Medias.Rebotes = IsIntimidador ? (int)(mediaBase * .7) + _random.Next(10) : (int)(mediaBase * .6) - _random.Next(30);
			totalPoints -= Jugador.Medias.Rebotes;

			Jugador.Medias.Asistencias = IsCreador ? mediaBase + _random.Next(15) : mediaBase - _random.Next(15);
			totalPoints -= Jugador.Medias.Asistencias;

			Jugador.Medias.Oculto = 99;

			while (MediaDeseada != Jugador.Medias.MediaQuinteto)
			{
				Jugador.Medias.Add(MediaDeseada - Jugador.Medias.MediaQuinteto);
			}
		}

		private void GenerarMediaAlero()
		{
			var totalPoints = MediaDeseada * 13 - 141;
			var mediaBase = totalPoints / 11;

			Jugador.Medias.SetMediasToValue(mediaBase);

			Jugador.Medias.Velocidad = IsVeloz ? mediaBase + _random.Next(25) : mediaBase - _random.Next(15);
			totalPoints -= Jugador.Medias.Velocidad;

			Jugador.Medias.Salto = IsAtletico ? (int)(mediaBase * 1.2) + _random.Next(20) : mediaBase - _random.Next(15);
			totalPoints -= Jugador.Medias.Salto;

			Jugador.Medias.Resistencia = IsAtletico ? mediaBase + _random.Next(25) : mediaBase - _random.Next(10);
			totalPoints -= Jugador.Medias.Resistencia;

			Jugador.Medias.Agresividad = IsIntimidador ? mediaBase + _random.Next(20) : mediaBase - _random.Next(20);
			totalPoints -= Jugador.Medias.Agresividad;

			Jugador.Medias.Defensa = IsDefensor ? mediaBase + _random.Next(20) : mediaBase - _random.Next(15);
			totalPoints -= Jugador.Medias.Defensa;

			Jugador.Medias.Tiro2 = IsTirador ? (int)(mediaBase * 1.15 + _random.Next(20)) : (int)(mediaBase - _random.Next(10));
			totalPoints -= Jugador.Medias.Tiro2;

			Jugador.Medias.Tiro3 = IsTirador ? (int)(mediaBase * 1.2 + _random.Next(15)) : (int)(mediaBase - _random.Next(10));
			totalPoints -= Jugador.Medias.Tiro3;

			Jugador.Medias.TiroL = IsTirador ? (int)(mediaBase * 1.2 + _random.Next(15)) : (int)(mediaBase - _random.Next(10));
			totalPoints -= Jugador.Medias.TiroL;

			Jugador.Medias.Rebotes = IsIntimidador ? mediaBase + _random.Next(10) : (int)(mediaBase * .9) - _random.Next(20);
			totalPoints -= Jugador.Medias.Rebotes;

			Jugador.Medias.Asistencias = IsCreador ? mediaBase + _random.Next(10) : mediaBase - _random.Next(15);
			totalPoints -= Jugador.Medias.Asistencias;

			Jugador.Medias.Oculto = 99;

			while (MediaDeseada != Jugador.Medias.MediaQuinteto)
			{
				Jugador.Medias.Add(MediaDeseada - Jugador.Medias.MediaQuinteto);
			}
		}

		private void GenerarMediaAlaPivot()
		{
			var totalPoints = MediaDeseada * 13 - 141;
			var mediaBase = totalPoints / 11;

			Jugador.Medias.SetMediasToValue(mediaBase);

			Jugador.Medias.Velocidad = IsVeloz ? (int)(mediaBase * .8) - _random.Next(15) : (int)(mediaBase * .7) - _random.Next(25);
			totalPoints -= Jugador.Medias.Velocidad;

			Jugador.Medias.Salto = IsAtletico ? mediaBase + _random.Next(5) : mediaBase - _random.Next(15);
			totalPoints -= Jugador.Medias.Salto;

			Jugador.Medias.Resistencia = IsAtletico ? mediaBase + _random.Next(20) : mediaBase - _random.Next(10);
			totalPoints -= Jugador.Medias.Resistencia;

			Jugador.Medias.Agresividad = IsIntimidador ? (int)(mediaBase * 1.1) + _random.Next(10) : mediaBase - _random.Next(15);
			totalPoints -= Jugador.Medias.Agresividad;

			Jugador.Medias.Defensa = IsDefensor ? mediaBase + _random.Next(15) : mediaBase - _random.Next(15);
			totalPoints -= Jugador.Medias.Defensa;

			Jugador.Medias.Tiro2 = IsTirador ? mediaBase + _random.Next(15) : (int)(mediaBase * .8 - _random.Next(20));
			totalPoints -= Jugador.Medias.Tiro2;

			Jugador.Medias.Tiro3 = IsTirador ? (int)(mediaBase * .75 + _random.Next(10)) : (int)(mediaBase * .4 - _random.Next(10));
			totalPoints -= Jugador.Medias.Tiro3;

			Jugador.Medias.TiroL = IsTirador ? mediaBase + _random.Next(25) : mediaBase - _random.Next(15);
			totalPoints -= Jugador.Medias.TiroL;

			Jugador.Medias.Rebotes = IsDefensor ? mediaBase + _random.Next(25) : mediaBase - _random.Next(15);
			totalPoints -= Jugador.Medias.Rebotes;

			Jugador.Medias.Asistencias = IsCreador ? (int)(mediaBase * .7) - _random.Next(10) : (int)(mediaBase * .66) - _random.Next(25);
			totalPoints -= Jugador.Medias.Asistencias;

			Jugador.Medias.Oculto = totalPoints;
			totalPoints -= Jugador.Medias.Oculto;

			while (MediaDeseada != Jugador.Medias.MediaQuinteto)
			{
				Jugador.Medias.Add(MediaDeseada - Jugador.Medias.MediaQuinteto);
			}
		}

		private void GenerarMediaPivot()
		{
			var totalPoints = MediaDeseada * 13 - 141;
			var mediaBase = totalPoints / 11;

			Jugador.Medias.SetMediasToValue(mediaBase);

			Jugador.Medias.Velocidad = IsVeloz ? (int)(mediaBase * .7) - _random.Next(5) : (int)(mediaBase * .5) - _random.Next(20);
			totalPoints -= Jugador.Medias.Velocidad;

			Jugador.Medias.Salto = IsAtletico ? mediaBase - _random.Next(5) : mediaBase - _random.Next(20);
			totalPoints -= Jugador.Medias.Salto;

			Jugador.Medias.Resistencia = IsAtletico ? mediaBase + _random.Next(15) : mediaBase - _random.Next(10);
			totalPoints -= Jugador.Medias.Resistencia;

			Jugador.Medias.Agresividad = IsIntimidador ? (int)(mediaBase * 1.1) + _random.Next(10) : mediaBase - _random.Next(15);
			totalPoints -= Jugador.Medias.Agresividad;

			Jugador.Medias.Defensa = IsDefensor ? mediaBase + _random.Next(15) : mediaBase - _random.Next(15);
			totalPoints -= Jugador.Medias.Defensa;

			Jugador.Medias.Tiro2 = IsTirador ? mediaBase + _random.Next(15) : (int)(mediaBase * .8 - _random.Next(20));
			totalPoints -= Jugador.Medias.Tiro2;

			Jugador.Medias.Tiro3 = IsTirador ? (int)(mediaBase * .5 + _random.Next(10)) : (int)(mediaBase * .25 - _random.Next(10));
			totalPoints -= Jugador.Medias.Tiro3;

			Jugador.Medias.TiroL = IsTirador ? mediaBase + _random.Next(15) : mediaBase - _random.Next(15);
			totalPoints -= Jugador.Medias.TiroL;

			Jugador.Medias.Rebotes = IsDefensor ? (int)(mediaBase * 1.1) + _random.Next(15) : (int)(mediaBase * 1) - _random.Next(10);
			totalPoints -= Jugador.Medias.Rebotes;

			Jugador.Medias.Asistencias = IsCreador ? (int)(mediaBase * .6) - _random.Next(10) : (int)(mediaBase * .4) - _random.Next(30);
			totalPoints -= Jugador.Medias.Asistencias;

			Jugador.Medias.Oculto = totalPoints;
			totalPoints -= Jugador.Medias.Oculto;

			while (MediaDeseada != Jugador.Medias.MediaQuinteto)
			{
				Jugador.Medias.Add(MediaDeseada - Jugador.Medias.MediaQuinteto);
			}
		}

		private bool _isVeloz;

		public bool IsVeloz
		{
			get { return _isVeloz; }
			set { SetProperty(ref _isVeloz, value); }
		}

		private bool _isAtletico;

		public bool IsAtletico
		{
			get { return _isAtletico; }
			set { SetProperty(ref _isAtletico, value); }
		}

		private bool _isIntimidador;

		public bool IsIntimidador
		{
			get { return _isIntimidador; }
			set { SetProperty(ref _isIntimidador, value); }
		}

		private bool _isTirador;

		public bool IsTirador
		{
			get { return _isTirador; }
			set { SetProperty(ref _isTirador, value); }
		}

		private bool _isCreador;

		public bool IsCreador
		{
			get { return _isCreador; }
			set { SetProperty(ref _isCreador, value); }
		}

		private bool _isDefensor;

		public bool IsDefensor
		{
			get { return _isDefensor; }
			set { SetProperty(ref _isDefensor, value); }
		}

		private int _mediaDeseada;
		public int MediaDeseada
		{
			get { return _mediaDeseada; }
			set
			{
				value = Math.Min(95, Math.Max(11, value));
				SetProperty(ref _mediaDeseada, value);
				GenerarMediaCommand.RaiseCanExecuteChanged();
			}
		}

		private Random _random;
		private readonly IDatabaseService _databaseService;

		#endregion
	}
}
