using EpcbModel;
using System;
using System.IO;
using System.Windows.Media.Imaging;

namespace EpcbUtils
{
	public static class DbdatUtils
	{
		public static string PcbPath { get; set; }

		public static string PcbPathForBitmaps
		{
			get
			{
				return PcbPath.Replace(@"\\", "\\");
			}
		}

		public static BitmapImage GetBanderaBitmap(Pais pais)
		{
			BitmapImage bandera;

			try
			{
				var uri = new Uri(string.Format("{0}\\DBDAT\\BANDERAS\\MINI\\BAN{1}.bmp", PcbPathForBitmaps, ((int)pais).ToString("0000")));
				bandera = new BitmapImage(uri);
			}
			catch (Exception)
			{
				bandera = new BitmapImage();
			}			

			return bandera;
		}

		public static BitmapImage GetMinifoto(int puntero)
		{
			BitmapImage foto;
			try
			{
				var uri = new Uri(string.Format("{0}\\DBDAT\\MINIFOTO\\JUG{1}.bmp", PcbPathForBitmaps, puntero.ToString("00000")));
				foto = new BitmapImage(uri);
			}
			catch (Exception)
			{
				foto = new BitmapImage();
			}

			return foto;
		}

		public static BitmapImage GetMedfoto(int puntero)
		{
			BitmapImage foto;
			try
			{
				var uri = new Uri(string.Format("{0}\\Graficos\\MEDFOTO\\JUG{1}.bmp", AppDomain.CurrentDomain.BaseDirectory, puntero.ToString("00000")));
				if (!File.Exists(uri.AbsolutePath))
				{
					uri = new Uri(string.Format("{0}\\DBDAT\\MEDFOTO\\JUG{1}.bmp", PcbPathForBitmaps, puntero.ToString("00000")));
				}
				foto = new BitmapImage(uri);
			}
			catch (Exception)
			{
				foto = new BitmapImage();
			}

			return foto;
		}

		public static BitmapImage Get3Desc(int puntero)
		{
			BitmapImage escudo;
			try
			{
				var uri = new Uri(string.Format("{0}\\DBDAT\\3DESC\\EQBA{1}.bmp", PcbPathForBitmaps, puntero.ToString("0000")));
				escudo = new BitmapImage(uri);
			}
			catch (Exception)
			{
				escudo = new BitmapImage();
			}

			return escudo;
		}

		public static BitmapImage GetMiniesc(int puntero)
		{
			BitmapImage escudo;
			try
			{
				var uri = new Uri(string.Format("{0}\\DBDAT\\MINIESC\\EQBA{1}.bmp", PcbPathForBitmaps, puntero.ToString("0000")));
				escudo = new BitmapImage(uri);
			}
			catch (Exception)
			{
				escudo = new BitmapImage();
			}

			return escudo;
		}
		
		public static BitmapImage GetNanoesc(int puntero)
		{
			BitmapImage escudo;
			try
			{
				var uri = new Uri(string.Format("{0}\\DBDAT\\NANOESC\\EQBA{1}.bmp", PcbPathForBitmaps, puntero.ToString("0000")));
				escudo = new BitmapImage(uri);
			}
			catch (Exception)
			{
				escudo = new BitmapImage();
			}

			return escudo;
		}

		public static BitmapImage GetRidiesc(int puntero)
		{
			BitmapImage escudo;
			try
			{
				var uri = new Uri(string.Format("{0}\\DBDAT\\RIDIESC\\EQBA{1}.bmp", PcbPathForBitmaps, puntero.ToString("0000")));
				escudo = new BitmapImage(uri);
			}
			catch (Exception)
			{
				escudo = new BitmapImage();
			}

			return escudo;
		}
	}
}
