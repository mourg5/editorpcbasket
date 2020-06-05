using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Data;

namespace Editor_PCBasket___Mou.Converters
{
	[ValueConversion(typeof(int), typeof(string))]
	public sealed class DemarcacionConverter : IValueConverter
	{
		public object Convert(object value, Type targetType,
			object parameter, CultureInfo culture)
		{
			switch ((int)value)
			{
				case 0:
					return "B";
				case 1:
					return "E";
				case 2:
					return "A";
				case 3:
					return "AP";
				case 4:
					return "P";
				default:
					return "";
			}
		}

		public object ConvertBack(object value, Type targetType,
			object parameter, CultureInfo culture)
		{
			return null;
		}
	}

}
