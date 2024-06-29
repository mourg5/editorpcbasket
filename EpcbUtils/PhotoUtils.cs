using EpcbModel;
using System;
using System.Diagnostics;
using System.Drawing.Drawing2D;
using System.Drawing;
using System.IO;
using System.Runtime.InteropServices;
using System.Threading;
using System.Windows.Forms;
using System.Net.Http;

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
		private static HttpClient _webClient = new HttpClient();

		public static async void CreatePhotos(string url, Jugador jugador)
		{
			if (url.ToLower().Contains("defaut")) return;

			var imageBytes = await _webClient.GetByteArrayAsync(url);
			var playerFoto = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, string.Format("Graficos\\tmp\\{0}.jpg", jugador.Puntero));
			File.WriteAllBytes(playerFoto, imageBytes);			

			CreateFotoImageMagick(jugador.Puntero, PhotoSize.MEDFOTO);
			CreateFotoImageMagick(jugador.Puntero, PhotoSize.MINIFOTO);
			CreateFotoImageMagick(jugador.Puntero, PhotoSize.NANOFOTO);
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

			var script = string.Format("/c magick {0} -resize {1} -crop {2} -type palette -compress none -remap {3} {4}", input, size, crop, palette, output);


			Process process = new Process();
			ProcessStartInfo startInfo = new ProcessStartInfo
			{
				WindowStyle = ProcessWindowStyle.Hidden,
				FileName = "cmd.exe",
				Arguments = script
			};
			process.StartInfo = startInfo;
			process.Start();
		}

		private static void CreateFotoMspaint(Jugador jugador, Image webFoto, PhotoSize format)
		{
			Rectangle crop;
			Size size;
			string fotoName;
			string folderName;
			int waitTime = 50;

			switch (format)
			{
				case PhotoSize.MEDFOTO:
					size = new Size(89, 89);
					crop = new Rectangle(14, 0, 60, 88);
					fotoName = "medfoto.bmp";
					folderName = "MEDFOTO";
					waitTime = 150;
					break;
				case PhotoSize.MINIFOTO:
					size = new Size(41, 41);
					crop = new Rectangle(6, 0, 27, 40);
					fotoName = "minifoto.bmp";
					folderName = "MINIFOTO";
					break;
				case PhotoSize.NANOFOTO:
					size = new Size(27, 27);
					crop = new Rectangle(4, 0, 18, 26);
					fotoName = "nanofoto.bmp";
					folderName = "NANOFOTO";
					break;
				default:
					size = new Size(89, 89);
					crop = new Rectangle(14, 0, 60, 88);
					fotoName = "medfoto.bmp";
					folderName = "MEDFOTO";
					break;
			}

			var image = ResizeImage(webFoto, size);
			var origBmp = new Bitmap(image);

			var cropBmp = origBmp.Clone(crop, origBmp.PixelFormat);
			CopyBitmapToClipboard(cropBmp);

			var paintPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "mspaint.exe");
			var template = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, string.Format("Graficos\\{0}", fotoName));
			var playerFoto = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, string.Format("Graficos\\{0}\\JUG{1:00000}.bmp", folderName, jugador.Puntero));
			File.Copy(template, playerFoto, true);
			var paint = Process.Start(new ProcessStartInfo(paintPath, playerFoto));

			paint.WaitForInputIdle();
			IntPtr h = paint.MainWindowHandle;
			SetForegroundWindow(h);
			Thread.Sleep(100);
			SendKeys.SendWait("^v");
			SendKeys.SendWait("%{f4}");
			Thread.Sleep(waitTime);
			SendKeys.SendWait("s");
			paint.Close();
			Thread.Sleep(waitTime);
		}

		[DllImport("User32.dll")]
		static extern int SetForegroundWindow(IntPtr point);

		private static void CopyBitmapToClipboard(Bitmap bmp)
		{
			Clipboard.SetImage(bmp);
		}

		private static Image ResizeImage(Image imgToResize, Size size)
		{
			int sourceWidth = imgToResize.Width;
			int sourceHeight = imgToResize.Height;

			float nPercent;
			float nPercentW = size.Width / (float)sourceWidth;
			float nPercentH = size.Height / (float)sourceHeight;

			if (nPercentH < nPercentW)
				nPercent = nPercentH;
			else
				nPercent = nPercentW;

			int destWidth = (int)(sourceWidth * nPercent);
			int destHeight = (int)(sourceHeight * nPercent);

			Bitmap b = new Bitmap(destWidth, destHeight);
			Graphics g = Graphics.FromImage((Image)b);
			g.InterpolationMode = InterpolationMode.HighQualityBicubic;

			g.DrawImage(imgToResize, 0, 0, destWidth, destHeight);
			g.Dispose();

			return (Image)b;
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
			catch (Exception)
			{
				// ignored
			}
		}
	}
}
