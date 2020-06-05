using EpcbModel;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;

namespace EpcbUtils
{
	public static class DataBaseUtils
	{
		public static PcBasketContext DataBase = new PcBasketContext();

		public static Equipo GetEquipo(int puntero)
		{
			return DataBase.GetEquipo(puntero);
		}

		public static void CreateInitialDataBase()
		{
			try
			{
				foreach (var dbc in Directory.GetFiles(DbdatUtils.PcbPath + "\\DBDAT\\EQ022022"))
				{
					using (var eqFile = File.OpenRead(dbc))
					{
						var equipo = HexUtils.ReadEquipoBytes(eqFile);
						if (equipo.Puntero == -5) continue;
						if (DataBase.Equipos.Where(e => e.Puntero == equipo.Puntero).Any())
						{
							DataBase.Equipos.Remove(DataBase.Equipos.Where(e => e.Puntero == equipo.Puntero).FirstOrDefault());
						}
						DataBase.Equipos.Add(equipo);
					}
				}

				DataBase.SaveChanges();
			}
			catch (Exception)
			{
				MessageBox.Show("No se encontraron equipos en la ruta especificada.", "Base de datos", MessageBoxButton.OK, MessageBoxImage.Warning);
			}
		}

		public static void GuardarEquipo(Equipo equipo)
		{
			if (!DataBase.Equipos.Where(p => p.Puntero == equipo.Puntero).Any())
			{
				DataBase.Equipos.Add(equipo);
			}

			DataBase.SaveChanges();
		}
	}
}
