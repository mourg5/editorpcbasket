using EpcbModel;
using EpcbUtils;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Data;
using System.Windows.Media;

namespace Editor_PCBasket___Mou.Converters
{
	[ValueConversion(typeof(string), typeof(ImageSource))]
	public class PaisToBanderaConverter : IValueConverter
	{
		public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
		{
			return DbdatUtils.GetBanderaBitmap((Pais)value);
		}

		public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
		{
			throw new NotImplementedException();
		}
	}
}
