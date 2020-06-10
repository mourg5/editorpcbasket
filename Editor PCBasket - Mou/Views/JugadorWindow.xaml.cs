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
	public partial class JugadorWindow
	{
		public JugadorWindow(Jugador jugador)
		{
			InitializeComponent();
			DataContext = new JugadorViewModel(jugador);
		}
		public JugadorWindow()
		{
			InitializeComponent();
		}
		private void NumberValidationTextBox(object sender, TextCompositionEventArgs e)
		{
			Regex regex = new Regex("[^0-9]+");
			e.Handled = regex.IsMatch(e.Text);
		}
		private void ComboBox_SelectionChanged(object sender, System.Windows.Controls.SelectionChangedEventArgs e)
		{
			if (NacionalidadComboBox.SelectedItem == null) return;

			BanderaImage.Source = DbdatUtils.GetBanderaBitmap((Pais)NacionalidadComboBox.SelectedItem);
		}

		private void TextBox_TextChanged(object sender, System.Windows.Controls.TextChangedEventArgs e)
		{
			if (string.IsNullOrEmpty(PunteroTextBox.Text)) return;

			FotoImage.Source = DbdatUtils.GetMedfoto(int.Parse(PunteroTextBox.Text));
		}
	}
}
