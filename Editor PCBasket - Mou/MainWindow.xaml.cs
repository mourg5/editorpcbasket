using Editor_PCBasket___Mou.Properties;
using Editor_PCBasket___Mou.Views;
using EpcbModel;
using EpcbUtils;
using GalaSoft.MvvmLight.Threading;
using System;
using System.IO;
using System.Text.RegularExpressions;
using System.Windows;
using System.Windows.Forms;
using System.Windows.Input;
using MessageBox = System.Windows.MessageBox;

namespace Editor_PCBasket___Mou
{
	/// <summary>
	/// Lógica de interacción para MainWindow.xaml
	/// </summary>
	public partial class MainWindow
	{
		public MainWindow()
		{
			var logsPath = AppDomain.CurrentDomain.BaseDirectory + "Logs";
			var logFile = logsPath + "\\log_" + DateTime.Now.Ticks + ".txt";

			LoggerUtils.LogFilePath = logFile;

			if (!Directory.Exists(logsPath))
			{
				Directory.CreateDirectory(logsPath);
			}

			AppDomain.CurrentDomain.FirstChanceException += (sender, eventArgs) =>
			{
				//LoggerUtils.LogException(eventArgs.Exception);
			};

			AppDomain.CurrentDomain.UnhandledException += (sender, eventArgs) =>
			{
				LoggerUtils.LogException((Exception)eventArgs.ExceptionObject);
			};

			InitializeComponent();

			RutaTextBox.Text = Settings.Default.Path;
			DbdatUtils.PcbPath = Settings.Default.Path;
			HexUtils.AnoInicio = (short)Settings.Default.AnoInicio;

			DispatcherHelper.Initialize();

			DataContext = new MainViewModel();
		}

		private void DataGridRow_MouseDoubleClick(object sender, MouseButtonEventArgs e)
		{
			var equipo = EquiposDataGrid.SelectedItem as Equipo;
			if (equipo != null)
			{
				var equipoWindow = new EquipoWindow(equipo);
				equipoWindow.Show();
			}
		}

		private void Button_Click(object sender, RoutedEventArgs e)
		{
			if (string.IsNullOrEmpty(UrlTextBox.Text) || string.IsNullOrEmpty(UrlTextBox.Text) || string.IsNullOrEmpty(PunteroJugador.Text)) return;

			Equipo equipoGen;

			try
			{
				equipoGen = HtmlParserUtils.GetEquipoFromHtml(UrlTextBox.Text, int.Parse(PunteroEquipo.Text), int.Parse(PunteroJugador.Text));
				LoggerUtils.LogString("Generando equipo desde Proballers -> URL: " + UrlTextBox.Text + ". Puntero equipo: " + PunteroEquipo.Text + ". Puntero primer jugador: " + PunteroJugador.Text);
			}
			catch (Exception)
			{
				MessageBox.Show("Error al generar equipo. Compruebe la URL e inténtelo de nuevo.", "Generar equipo", MessageBoxButton.OK, MessageBoxImage.Error);
				return;
			}

			var ventEquipo = new EquipoWindow(equipoGen);
			ventEquipo.Show();
		}

		private void Button_Click_1(object sender, RoutedEventArgs e)
		{
			using (var fbd = new FolderBrowserDialog())
			{
				DialogResult result = fbd.ShowDialog();

				if (result == System.Windows.Forms.DialogResult.OK && !string.IsNullOrWhiteSpace(fbd.SelectedPath))
				{
					var ruta = fbd.SelectedPath.Replace("\\", @"\\");
					RutaTextBox.Text = ruta;
					Settings.Default.Path = ruta;
					Settings.Default.Save();
					DbdatUtils.PcbPath = ruta;
				}
			}
		}
		private void NumberValidationTextBox(object sender, TextCompositionEventArgs e)
		{
			Regex regex = new Regex("[^0-9]+");
			e.Handled = regex.IsMatch(e.Text);
		}
	}
}
