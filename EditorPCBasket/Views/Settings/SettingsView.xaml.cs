using System.Text.RegularExpressions;
using System.Windows.Controls;
using System.Windows.Input;

namespace Editor_PCBasket___Mou.Views.Settings
{
	/// <summary>
	/// Lógica de interacción para SettingsView.xaml
	/// </summary>
	public partial class SettingsView : UserControl
	{
		public SettingsView()
		{
			InitializeComponent();
		}

		private void NumberValidationTextBox(object sender, TextCompositionEventArgs e)
		{
			Regex regex = new Regex("[^0-9]+");
			e.Handled = regex.IsMatch(e.Text);
		}
	}
}
