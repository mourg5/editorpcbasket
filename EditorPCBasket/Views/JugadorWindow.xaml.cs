using Editor_PCBasket___Mou.ViewModels;
using EpcbModel;
using EpcbUtils;
using System.IO;
using System.Text.RegularExpressions;
using System.Windows.Input;

namespace Editor_PCBasket___Mou.Views
{
	/// <summary>
	/// Lógica de interacción para JugadorWindow.xaml
	/// </summary>
	public partial class JugadorView
	{
		private Jugador _player;

		public JugadorView(Jugador player)
		{
            _player = player;
            InitializeComponent();
		}
		public JugadorView()
		{
			_player = new Jugador();
			InitializeComponent();
		}
		private void NumberValidationTextBox(object sender, TextCompositionEventArgs e)
		{
			Regex regex = new Regex("[^0-9]+");
			e.Handled = regex.IsMatch(e.Text);
		}
		private void ComboBox_SelectionChanged(object sender, System.Windows.Controls.SelectionChangedEventArgs e)
		{
			if (NacionalidadComboBox.SelectedItem == null || BanderaImage == null) return;

			BanderaImage.Source = DbdatUtils.GetBanderaBitmap((Pais)NacionalidadComboBox.SelectedItem);
		}

		private void TextBox_TextChanged(object sender, System.Windows.Controls.TextChangedEventArgs e)
		{
			if (string.IsNullOrEmpty(PunteroTextBox.Text)) return;

			SetFoto();
		}

		private void SetFoto()
		{
			if (FotoImage == null) return;
            FotoImage.Source = DbdatUtils.GetMedfoto(int.Parse(PunteroTextBox.Text));
        }

		private void AceptarClick(object sender, System.Windows.RoutedEventArgs e)
		{
			((JugadorViewModel)DataContext).ApplyChanges = true;
			this.Close();
		}

		private void CancelarClick(object sender, System.Windows.RoutedEventArgs e)
		{
			this.Close();
		}

		private void JugadorWindowDataContextChanged(object sender, System.Windows.DependencyPropertyChangedEventArgs e)
		{
			var jugadorViewModel = DataContext as JugadorViewModel;
			if(jugadorViewModel == null) return;
			jugadorViewModel.Jugador = _player;
		}

		private void Window_Loaded(object sender, System.Windows.RoutedEventArgs e)
		{
			SetFoto();
        }
    }
}
