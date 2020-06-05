using GalaSoft.MvvmLight;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EpcbModel
{
	public class Jugador : ViewModelBase
	{
		public Jugador()
		{
			Medias = new Medias();
		}

		public int JugadorId { get; set; }

		private int _puntero;
		public int Puntero
		{
			get { return _puntero; }
			set
			{
				if (!Set(() => Puntero, ref _puntero, value)) return;
			}
		}

		private int _dorsal;
		public int Dorsal
		{
			get { return _dorsal; }
			set
			{
				Set(() => Dorsal, ref _dorsal, value);
			}
		}

		private string _nombreCorto;

		public string NombreCorto
		{
			get { return _nombreCorto; }
			set { Set(() => NombreCorto, ref _nombreCorto, value); }
		}

		private string _nombreLargo;

		public string NombreLargo
		{
			get { return _nombreLargo; }
			set { Set(() => NombreLargo, ref _nombreLargo, value); }
		}

		private Pais _nacionalidad;
		public Pais Nacionalidad
		{
			get { return _nacionalidad; }
			set
			{
				if (!Set(() => Nacionalidad, ref _nacionalidad, value)) return;
			}
		}

		private int _demarcacion;
		public int Demarcacion
		{
			get { return _demarcacion; }
			set { Set(() => Demarcacion, ref _demarcacion, value); }
		}

		private int _anoNacimiento;
		public int AnoNacimiento
		{
			get { return _anoNacimiento; }
			set { Set(() => AnoNacimiento, ref _anoNacimiento, value); }
		}

		private bool _colorPiel;
		public bool ColorPiel
		{
			get { return _colorPiel; }
			set { Set(() => ColorPiel, ref _colorPiel, value); }
		}

		private int _altura;
		public int Altura
		{
			get { return _altura; }
			set { Set(() => Altura, ref _altura, value); }
		}

		private int _peso;
		public int Peso
		{
			get { return _peso; }
			set { Set(() => Peso, ref _peso, value); }
		}

		private Medias _medias;
		public Medias Medias
		{
			get { return _medias; }
			set { Set(() => Medias, ref _medias, value); }
		}
	}
}
