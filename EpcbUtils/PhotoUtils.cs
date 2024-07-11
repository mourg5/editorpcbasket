using EpcbModel;
using System;
using System.Diagnostics;
using System.IO;
using System.Threading;
using System.Net.Http;
using System.Collections.Generic;

namespace EpcbUtils
{
	public enum PhotoSize
	{
		MEDFOTO = 0,
		MINIFOTO = 1,
		NANOFOTO = 2
	}

	public static class PhotoUtils
	{
		#region Fotos

		public static void CreatePhotos(string url, Jugador jugador)
		{
			var thread = new Thread(() => CreatePhotosThread(url, jugador));
			thread.Start();
		}

		private static async void CreatePhotosThread(string url, Jugador jugador)
		{
			try
			{
				if (url.ToLower().Contains("defaut")) return;

				var imageBytes = await _webClient.GetByteArrayAsync(url);
				var playerFoto = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, string.Format("Graficos\\tmp\\{0}.jpg", jugador.Puntero));
				File.WriteAllBytes(playerFoto, imageBytes);

				CreateFotoImageMagick(jugador.Puntero, PhotoSize.MEDFOTO);
				CreateFotoImageMagick(jugador.Puntero, PhotoSize.MINIFOTO);
				CreateFotoImageMagick(jugador.Puntero, PhotoSize.NANOFOTO);
				RemapFotos(jugador.Puntero);
			}
			catch (Exception ex)
			{
				LoggerUtils.LogException(ex);
			}
		}

		private static void CreateFotoImageMagick(int puntero, PhotoSize format)
		{
			string input = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, string.Format("Graficos\\tmp\\{0}.jpg", puntero));
			string folder;
			string size;
			string crop;

			switch (format)
			{
				case PhotoSize.MEDFOTO:
					size = "89x89";
					crop = "61x89+14+0";
					folder = "MEDFOTO";
					break;
				case PhotoSize.MINIFOTO:
					size = "41x41";
					crop = "28x41+6+0";
					folder = "MINIFOTO";
					break;
				case PhotoSize.NANOFOTO:
					size = "27x27";
					crop = "19x27+4+0";
					folder = "NANOFOTO";
					break;
				default:
					size = "89x89";
					crop = "61x89+14+0";
					folder = "MEDFOTO";
					break;
			}

			var output = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, string.Format("Graficos\\{0}\\JUG{1:00000}.bmp", folder, puntero));
			var palette = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Graficos\\palette.bmp");

			var script = string.Format("/c magick \"{0}\" -resize {1} -crop {2} -type palette -compress none -remap \"{3}\" BMP3:\"{4}\"", input, size, crop, palette, output);


			ExecuteCmd(script);
		}

		private static void RemapFotos(int puntero)
		{
			try
			{
				var medfoto = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, string.Format("Graficos\\MEDFOTO\\JUG{0:00000}.bmp", puntero));
				var minifoto = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, string.Format("Graficos\\MINIFOTO\\JUG{0:00000}.bmp", puntero));
				var nanofoto = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, string.Format("Graficos\\NANOFOTO\\JUG{0:00000}.bmp", puntero));

				Remap(medfoto, 61, 89, 267);
				Remap(minifoto, 28, 41);
				Remap(nanofoto, 19, 27);
			}
			catch (Exception ex)
			{
				LoggerUtils.LogException(ex);
			}
		}

		#endregion

		#region Escudos

		public static void CreateEscudos(string url, int puntero)
		{
			var thread = new Thread(() => CreateEscudosThread(url, puntero));
			thread.Start();
		}

		private static async void CreateEscudosThread(string url, int puntero)
		{
			try
			{
				var bigUrl = url.Replace("width=1", "width=3");
				byte[] imageBytes;

				try
				{
					imageBytes = await _webClient.GetByteArrayAsync(bigUrl);
				}
				catch (Exception)
				{
					imageBytes = await _webClient.GetByteArrayAsync(url);
				}

				var escudoFile = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, string.Format("Graficos\\tmp\\eq3d{0}.png", puntero));
				File.WriteAllBytes(escudoFile, imageBytes);

				Create3DEsc(puntero);
				CreateMiniesc(puntero);
				CreateNanoesc(puntero);
				CreateRidiesc(puntero);
				RemapEscudos(puntero);
			}
			catch (Exception ex)
			{
				LoggerUtils.LogException(ex);
			}
		}

		private static void Create3DEsc(int puntero)
		{
			string folder = "3DESC";
			var palette = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Graficos\\palette.bmp");

			string input = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, string.Format("Graficos\\tmp\\eq3d{0}.png", puntero));
			var output = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, string.Format("Graficos\\{0}\\EQBA{1:0000}.bmp", folder, puntero));
			var script = string.Format("/c magick \"{0}\" -background black -alpha remove -alpha off -resize 84x84 -gravity center -extent 120x120 -type palette -compress none -remap \"{1}\" BMP3:\"{2}\"", input, palette, output);

			var inputAlpha = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, string.Format("Graficos\\tmp\\eq3d{0}_alpha.png", puntero));
			var outputAlpha = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, string.Format("Graficos\\{0}\\EQBA{1:0000}_ALPHA.bmp", folder, puntero));
			var scriptExtractAlpha = string.Format("/c magick \"{0}\" -alpha extract \"{1}\"", input, inputAlpha);
			var scriptAlpha = string.Format("/c magick \"{0}\" -resize 84x84 -gravity center -background black -extent 120x120 -type palette -compress none -remap \"{1}\" BMP3:\"{2}\"", inputAlpha, palette, outputAlpha);

			ExecuteCmd(script);
			ExecuteCmd(scriptExtractAlpha);
			ExecuteCmd(scriptAlpha);
		}

		private static void CreateMiniesc(int puntero)
		{
			string folder = "MINIESC";
			var palette = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Graficos\\palette.bmp");

			string input = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, string.Format("Graficos\\tmp\\eq3d{0}.png", puntero));
			var output = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, string.Format("Graficos\\{0}\\EQBA{1:0000}.bmp", folder, puntero));
			var tmpScript = string.Format("/c magick \"{0}\" -gravity center -background black -alpha remove -alpha off -resize 48x48 -extent 48x63 -type palette -compress none -remap \"{1}\" BMP3:\"{2}\"", input, palette, output);
			var script = string.Format("/c magick \"{0}\" -background black -extent 54x70 -type palette -compress none -remap \"{1}\" BMP3:\"{2}\"", output, palette, output);

			var inputAlpha = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, string.Format("Graficos\\tmp\\eq3d{0}_alpha.png", puntero));
			var outputAlpha = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, string.Format("Graficos\\{0}\\EQBA{1:0000}_ALPHA.bmp", folder, puntero));
			var scriptExtractAlpha = string.Format("/c magick \"{0}\" -alpha extract {1}", input, inputAlpha);
			var tmpScriptAlpha = string.Format("/c magick \"{0}\" -gravity center -background black -resize 48x48 -extent 48x63 -type palette -compress none -remap \"{1}\" BMP3:\"{2}\"", inputAlpha, palette, outputAlpha);
			var scriptAlpha = string.Format("/c magick \"{0}\" -background black -extent 54x70 -type palette -compress none -remap \"{1}\" BMP3:\"{2}\"", outputAlpha, palette, outputAlpha);

			ExecuteCmd(tmpScript);
			ExecuteCmd(script);
			ExecuteCmd(scriptExtractAlpha);
			ExecuteCmd(tmpScriptAlpha);
			ExecuteCmd(scriptAlpha);
		}

		private static void CreateNanoesc(int puntero)
		{
			string folder = "NANOESC";
			var palette = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Graficos\\palette.bmp");

			string input = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, string.Format("Graficos\\tmp\\eq3d{0}.png", puntero));
			var output = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, string.Format("Graficos\\{0}\\EQBA{1:0000}.bmp", folder, puntero));
			var nanoScript = string.Format("\"{0}\" ( +clone -background black -shadow 75x20+30+30 ) -background white +swap -layers merge +repage -resize 33x33 -extent 30x30 -type palette -compress none -remap \"{1}\" -write BMP3:\"{2}\"", input, palette, output);
			var nanoFile = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, string.Format("Graficos\\tmp\\nanoscript{0}.mgk", puntero));

			File.WriteAllText(nanoFile, nanoScript);

			var script = string.Format("/c magick -script \"{0}\"", nanoFile);

			ExecuteCmd(script);
		}

		private static void CreateRidiesc(int puntero)
		{
			string folder = "RIDIESC";
			var palette = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Graficos\\palette.bmp");

			string input = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, string.Format("Graficos\\tmp\\eq3d{0}.png", puntero));
			var output = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, string.Format("Graficos\\{0}\\EQBA{1:0000}.bmp", folder, puntero));
			var nanoScript = string.Format("\"{0}\" ( +clone -background black -shadow 75x20+30+30 ) -background white +swap -layers merge +repage -resize 20x20 -extent 18x18 -type palette -compress none -remap \"{1}\" -write BMP3:\"{2}\"", input, palette, output);
			var nanoFile = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, string.Format("Graficos\\tmp\\nanoscript{0}.mgk", puntero));

			File.WriteAllText(nanoFile, nanoScript);

			var script = string.Format("/c magick -script \"{0}\"", nanoFile);

			ExecuteCmd(script);
		}

		private static void RemapEscudos(int puntero)
		{
			try
			{
				var _3desc = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, string.Format("Graficos\\3DESC\\EQBA{0:0000}.bmp", puntero));
				var miniesc = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, string.Format("Graficos\\MINIESC\\EQBA{0:0000}.bmp", puntero));
				var nanoesc = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, string.Format("Graficos\\NANOESC\\EQBA{0:0000}.bmp", puntero));
				var ridiesc = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, string.Format("Graficos\\RIDIESC\\EQBA{0:0000}.bmp", puntero));

				Remap(_3desc, 120, 120);
				Remap(miniesc, 54, 70);
				Remap(nanoesc, 30, 30, 60);
				Remap(ridiesc, 18, 18, 36);
			}
			catch (Exception ex)
			{
				LoggerUtils.LogException(ex);
			}
		}

		#endregion

		#region Bmp

		private static List<byte[]> _dinamicPalette;
		private static List<byte[]> _bmp2Palette;
		private static List<string> _bmp2ColorTable;
		private static List<string> _dinamicColorTable;

		public static void InitializeColorTables()
		{
			var bmpPalette = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Graficos\\bmp2palette.bmp");
			var dinamicPalette = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Graficos\\dinamicpalette.bmp");

			_bmp2ColorTable = ReadColorTable(bmpPalette);
			_bmp2Palette = ReadPalette(bmpPalette);
			_dinamicColorTable = ReadColorTable(dinamicPalette);
			_dinamicPalette = ReadPalette(dinamicPalette);
		}

		public static void Remap(string filePath, int width, int height, int offset = 0)
		{
			try
			{
				using (var fileStream = File.Open(filePath, FileMode.Open))
				{
					fileStream.Position = 0x36;
					foreach (var color in _dinamicPalette)
					{
						fileStream.Write(color, 0, 4);
					}

					do
					{
						var color = fileStream.ReadByte();
						if (color < 0) color = 255;
						var newColor = ReplaceColor(color);
						fileStream.Position--;
						fileStream.WriteByte(newColor);
					} while (fileStream.Position < fileStream.Length);

					fileStream.Close();

					LoggerUtils.LogString(string.Format("[GRAPHICS] Remapped file {0} to Dinamic palette", filePath));
				}
			}
			catch (Exception ex)
			{
				LoggerUtils.LogException(ex);
			}
		}

		private static List<string> ReadColorTable(string path)
		{
			List<string> colorTable = new List<string>();

			using (var fileStream = File.OpenRead(path))
			{
				fileStream.Position = 0x36;
				for (int i = 0; i < 256; i++)
				{
					byte[] color = new byte[4];
					fileStream.Read(color, 0, 4);
					colorTable.Add(string.Format("{0}{1}{2}{3}", color[0], color[1], color[2], color[3]));
				}
			}

			return colorTable;
		}

		private static List<byte[]> ReadPalette(string dinamicPalette)
		{
			var palette = new List<byte[]>();
			using (var fileStream = File.OpenRead(dinamicPalette))
			{
				fileStream.Position = 0x36;
				for (int i = 0; i < 256; i++)
				{
					var bytes = new byte[4];
					fileStream.Read(bytes, 0, 4);
					palette.Add(bytes);
				}
			}

			return palette;
		}

		private static byte ReplaceColor(int color)
		{
			try
			{
				var originalColor = _bmp2ColorTable[color];
				var newColor = _dinamicColorTable.IndexOf(originalColor);

				if (newColor < 0)
				{
					return FindNearestColor(color);
				}

				return (byte)newColor;
			}
			catch (Exception ex)
			{
				LoggerUtils.LogException(ex);
				return 0;
			}
		}

		private static byte FindNearestColor(int color)
		{
			var originalColor = _bmp2Palette[color];

			var minDifference = int.MaxValue;
			var minIndex = 0;

			for (int i = 0; i < 256; i++)
			{
				var diff = Math.Abs(originalColor[0] - _dinamicPalette[i][0])
					+ Math.Abs(originalColor[1] - _dinamicPalette[i][1])
					+ Math.Abs(originalColor[2] - _dinamicPalette[i][2])
					+ Math.Abs(originalColor[3] - _dinamicPalette[i][3]);

				if (diff < minDifference)
				{
					minDifference = diff;
					minIndex = i;
				}
			}

			return (byte)minIndex;
		}

		#endregion

		#region Aux

		private static HttpClient _webClient = new HttpClient();

		private static void ExecuteCmd(string command)
		{
			Process process = new Process();
			ProcessStartInfo startInfo = new ProcessStartInfo
			{
				WindowStyle = ProcessWindowStyle.Hidden,
				FileName = "cmd.exe",
				Arguments = string.Format("{0}", command),
			};
			process.StartInfo = startInfo;
			process.Start();
			process.WaitForExit();
		}

		public static void CopyPhotos(Equipo equipo)
		{
			try
			{
				foreach (var jugador in equipo.Plantilla)
				{
					var medfoto = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, string.Format("Graficos\\MEDFOTO\\JUG{0:00000}.bmp", jugador.Puntero));
					var minifoto = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, string.Format("Graficos\\MINIFOTO\\JUG{0:00000}.bmp", jugador.Puntero));
					var nanofoto = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, string.Format("Graficos\\NANOFOTO\\JUG{0:00000}.bmp", jugador.Puntero));

					File.Copy(medfoto, Path.Combine(DbdatUtils.PcbPathForBitmaps, string.Format("DBDAT\\MEDFOTO\\JUG{0:00000}.bmp", jugador.Puntero)), true);
					File.Copy(minifoto, Path.Combine(DbdatUtils.PcbPathForBitmaps, string.Format("DBDAT\\MINIFOTO\\JUG{0:00000}.bmp", jugador.Puntero)), true);
					File.Copy(nanofoto, Path.Combine(DbdatUtils.PcbPathForBitmaps, string.Format("DBDAT\\NANOFOTO\\JUG{0:00000}.bmp", jugador.Puntero)), true);
				}
			}
			catch (Exception ex)
			{
				LoggerUtils.LogException(ex);
			}
		}

		public static void CopyEscudos(int puntero)
		{
			try
			{
				var _3desc = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, string.Format("Graficos\\3DESC\\EQBA{0:0000}.bmp", puntero));
				var _3descAlpha = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, string.Format("Graficos\\3DESC\\EQBA{0:0000}_ALPHA.bmp", puntero));
				var miniesc = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, string.Format("Graficos\\MINIESC\\EQBA{0:0000}.bmp", puntero));
				var miniescAlpha = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, string.Format("Graficos\\MINIESC\\EQBA{0:0000}_ALPHA.bmp", puntero));
				var nanoesc = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, string.Format("Graficos\\NANOESC\\EQBA{0:0000}.bmp", puntero));
				var ridiesc = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, string.Format("Graficos\\RIDIESC\\EQBA{0:0000}.bmp", puntero));

				File.Copy(_3desc, Path.Combine(DbdatUtils.PcbPathForBitmaps, string.Format("DBDAT\\3DESC\\EQBA{0:0000}.bmp", puntero)), true);
				File.Copy(_3descAlpha, Path.Combine(DbdatUtils.PcbPathForBitmaps, string.Format("DBDAT\\3DESC\\EQBA{0:0000}_ALPHA.bmp", puntero)), true);
				File.Copy(miniesc, Path.Combine(DbdatUtils.PcbPathForBitmaps, string.Format("DBDAT\\MINIESC\\EQBA{0:0000}.bmp", puntero)), true);
				File.Copy(miniescAlpha, Path.Combine(DbdatUtils.PcbPathForBitmaps, string.Format("DBDAT\\MINIESC\\EQBA{0:0000}_ALPHA.bmp", puntero)), true);
				File.Copy(nanoesc, Path.Combine(DbdatUtils.PcbPathForBitmaps, string.Format("DBDAT\\NANOESC\\EQBA{0:0000}.bmp", puntero)), true);
				File.Copy(ridiesc, Path.Combine(DbdatUtils.PcbPathForBitmaps, string.Format("DBDAT\\RIDIESC\\EQBA{0:0000}.bmp", puntero)), true);

			}
			catch (Exception ex)
			{
				LoggerUtils.LogException(ex);
			}
		}

		#endregion
	}
}

