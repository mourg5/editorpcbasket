using EpcbModel;
using System.Windows.Controls;
using System.Windows.Input;

namespace Editor_PCBasket___Mou.Views.Teams
{
	/// <summary>
	/// Lógica de interacción para TeamsView.xaml
	/// </summary>
	public partial class TeamsView : UserControl
	{
		public TeamsView()
		{
			InitializeComponent();
		}

		#region DataGrid events

		private void DataGridRow_MouseDoubleClick(object sender, MouseButtonEventArgs e)
		{
			var equipo = EquiposDataGrid.SelectedItem as Equipo;
			if (equipo != null)
			{
				var equipoWindow = new EquipoWindow(equipo);
				equipoWindow.Show();
			}
		}

		#endregion


	}
}
