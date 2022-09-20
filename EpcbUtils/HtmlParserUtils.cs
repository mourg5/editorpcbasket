using System;
using System.Collections.Generic;
using System.Linq;
using EpcbModel;
using HtmlAgilityPack;

namespace EpcbUtils
{
	public static class HtmlParserUtils
	{
		private static Random _rnd = new Random(DateTime.Now.Millisecond);
		private static List<int> _dorsales = Enumerable.Range(0, 99).OrderBy(g => Guid.NewGuid()).ToList();
		private static int _i = 0;

		public static Equipo GetEquipoFromHtml(string url, int pEquipo, int pJugador)
		{
			var web = new HtmlWeb();
			var doc = web.Load(url);

			var equipoRes = new Equipo
			{
				Puntero = pEquipo
			};

			var nombreEquipo = doc.DocumentNode.SelectSingleNode("//div[@class='identity__picture']").SelectSingleNode("img").Attributes["alt"].Value;

			equipoRes.NombreCorto = nombreEquipo;
			equipoRes.NombreLargo = nombreEquipo;

			var hPais = doc.DocumentNode.SelectSingleNode("//a[@class='breadcrumb-link']").Attributes["title"].Value;

			var pais = CountryToPais(hPais);

			equipoRes.Pais = pais;

			var eqInfo = doc.DocumentNode.SelectSingleNode("//div[@class='table__inner']");
			var plantilla = eqInfo.SelectSingleNode("//table[@class='table']").SelectSingleNode("//tbody");

			var punteroJug = pJugador;
			foreach (var jugador in plantilla.SelectNodes("//tr"))
			{
				var jugPlantilla = new Jugador() { Puntero = punteroJug };

				var jugNode = jugador.Descendants().ElementAt(3);
				var nombre = jugNode.InnerText;

				if (nombre.StartsWith("\n") && nombre.Length < 23) continue;

				nombre = nombre.Replace("\n", "");
				nombre = nombre.Replace("  ", "");

				var urlJug = jugNode.ParentNode.ChildNodes[1].Attributes[1].Value;

				try
				{
					var jug = GetJugadorFromUrl(urlJug);
					jug.Puntero = punteroJug;

					equipoRes.Plantilla.Add(jug);
					punteroJug++;
				}
				catch (Exception ex)
				{
					LoggerUtils.LogException(ex);
				}

				if (equipoRes.Plantilla.Count > 12) break;
			}

			return equipoRes;
		}

		private static Jugador GetJugadorFromUrl(string url)
		{
			var jugPlantilla = new Jugador();

			var web = new HtmlWeb();
			var doc = web.Load("https://www.proballers.com" + url);

			// Nombre
			var nombre = doc.DocumentNode.SelectSingleNode("//div[@class='identity__picture']").SelectSingleNode("img").Attributes["alt"].Value;

			var apellido = nombre.Substring(nombre.IndexOf(' ') + 1, nombre.Length - nombre.IndexOf(' ') - 2);
			var nom = nombre.Substring(0, nombre.IndexOf(' '));

			jugPlantilla.NombreCorto = apellido.ToUpper();
			jugPlantilla.NombreLargo = nom + " " + apellido.ToUpper();

			var infoJug = doc.DocumentNode.SelectSingleNode("//div[@class='identity__description']").ChildNodes["ul"];

			// Fecha nacimiento
			try
			{
				var birth = infoJug.ChildNodes.ElementAt(1).InnerText;
				var fnac = birth.Substring(birth.IndexOf(",") + 2, 4);

				jugPlantilla.AnoNacimiento = int.Parse(fnac);
			}
			catch (Exception)
			{
				jugPlantilla.AnoNacimiento = DateTime.Now.Year - 25;
			}

			// Altura y peso 
			try
			{
				var height = infoJug.ChildNodes.ElementAt(5).InnerText;
				var alt = height.Substring(0, 4).Replace("m", "");

				jugPlantilla.Altura = int.Parse(alt);
				jugPlantilla.Peso = jugPlantilla.Altura - 100 + _rnd.Next(-5, 5);
			}
			catch (Exception)
			{
				jugPlantilla.Altura = 200;
				jugPlantilla.Peso = 95;
			}

			// Nacionalidad
			try
			{
				var nacionalidad = infoJug.ChildNodes.ElementAt(3).InnerText;
				jugPlantilla.Nacionalidad = NationalityToPais(nacionalidad);
			}
			catch (Exception)
			{
				jugPlantilla.Nacionalidad = Pais.LUXEMBURGO;
			}

			// Posición
			try
			{
				var pos = infoJug.ChildNodes.ElementAt(7).InnerText;
				jugPlantilla.Demarcacion = StringToPosition(pos);
			}
			catch (Exception)
			{
				jugPlantilla.Demarcacion = 2;
			}

			// Dorsal
			jugPlantilla.Dorsal = _dorsales[_i];
			_i++;
			_i %= 100;

			return jugPlantilla;
		}

		private static int StringToPosition(string pos)
		{
			var str = pos.Substring(0, pos.IndexOf(" "));

			switch (str)
			{
				case ("PG"):
					return 0;
				case ("SG"):
					return 1;
				case ("SF"):
					return 2;
				case ("PF"):
					return 3;
				case ("C"):
					return 4;
				default:
					return 0;
			}
		}

		private static Pais CountryToPais(string country)
		{
			int pais;
			CountryCodes.TryGetValue(country, out pais);
			return pais == 0 ? Pais.LUXEMBURGO : (Pais)pais;
		}

		private static Pais NationalityToPais(string country)
		{
			int pais;
			NationalityCodes.TryGetValue(country, out pais);

			if (IsComunitario((Pais)pais)) return Pais.LUXEMBURGO;
			if (IsCotonou((Pais)pais)) return Pais.IRLANDA_DEL_NORTE;

			return pais == 0 ? Pais.LUXEMBURGO : (Pais)pais;
		}

		private static bool IsCotonou(Pais pais)
		{
			switch (pais)
			{
				case (Pais.BENIN):
				case (Pais.BURKINA_FASO):
				case (Pais.CABO_VERDE):
				case (Pais.COSTA_DE_MARFIL):
				case (Pais.GAMBIA):
				case (Pais.GHANA):
				case (Pais.GUINEA):
				case (Pais.GUINEA_BISSAU):
				case (Pais.LIBERIA):
				case (Pais.MALI):
				case (Pais.MAURITANIA):
				case (Pais.NIGER):
				case (Pais.NIGERIA):
				case (Pais.SENEGAL):
				case (Pais.SIERRA_LEONA):
				case (Pais.TOGO):

				case (Pais.CAMERÚN):
				case (Pais.REPUBLICA_CENTRO):
				case (Pais.CHAD):
				case (Pais.CONGO):
				case (Pais.GUINEA_ECUATORIANA):
				case (Pais.GABON):
				case (Pais.SANTO_TOME_Y_PR):

				case (Pais.BURUNDI):
				case (Pais.KENIA):
				case (Pais.RUANDA):
				case (Pais.SUDAN):
				case (Pais.TANZANIA):
				case (Pais.UGANDA):

				case (Pais.COMOROS):
				case (Pais.DJIBOUTI):
				case (Pais.ERITREA):
				case (Pais.ETIOPIA):
				case (Pais.MADAGASCAR):
				case (Pais.MALAWI):
				case (Pais.ISLAS_MAURICIOS):
				case (Pais.SEYCHELLES):
				case (Pais.SOMALIA):
				case (Pais.ZAMBIA):
				case (Pais.ZIMBABWE):

				case (Pais.ANGOLA):
				case (Pais.BOTSWANA):
				case (Pais.SUAZILANDIA):
				case (Pais.LESOTHO):
				case (Pais.MOZAMBIQUE):
				case (Pais.NAMIBIA):
				case (Pais.SUDAFRICA):
					return true;
			}
			return false;
		}

		private static bool IsComunitario(Pais pais)
		{
			switch (pais)
			{
				case (Pais.BULGARIA):
				case (Pais.CHIPRE):
				case (Pais.CROACIA):
				case (Pais.ESLOVAQUIA):
				case (Pais.ESLOVENIA):
				case (Pais.ESTONIA):
				case (Pais.HUNGRIA):
				case (Pais.ISRAEL):
				case (Pais.KAZAKISTAN):
				case (Pais.LETONIA):
				case (Pais.LITUANIA):
				case (Pais.POLONIA):
				case (Pais.REP_CHECA):
				case (Pais.RUMANIA):
				case (Pais.RUSIA):
					return true;
			}
			return false;
		}

		private static readonly Dictionary<string, int> NationalityCodes = new Dictionary<string, int>()
		{
			{"Albanian", 1},
			{"German", 2},
			{"Argentine", 3},
			{"Argentinian", 3},
			{"Australian", 4},
			{"Austrian", 5},
			{"Azerbaijani", 6},
			{"Belarusian", 7},
			{"Bolivian", 8},
			{"Bosnian and Herzegovinan", 9},
			{"Brazilian", 10},
			{"Bulgarian", 11},
			{"Belgian", 12},
			{"Cameroonian", 13},
			{"Chile", 14},
			{"Cyprus", 15},
			{"Colombian", 16},
			{"Croatian", 17},
			{"Denmark", 18},
			{"Scotland", 19},
			{"Slovakia", 20},
			{"Slovenia", 21},
			{"Spanish", 22},
			{"Finnish", 23},
			{"French", 24},
			{"Ghanaian", 25},
			{"Greek", 26 },
			{"Dutch", 27},
			{"Honduras", 28},
			{"Hungary", 29},
			{"United-Kingdom", 30},
			{"Ireland", 31},
			{"Northern Ireland", 32},
			{"Iceland", 33},
			{"Faroe Islands", 34},
			{"Israeli", 35},
			{"Italian", 36},
			{"Lithuanian", 37},
			{"Luxembourg", 38},
			{"Macedonian", 39},
			{"Malta", 40},
			{"Moroccan", 41},
			{"Moldovan", 42},
			{"Nigerian", 43},
			{"Norwegia", 44},
			{"Norwegian", 44},
			{"Wales", 45},
			{"Polish", 46},
			{"Portuguese", 47},
			{"Czech Republic", 48},
			{"Romanian", 49},
			{"Russian", 50},
			{"Serbia-Montenegro", 58},
			{"Serbian", 58},
			{"South African", 52},
			{"Swedish", 53},
			{"Swiss", 54},
			{"Turkish", 55},
			{"Ukrainian", 56},
			{"Uruguay", 57},
			//{"", 58},
			{"Peru", 59},
			{"Canadian", 60},
			{"American", 61},
			{"Georgian", 62},
			{"Costa Rica", 63},
			{"Paraguay", 64},
			{"Japanese", 65},
			{"Algerian", 66},
			{"Trinidad and Tobago", 67},
			{"Senegal", 68},
			{"Surinam", 69},
			{"Zambia", 70},
			{"Cape Verdean", 71},
			{"Venezuelan", 72},
			//{"Rhodesia", 73},
			{"Singapore", 74},
			{"Andorra", 75},
			{"Mozambique", 76},
			{"Liechtenstein", 77},
			{"Liberia", 78},
			{"Panama", 79},
			//{"Zaire", 80},
			{"Tajikistan", 81},
			{"Uzbekistan", 82},
			{"Mexico", 83},
			{"Guinea", 84},
			{"Angola", 85},
			{"Zimbabwe", 86},
			{"Sierra Leone", 87},
			{"Guadeloupe", 88},
			{"Ecuador", 89},
			{"Estonia", 90},
			{"Guinea Bissau", 91},
			{"Libya", 92},
			{"Egypt", 93},
			{"Jamaica", 94},
			//{"", 95},
			//{"", 96},
			{"New Zealand", 97},
			//{"", 98},
			//{"", 99},
			{"Chad", 100},
			{"Togo", 101},
			{"Guinea Conakry", 102},
			{"Tanzania", 103},
			{"Burkina Faso", 104},
			{"Gambia", 105},
			{"Rwanda", 106},
			{"Kenya", 107},
			{"Mauritania", 108},
			{"Mali", 109},
			{"Uganda", 110},
			{"Zaire", 111},
			{"Congo", 111},
			{"Latvia", 112},
			{"Ivory Coast", 113},
			{"Armenian", 114},
			{"Nicaragua", 115},
			//{"", 116},
			{"Niger", 117},
			{"Barbados", 118},
			{"Iran", 119},
			{"Qatar", 120},
			{"Tunisia", 121},
			{"Gabon", 122},
			{"Tahiti", 123},
			{"Mauritius", 124},
			{"Madagascar", 125},
			{"Martinica", 126},
			{"Vietnam", 127},
			{"Haiti", 128},
			{"Antigua and Barbuda", 129},
			{"Bahrein", 130},
			{"Bangladesh", 131},
			{"Belize", 132},
			{"Benin", 133},
			{"Bhutan", 134},
			{"Botswana", 135},
			{"Brunei", 136},
			{"Burundi", 137},
			{"Cambodia", 138},
			{"Central African Republic", 139},
			{"Chinese", 140},
			//{"", 141},
			{"Yemeni", 142},
			{"Cuban", 143},
			{"Djibouti", 144},
			{"Dominica", 145},
			{"Dominican Republic", 146},
			{"El Salvador", 147},
			{"Equatorial Guinea", 148},
			{"Eritrea", 149},
			{"Ethiopia", 150},
			//{"", 151},
			{"Fiji", 152},
			{"Grenade", 153},
			{"Guatemala", 154},
			{"Afghanistan", 155},
			{"India", 156},
			{"Indonesian", 157},
			{"Iraq", 158},
			{"Jordania", 159},
			{"Kazakhstan", 160},
			{"Kiribati", 161},
			{"Kuwait", 162},
			{"Kyrgyzstan", 163},
			{"Laos", 164},
			{"Vatican City", 165},
			{"Lebanon", 166},
			{"Lesotho", 167},
			{"Malawi", 168},
			{"Malaysia", 169},
			{"Falkland Islands", 170},
			{"Marshall Islands", 171},
			{"Monaco", 172},
			{"Mongolia", 173},
			{"Myanmar", 174},
			{"Namibia", 175},
			{"Nauru", 176},
			{"Nepal", 177},
			{"North Korea", 178},
			{"Oman", 179},
			{"Pakistan", 180},
			{"Palau", 181},
			{"Papua New Guinea", 182},
			{"Philippines", 183},
			{"Saint Kitts and Nevis", 184},
			{"Saint Lucia", 185},
			{"Samoa", 186},
			{"San Marino", 187},
			//{"", 188},
			{"Saudi Arabia", 189},
			{"Seychelles", 190},
			{"Solomon Islands", 191},
			{"Somalia", 192},
			{"Korea", 193},
			{"Sri Lanka", 194},
			{"Sudan", 195},
			{"Swaziland", 196},
			{"Eswatini", 196},
			{"Syria", 197},
			{"Taiwan", 198},
			{"Thailand", 199},
			{"The Bahamas", 200},
			{"Bahamas", 200},
			{"Tonga", 201},
			{"Turkmenistan", 202},
			{"Tuvalu", 203},
			{"United Arab Emirates", 204},
			//{"", 205},
			{"Vanuatu", 206},
		};

		private static readonly Dictionary<string, int> CountryCodes = new Dictionary<string, int>()
		{
			{"Albania", 1},
			{"Germany", 2},
			{"Argentina", 3},
			{"Australia", 4},
			{"Austria", 5},
			{"Azerbaidjan", 6},
			{"Belarus", 7},
			{"Bolivia", 8},
			{"Bosnia and Herzegovina", 9},
			{"Brazil", 10},
			{"Bulgaria", 11},
			{"Belgium", 12},
			{"Cameroon", 13},
			{"Chile", 14},
			{"Cyprus", 15},
			{"Colombia", 16},
			{"Croatia", 17},
			{"Denmark", 18},
			{"Scotland", 19},
			{"Slovakia", 20},
			{"Slovenia", 21},
			{"Spain", 22},
			{"Finland", 23},
			{"France", 24},
			{"Ghana", 25},
			{"Greece", 26 },
			{"Netherlands", 27},
			{"Honduras", 28},
			{"Hungary", 29},
			{"United-Kingdom", 30},
			{"Ireland", 31},
			{"Northern Ireland", 32},
			{"Iceland", 33},
			{"Faroe Islands", 34},
			{"Israel", 35},
			{"Italy", 36},
			{"Lithuania", 37},
			{"Luxembourg", 38},
			{"Macedonia", 39},
			{"Malta", 40},
			{"Morocco", 41},
			{"Moldova", 42},
			{"Nigeria", 43},
			{"Norway", 44},
			{"Wales", 45},
			{"Poland", 46},
			{"Portugal", 47},
			{"Czech Republic", 48},
			{"Romania", 49},
			{"Russia", 50},
			{"Serbia-Montenegro", 58},
			{"South Africa", 52},
			{"Sweden", 53},
			{"Switzerland", 54},
			{"Turkey", 55},
			{"Ukraine", 56},
			{"Uruguay", 57},
			//{"", 58},
			{"Peru", 59},
			{"Canada", 60},
			{"United States", 61},
			{"Georgia", 62},
			{"Costa Rica", 63},
			{"Paraguay", 64},
			{"Japan", 65},
			{"Algeria", 66},
			{"Trinidad and Tobago", 67},
			{"Senegal", 68},
			{"Surinam", 69},
			{"Zambia", 70},
			{"Cape Verde", 71},
			{"Venezuela", 72},
			//{"Rhodesia", 73},
			{"Singapore", 74},
			{"Andorra", 75},
			{"Mozambique", 76},
			{"Liechtenstein", 77},
			{"Liberia", 78},
			{"Panama", 79},
			//{"Zaire", 80},
			{"Tajikistan", 81},
			{"Uzbekistan", 82},
			{"Mexico", 83},
			{"Guinea", 84},
			{"Angola", 85},
			{"Zimbabwe", 86},
			{"Sierra Leone", 87},
			{"Guadeloupe", 88},
			{"Ecuador", 89},
			{"Estonia", 90},
			{"Guinea Bissau", 91},
			{"Libya", 92},
			{"Egypt", 93},
			{"Jamaica", 94},
			//{"", 95},
			//{"", 96},
			{"New Zealand", 97},
			//{"", 98},
			//{"", 99},
			{"Chad", 100},
			{"Togo", 101},
			{"Guinea Conakry", 102},
			{"Tanzania", 103},
			{"Burkina Faso", 104},
			{"Gambia", 105},
			{"Rwanda", 106},
			{"Kenya", 107},
			{"Mauritania", 108},
			{"Mali", 109},
			{"Uganda", 110},
			{"Zaire", 111},
			{"Congo", 111},
			{"Latvia", 112},
			{"Ivory Coast", 113},
			{"Armenia", 114},
			{"Nicaragua", 115},
			//{"", 116},
			{"Niger", 117},
			{"Barbados", 118},
			{"Iran", 119},
			{"Qatar", 120},
			{"Tunisia", 121},
			{"Gabon", 122},
			{"Tahiti", 123},
			{"Mauritius", 124},
			{"Madagascar", 125},
			{"Martinica", 126},
			{"Vietnam", 127},
			{"Haiti", 128},
			{"Antigua and Barbuda", 129},
			{"Bahrein", 130},
			{"Bangladesh", 131},
			{"Belize", 132},
			{"Benin", 133},
			{"Bhutan", 134},
			{"Botswana", 135},
			{"Brunei", 136},
			{"Burundi", 137},
			{"Cambodia", 138},
			{"Central African Republic", 139},
			{"China", 140},
			//{"", 141},
			{"Yemen", 142},
			{"Cuba", 143},
			{"Djibouti", 144},
			{"Dominica", 145},
			{"Dominican Republic", 146},
			{"El Salvador", 147},
			{"Equatorial Guinea", 148},
			{"Eritrea", 149},
			{"Ethiopia", 150},
			//{"", 151},
			{"Fiji", 152},
			{"Grenade", 153},
			{"Guatemala", 154},
			{"Afghanistan", 155},
			{"India", 156},
			{"Indonesia", 157},
			{"Iraq", 158},
			{"Jordania", 159},
			{"Kazakhstan", 160},
			{"Kiribati", 161},
			{"Kuwait", 162},
			{"Kyrgyzstan", 163},
			{"Laos", 164},
			{"Vatican City", 165},
			{"Lebanon", 166},
			{"Lesotho", 167},
			{"Malawi", 168},
			{"Malaysia", 169},
			{"Falkland Islands", 170},
			{"Marshall Islands", 171},
			{"Monaco", 172},
			{"Mongolia", 173},
			{"Myanmar", 174},
			{"Namibia", 175},
			{"Nauru", 176},
			{"Nepal", 177},
			{"North Korea", 178},
			{"Oman", 179},
			{"Pakistan", 180},
			{"Palau", 181},
			{"Papua New Guinea", 182},
			{"Philippines", 183},
			{"Saint Kitts and Nevis", 184},
			{"Saint Lucia", 185},
			{"Samoa", 186},
			{"San Marino", 187},
			//{"", 188},
			{"Saudi Arabia", 189},
			{"Seychelles", 190},
			{"Solomon Islands", 191},
			{"Somalia", 192},
			{"Korea", 193},
			{"Sri Lanka", 194},
			{"Sudan", 195},
			{"Swaziland", 196},
			{"Eswatini", 196},
			{"Syria", 197},
			{"Taiwan", 198},
			{"Thailand", 199},
			{"The Bahamas", 200},
			{"Bahamas", 200},
			{"Tonga", 201},
			{"Turkmenistan", 202},
			{"Tuvalu", 203},
			{"United Arab Emirates", 204},
			//{"", 205},
			{"Vanuatu", 206},
		};
	}
}
