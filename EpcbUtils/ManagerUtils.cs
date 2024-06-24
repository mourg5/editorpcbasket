using System;
using System.Collections.Generic;
using System.IO;

namespace EpcbUtils
{
	public static class ManagerUtils
	{
		private static string _managerFilePath = Path.Combine(DbdatUtils.PcbPath, "MANAGER.EXE");

		public static void RemoveAgeRestriction()
		{
			FileStream manager = null;

			try
			{
				File.Copy(_managerFilePath, _managerFilePath.Replace(".EXE", ".BAK"), true);

				manager = File.OpenWrite(_managerFilePath);

				manager.Position = 0x0014A391;
				manager.Write(new byte[] { 0x00, 0x00 }, 0, 2);

				manager.Position = 0x0014A399;
				manager.Write(new byte[] { 0xFF, 0xFF }, 0, 2);

				manager.Close();
			}
			catch (Exception ex)
			{
				manager?.Close();
				LoggerUtils.LogException(ex);
			}
		}

		// TODO: revisar
		public static void ChangeStartingYear(int startingYear)
		{
			FileStream manager = null;

			try
			{
				File.Copy(_managerFilePath, _managerFilePath.Replace(".EXE", ".BAK"), true);

				manager = File.OpenWrite(_managerFilePath);

				var year = BitConverter.GetBytes((short)startingYear);
				var positions = new long[] 
				{
					0x00003F8B, 0x0001EFA3, 0x00025E13, 0x00025E93, 0x0002CA61, 0x00038CF3, 0x000B2AA9, 0x00123CDA, 0x00124804, 0x0013D207, 0x0013D2D4, 0x00142783, 0x00142DB4, 0x00145F5C, 0x0014637A, 0x00146B3A, 0x00146DEB, 0x0014CCA1
				};

				var nextYear = BitConverter.GetBytes((short)(startingYear + 1));
				var nextYearPositions = new long[]
				{
					0x00000475, 0x00000495, 0x000004B5, 0x00003BC7, 0x00003F84, 0x00004107, 0x0000411D, 0x00004125, 0x00004138, 0x0000414B, 0x0000415E, 0x00004171, 0x00004184, 0x00004197, 0x000041AA, 0x000041BD, 0x000041D0, 0x000041E3, 0x000041F6, 0x00004208, 0x00009E65, 0x00009E73, 0x00009EE3, 0x00009F53, 0x0000E535, 0x0000E543, 0x0001F073, 0x0001F0A3, 0x0001F0D3, 0x0001F103, 0x0001F145, 0x00025EC3, 0x00025EF3, 0x00025F23, 0x00025F53, 0x0002CB33, 0x0002CBB3, 0x0002CC03, 0x0002CC65, 0x0002CC85, 0x0002CCA5
				};

				foreach (var position in positions)
				{
					manager.Position = position;
					manager.Write(year, 0, 2);
				}

				foreach (var position in nextYearPositions)
				{
					manager.Position = position;
					manager.Write(nextYear, 0, 2);
				}

				manager.Close();
			}
			catch (Exception ex)
			{
				manager?.Close();
				LoggerUtils.LogException(ex);
			}
		}

		public static List<short> ReadEuroligaTeams()
		{
			var teams = new List<short>();

			FileStream manager = null;

			try
			{
				manager = File.OpenRead(_managerFilePath);

				manager.Position = 0x002397A8;

				for (int i = 0; i < 24; i++)
				{
					var bytesPuntero = new byte[2];
					manager.Read(bytesPuntero, 0, 2);

					teams.Add(BitConverter.ToInt16(bytesPuntero, 0));
				}

				manager.Close();
			}
			catch (Exception ex)
			{
				manager?.Close();
				LoggerUtils.LogException(ex);
			}

			return teams;
		}

		public static List<short> ReadEurocupTeams()
		{
			var teams = new List<short>();

			FileStream manager = null;

			try
			{
				manager = File.OpenRead(_managerFilePath);

				manager.Position = 0x002394D8;

				for (int i = 0; i < 48; i++)
				{
					var bytesPuntero = new byte[2];
					manager.Read(bytesPuntero, 0, 2);

					teams.Add(BitConverter.ToInt16(bytesPuntero, 0));
				}

				manager.Close();
			}
			catch (Exception ex)
			{
				manager?.Close();
				LoggerUtils.LogException(ex);
			}

			return teams;
		}

		// TODO: revisar lista y posiciones 
		public static List<short> ReadChampionsTeams()
		{
			var teams = new List<short>();

			FileStream manager = null;

			try
			{
				manager = File.OpenRead(_managerFilePath);

				manager.Position = 0x002394D8;

				do
				{
					var bytesPuntero = new byte[2];
					manager.Read(bytesPuntero, 0, 2);

					var puntero = BitConverter.ToInt16(bytesPuntero, 0);
					if (puntero != 904)
					{
						teams.Add(puntero);
					}
				} while (teams.Count < 32);

				manager.Close();
			}
			catch (Exception ex)
			{
				manager?.Close();
				LoggerUtils.LogException(ex);
			}

			return teams;
		}
	}
}
