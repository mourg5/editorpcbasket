using EpcbModel;
using EpcbUtils;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.Command;
using System;
using System.IO;
using System.Windows.Media.Imaging;

namespace Editor_PCBasket___Mou.ViewModels
{
	public class JugadorViewModel : ViewModelBase
	{
		DinamicEncoding DinamicEncoding = new DinamicEncoding();

		public JugadorViewModel(Jugador jugador)
		{
			Jugador = jugador;

			MediaDeseada = 70;
			_random = new Random(DateTime.Now.Millisecond);
		}
		
		private Jugador _jugador;
		public Jugador Jugador
		{
			get { return _jugador; }
			set { Set(() => Jugador, ref _jugador, value); }
		}

		private BitmapImage _banderaImageSource;
		public BitmapImage BanderaImageSource
		{
			get { return _banderaImageSource; }
			set { Set(() => BanderaImageSource, ref _banderaImageSource, value); }
		}

		private BitmapImage _fotoImageSource;
		public BitmapImage FotoImageSource
		{
			get { return _fotoImageSource; }
			set { Set(() => FotoImageSource, ref _fotoImageSource, value); }
		}

		#region Generador medias 

		private RelayCommand _generarMediaCommand;

		public RelayCommand GenerarMediaCommand
		{
			get
			{
				if (_generarMediaCommand == null)
				{
					_generarMediaCommand = new RelayCommand(ExecuteGenerarMedia, CanExecuteGenerarMedia);
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
			set { Set(() => IsVeloz, ref _isVeloz, value); }
		}

		private bool _isAtletico;

		public bool IsAtletico
		{
			get { return _isAtletico; }
			set { Set(() => IsAtletico, ref _isAtletico, value); }
		}

		private bool _isIntimidador;

		public bool IsIntimidador
		{
			get { return _isIntimidador; }
			set { Set(() => IsIntimidador, ref _isIntimidador, value); }
		}

		private bool _isTirador;

		public bool IsTirador
		{
			get { return _isTirador; }
			set { Set(() => IsTirador, ref _isTirador, value); }
		}

		private bool _isCreador;

		public bool IsCreador
		{
			get { return _isCreador; }
			set { Set(() => IsCreador, ref _isCreador, value); }
		}

		private bool _isDefensor;

		public bool IsDefensor
		{
			get { return _isDefensor; }
			set { Set(() => IsDefensor, ref _isDefensor, value); }
		}

		private int _mediaDeseada;
		public int MediaDeseada
		{
			get { return _mediaDeseada; }
			set
			{
				value = Math.Min(95, Math.Max(11, value));
				Set(() => MediaDeseada, ref _mediaDeseada, value);
				GenerarMediaCommand.RaiseCanExecuteChanged();
			}
		}

		private Random _random;

		#endregion

		private RelayCommand _guardarCommand;

		public RelayCommand GuardarCommand
		{
			get
			{
				if (_guardarCommand == null)
				{
					_guardarCommand = new RelayCommand(ExecuteGuardar, CanExecuteGuardar);
				}
				return _guardarCommand;
			}
		}

		private void ExecuteGuardar()
		{
		}

		private bool CanExecuteGuardar()
		{
			//TODO: Implement condition
			return true;
		}
	}
}
