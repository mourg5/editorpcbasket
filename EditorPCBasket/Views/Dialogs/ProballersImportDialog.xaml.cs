using System.Text.RegularExpressions;
using System.Windows.Controls;
using System.Windows.Input;

namespace Editor_PCBasket___Mou.Views.Dialogs
{
	/// <summary>
	/// Lógica de interacción para ProballersImportDialog.xaml
	/// </summary>
	public partial class ProballersImportDialog : UserControl
	{
		public ProballersImportDialog()
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
