using Editor_PCBasket___Mou.ViewModels;
using EpcbModel;
using EpcbUtils;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Controls.Primitives;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;

namespace Editor_PCBasket___Mou.Views
{
	/// <summary>
	/// Lógica de interacción para EquipoWindow.xaml
	/// </summary>
	public partial class EquipoWindow
	{
		public EquipoWindow(Equipo equipo)
		{
			InitializeComponent();
			DataContext = new EquipoViewModel(equipo);
		}

		public EquipoWindow()
		{
			InitializeComponent();
		}

		private void NumberValidationTextBox(object sender, TextCompositionEventArgs e)
		{
			Regex regex = new Regex("[^0-9]+");
			e.Handled = regex.IsMatch(e.Text);
		}

		public delegate Point GetPosition(IInputElement element);
		int rowIndex = -1;

		private void PlantillaDataGrid_PreviewMouseLeftButtonDown(object sender, MouseButtonEventArgs e)
		{
			rowIndex = GetCurrentRowIndex(e.GetPosition);
			if (rowIndex < 0)
				return;
			PlantillaDataGrid.SelectedIndex = rowIndex;
			Jugador selectedEmp = PlantillaDataGrid.Items[rowIndex] as Jugador;
			if (selectedEmp == null)
				return;
			DragDropEffects dragdropeffects = DragDropEffects.Move;
			if (DragDrop.DoDragDrop(PlantillaDataGrid, selectedEmp, dragdropeffects)
								!= DragDropEffects.None)
			{
				PlantillaDataGrid.SelectedItem = selectedEmp;
			}
		}

		private void PlantillaDataGrid_Drop(object sender, DragEventArgs e)
		{
			if (rowIndex < 0)
				return;
			int index = this.GetCurrentRowIndex(e.GetPosition);
			if (index < 0)
				return;
			if (index == rowIndex)
				return;
			if (index == PlantillaDataGrid.Items.Count - 1)
			{
				//MessageBox.Show("This row-index cannot be drop");
				return;
			}

			var equipoVM = DataContext as EquipoViewModel;
			var plantillaAux = equipoVM.Equipo.Plantilla;

			var jugador = plantillaAux[rowIndex];

			plantillaAux.RemoveAt(rowIndex);
			plantillaAux.Insert(index, jugador);
		}

		private bool GetMouseTargetRow(Visual theTarget, GetPosition position)
		{
			try
			{
				Rect rect = VisualTreeHelper.GetDescendantBounds(theTarget);
				Point point = position((IInputElement)theTarget);
				return rect.Contains(point);
			}
			catch (Exception)
			{
				return false;
			}
		}

		private DataGridRow GetRowItem(int index)
		{
			if (PlantillaDataGrid.ItemContainerGenerator.Status
					!= GeneratorStatus.ContainersGenerated)
				return null;
			return PlantillaDataGrid.ItemContainerGenerator.ContainerFromIndex(index)
															as DataGridRow;
		}

		private int GetCurrentRowIndex(GetPosition pos)
		{
			int curIndex = -1;
			for (int i = 0; i < PlantillaDataGrid.Items.Count; i++)
			{
				DataGridRow itm = GetRowItem(i);
				if (GetMouseTargetRow(itm, pos))
				{
					curIndex = i;
					break;
				}
			}
			return curIndex;
		}

		private void ComboBox_SelectionChanged(object sender, System.Windows.Controls.SelectionChangedEventArgs e)
		{
			BanderaImage.Source = DbdatUtils.GetBanderaBitmap((Pais)NacionalidadComboBox.SelectedItem);
		}

		private void PunteroTextBoxTextChanged(object sender, System.Windows.Controls.TextChangedEventArgs e)
		{
			if (string.IsNullOrEmpty(PunteroTextBox.Text)) return;

			Image3Desc.Source = DbdatUtils.Get3Desc(int.Parse(PunteroTextBox.Text));
			ImageMiniesc.Source = DbdatUtils.GetMiniesc(int.Parse(PunteroTextBox.Text));
			ImageNanoesc.Source = DbdatUtils.GetNanoesc(int.Parse(PunteroTextBox.Text));
			ImageRidiesc.Source = DbdatUtils.GetRidiesc(int.Parse(PunteroTextBox.Text));
		}

		private void DataGridRow_MouseDoubleClick(object sender, MouseButtonEventArgs e)
		{
			var jugador = PlantillaDataGrid.SelectedItem as Jugador;

			if (jugador == null) return;

			var jugWindow = new JugadorWindow(jugador);
			jugWindow.Closed += JugWindow_Closed;
			jugWindow.Show();
		}

		private void JugWindow_Closed(object sender, EventArgs e)
		{
			((EquipoViewModel)DataContext).ReloadMedias();
		}

		private void DeleteJugadorClick(object sender, RoutedEventArgs e)
		{
			var jugador = PlantillaDataGrid.SelectedItem as Jugador;

			if (jugador == null) return;

			((EquipoViewModel)DataContext).DeleteJugador(jugador);
		}

		private void AddJugadorClick(object sender, RoutedEventArgs e)
		{
			if (((EquipoViewModel)DataContext).Equipo.Plantilla.Count > 14 && ((EquipoViewModel)DataContext).Equipo.Puntero < 9000)
			{
				MessageBox.Show("El equipo ya tiene el número máximo de jugadores en plantilla.", "Información", MessageBoxButton.OK, MessageBoxImage.Information);
				e.Handled = true;
				return;
			}

			var jugW = new JugadorWindow();
			jugW.Closing += JugW_Closing;
			jugW.ButtonsStackPanel.Visibility = Visibility.Visible;
			jugW.Show();
		}

		private void JugW_Closing(object sender, System.ComponentModel.CancelEventArgs e)
		{
			var jugVM = ((JugadorWindow)sender).DataContext as JugadorViewModel;

			if (jugVM == null || !jugVM.ApplyChanges) return;

			((EquipoViewModel)DataContext).Equipo.Plantilla.Add(jugVM.Jugador);
			LoggerUtils.LogString(string.Format("El jugador {0} se ha añadido a la plantilla de {1}", jugVM.Jugador.NombreLargo, ((EquipoViewModel)DataContext).Equipo.NombreCorto));
		}
	}
}