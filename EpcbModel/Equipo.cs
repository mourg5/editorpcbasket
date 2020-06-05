using GalaSoft.MvvmLight;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EpcbModel
{
	public class Equipo : ViewModelBase
	{
		public Equipo()
		{
			Plantilla = new ObservableCollection<Jugador>();
		}

		public int EquipoId { get; set; }

		private int _puntero;
		public int Puntero
		{
			get { return _puntero; }
			set
			{
				if (!Set(() => Puntero, ref _puntero, value)) return;
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

		private string _pabellon;

		public string Pabellon
		{
			get { return _pabellon; }
			set { Set(() => Pabellon, ref _pabellon, value); }
		}

		private int _aforo;

		public int Aforo
		{
			get { return _aforo; }
			set { Set(() => Aforo, ref _aforo, value); }
		}

		private int _presupuesto;

		public int Presupuesto
		{
			get { return _presupuesto; }
			set { Set(() => Presupuesto, ref _presupuesto, value); }
		}

		private string _entrenador;

		public string Entrenador
		{
			get { return _entrenador; }
			set { Set(() => Entrenador, ref _entrenador, value); }
		}

		private Pais _pais;

		public Pais Pais
		{
			get { return _pais; }
			set { Set(() => Pais, ref _pais, value); }
		}

		public void ReloadMedias()
		{
			RaisePropertyChanged(() => MediaPlantilla);
			RaisePropertyChanged(() => MediaQuinteto);
		}
		public double MediaQuinteto
		{
			get { return Math.Round(Plantilla.Sum(j => j.Medias.MediaQuinteto) / (double)Plantilla.Count, 2); }
		}

		public double MediaPlantilla
		{
			get { return Math.Round(Plantilla.Sum(j => j.Medias.MediaPlantilla) / (double)Plantilla.Count, 2); }
		}

		private ObservableCollection<Jugador> _plantilla;

		public ObservableCollection<Jugador> Plantilla
		{
			get { return _plantilla; }
			set { Set(() => Plantilla, ref _plantilla, value); }
		}
	}
}
