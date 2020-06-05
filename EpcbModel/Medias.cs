using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace EpcbModel
{
	public class Medias : INotifyPropertyChanged
	{
		private int velocidad;
		private int salto;
		private int resistencia;
		private int agresividad;
		private int oculto;
		private int defensa;
		private int tiro2;
		private int tiro3;
		private int tiroL;
		private int rebotes;
		private int asistencias;

		public Medias()
		{
			Velocidad = 50;
			Salto = 50;
			Resistencia = 50;
			Agresividad = 50;
			Oculto = 50;
			Defensa = 50;
			Tiro2 = 50;
			Tiro3 = 50;
			TiroL = 50;
			Rebotes = 50;
			Asistencias = 50;
		}

		public void SetMediasToValue(int value)
		{
			Velocidad = value;
			Salto = value;
			Resistencia = value;
			Agresividad = value;
			Oculto = value;
			Defensa = value;
			Tiro2 = value;
			Tiro3 = value;
			TiroL = value;
			Rebotes = value;
			Asistencias = value;
		}

		public void Add(int value)
		{
			Velocidad += value;
			Salto += value;
			Resistencia += value;
			Agresividad += value;
			Oculto += value;
			Defensa += value;
			Tiro2 += value;
			Tiro3 += value;
			TiroL += value;
			Rebotes += value;
			Asistencias += value;
		}

		public int Velocidad
		{
			get => velocidad;
			set
			{
				velocidad = Math.Max(0, Math.Min(value, 99));
				OnPropertyChanged();
				OnPropertyChanged("MediaQuinteto");
				OnPropertyChanged("MediaPlantilla");
			}
		}
		public int Salto
		{
			get => salto;
			set
			{
				salto = Math.Max(0, Math.Min(value, 99));
				OnPropertyChanged();
				OnPropertyChanged("MediaQuinteto");
				OnPropertyChanged("MediaPlantilla");
			}
		}
		public int Resistencia
		{
			get => resistencia;
			set
			{
				resistencia = Math.Max(0, Math.Min(value, 99));
				OnPropertyChanged();
				OnPropertyChanged("MediaQuinteto");
				OnPropertyChanged("MediaPlantilla");
			}
		}
		public int Agresividad
		{
			get => agresividad;
			set
			{
				agresividad = Math.Max(0, Math.Min(value, 99));
				OnPropertyChanged();
				OnPropertyChanged("MediaQuinteto");
				OnPropertyChanged("MediaPlantilla");
			}
		}
		public int Oculto
		{
			get => oculto;
			set
			{
				oculto = Math.Max(0, Math.Min(value, 99));
				OnPropertyChanged();
				OnPropertyChanged("MediaQuinteto");
				OnPropertyChanged("MediaPlantilla");
			}
		}
		public int Defensa
		{
			get => defensa;
			set
			{
				defensa = Math.Max(0, Math.Min(value, 99));
				OnPropertyChanged();
				OnPropertyChanged("MediaQuinteto");
				OnPropertyChanged("MediaPlantilla");
			}
		}
		public int Tiro2
		{
			get => tiro2;
			set
			{
				tiro2 = Math.Max(0, Math.Min(value, 99));
				OnPropertyChanged();
				OnPropertyChanged("MediaQuinteto");
				OnPropertyChanged("MediaPlantilla");
			}
		}
		public int Tiro3
		{
			get => tiro3;
			set
			{
				tiro3 = Math.Max(0, Math.Min(value, 99));
				OnPropertyChanged();
				OnPropertyChanged("MediaQuinteto");
				OnPropertyChanged("MediaPlantilla");
			}
		}
		public int TiroL
		{
			get => tiroL;
			set
			{
				tiroL = Math.Max(0, Math.Min(value, 99));
				OnPropertyChanged();
				OnPropertyChanged("MediaQuinteto");
				OnPropertyChanged("MediaPlantilla");
			}
		}
		public int Rebotes
		{
			get => rebotes;
			set
			{
				rebotes = Math.Max(0, Math.Min(value, 99));
				OnPropertyChanged();
				OnPropertyChanged("MediaQuinteto");
				OnPropertyChanged("MediaPlantilla");
			}
		}
		public int Asistencias
		{
			get => asistencias;
			set
			{
				asistencias = Math.Max(0, Math.Min(value, 99));
				OnPropertyChanged();
				OnPropertyChanged("MediaQuinteto");
				OnPropertyChanged("MediaPlantilla");
			}
		}

		public int MediaQuinteto
		{
			private set { }
			get
			{
				return (int)Math.Round((Velocidad + Salto + Resistencia + Agresividad + Defensa + Tiro2 + Tiro3 + TiroL + Rebotes + Asistencias + Oculto + 141.0) / 13, 0);
			}
		}

		public int MediaPlantilla
		{
			get
			{
				return (int)Math.Round(((Velocidad + Salto + Resistencia + Agresividad + Defensa + Oculto) * 13 / 7 + 100.0) / 14);
			}
		}

		public event PropertyChangedEventHandler PropertyChanged;
		protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
		{
			var handler = PropertyChanged;
			if (handler != null) handler(this, new PropertyChangedEventArgs(propertyName));
		}
	}
}