using Editor_PCBasket___Mou.Properties;
using Editor_PCBasket___Mou.Views;
using EpcbModel;
using EpcbUtils;
using System;
using System.IO;
using System.Text.RegularExpressions;
using System.Threading;
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

			DataContext = new MainViewModel();
			LoadDataBase();
		}

		private void LoadDataBase()
		{
			while (((MainViewModel)DataContext).Loading)
			{
				Thread.Sleep(250);
			}

			System.Windows.Data.CollectionViewSource jugadorViewSource = ((System.Windows.Data.CollectionViewSource)(this.FindResource("jugadorViewSource")));
			jugadorViewSource.Source = DataBaseUtils.DataBase.Jugadores.Local;

			System.Windows.Data.CollectionViewSource equipoViewSource = ((System.Windows.Data.CollectionViewSource)(this.FindResource("equipoViewSource")));
			equipoViewSource.Source = DataBaseUtils.DataBase.Equipos.Local;
		}

		private void Equipos_MouseDoubleClick(object sender, MouseButtonEventArgs e)
		{
			var equipo = equipoDataGrid.SelectedItem as Equipo;
			if (equipo != null)
			{
				var equipoWindow = new EquipoWindow(equipo);
				equipoWindow.Show();
			}
		}

		private void Jugadores_MouseDoubleClick(object sender, MouseButtonEventArgs e)
		{
			var jugador = jugadorDataGrid.SelectedItem as Jugador;
			if (jugador != null)
			{
				var jugadorWindow = new JugadorWindow(jugador);
				jugadorWindow.Show();
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

		private void MetroWindow_Loaded(object sender, RoutedEventArgs e)
		{

		}

		private void EquiposExpander_Expanded(object sender, RoutedEventArgs e)
		{
			if (JugadoresExpander != null)
				JugadoresExpander.IsExpanded = false;
		}

		private void JugadoresExpander_Expanded(object sender, RoutedEventArgs e)
		{
			if (EquiposExpander != null)
				EquiposExpander.IsExpanded = false;
		}
	}
}
