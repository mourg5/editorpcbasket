using EpcbModel;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EpcbUtils
{
	public static class HexUtils
	{
		static DinamicEncoding DinamicEncoding = new DinamicEncoding();

		public static short AnoInicio { get; set; }

		public static Equipo ReadEquipoBytes(FileStream playerFile)
		{
			try
			{
				var newEquipo = new Equipo();

				var puntero = playerFile.Name.Substring(playerFile.Name.Length - 8, 4);
				newEquipo.Puntero = int.Parse(puntero);

				SkipBytes(playerFile, 42);

				// NOMBRE CORTO
				var longNcorto = playerFile.ReadByte();
				playerFile.ReadByte();
				var bytesNcorto = new byte[longNcorto];
				playerFile.Read(bytesNcorto, 0, longNcorto);

				newEquipo.NombreCorto = DinamicEncoding.GetString(bytesNcorto);

				// PABELLON
				var longPabellon = playerFile.ReadByte();
				playerFile.ReadByte();
				var bytesPabellon = new byte[longPabellon];
				playerFile.Read(bytesPabellon, 0, longPabellon);

				newEquipo.Pabellon = DinamicEncoding.GetString(bytesPabellon);

				// PAIS
				var bytePais = playerFile.ReadByte();
				newEquipo.Pais = (Pais)bytePais;

				// AFORO
				var bytesCapacidad = new byte[2];
				playerFile.Read(bytesCapacidad, 0, 2);

				newEquipo.Aforo = BitConverter.ToInt16(bytesCapacidad, 0);

				SkipBytes(playerFile, 2);

				// NOMBRE LARGO
				var longNlargo = playerFile.ReadByte();
				playerFile.ReadByte();
				var bytesNlargo = new byte[longNlargo];
				playerFile.Read(bytesNlargo, 0, longNlargo);

				newEquipo.NombreLargo = DinamicEncoding.GetString(bytesNlargo);

				SkipBytes(playerFile, 4);

				// C. SOCIAL - NO NOS INTERESA
				var longCsocial = playerFile.ReadByte();
				playerFile.ReadByte();
				var bytesCsocial = new byte[longCsocial];
				playerFile.Read(bytesCsocial, 0, longCsocial);

				// AÑO FUNDACIÓN (NO INTERESA) + 4B
				SkipBytes(playerFile, 6);

				// PRESIDENTE (NO INTERESA) 
				var longPresidente = playerFile.ReadByte();
				playerFile.ReadByte();
				var bytesPresidente = new byte[longPresidente];
				playerFile.Read(bytesPresidente, 0, longPresidente);

				// PRESUPUESTO
				var bytesPresupuesto = new byte[2];
				playerFile.Read(bytesPresupuesto, 0, 2);

				newEquipo.Presupuesto = BitConverter.ToInt16(bytesPresupuesto, 0);

				SkipBytes(playerFile, 6);

				// PATROCINADOR (NI) + EQUIPADOR (NI)
				var longPatrocinador = playerFile.ReadByte();
				playerFile.ReadByte();
				var bytesPatrocinador = new byte[longPatrocinador];
				playerFile.Read(bytesPatrocinador, 0, longPatrocinador);
				var longEquipador = playerFile.ReadByte();
				playerFile.ReadByte();
				var bytesEquipador = new byte[longEquipador];
				playerFile.Read(bytesEquipador, 0, longEquipador);

				// 2B + ESTADISTICAS (NI)
				SkipBytes(playerFile, 17);

				// TODO: Investigar este trozo. Tácticas aquí casi seguro
				SkipBytes(playerFile, 245);

				// ENTRENADOR
				var longEntrenador = playerFile.ReadByte();
				playerFile.ReadByte();
				var bytesEntrenador = new byte[longEntrenador];
				playerFile.Read(bytesEntrenador, 0, longEntrenador);

				newEquipo.Entrenador = DinamicEncoding.GetString(bytesEntrenador);
				// Nombre largo del entrenador + estadísticas (NI)
				var longLargEnt = playerFile.ReadByte();
				playerFile.ReadByte();
				var bytesLargEnt = new byte[longLargEnt];
				playerFile.Read(bytesLargEnt, 0, longLargEnt);
				SkipBytes(playerFile, 15);

				// SEGUNDO ENTRENADOR (NI)
				SkipBytes(playerFile, 2);
				var longSegEnt = playerFile.ReadByte();
				playerFile.ReadByte();
				var bytesSegEnt = new byte[longSegEnt];
				playerFile.Read(bytesSegEnt, 0, longSegEnt);
				// Nombre largo del segundo entrenador + estadísticas (NI). !!! Dejamos el último byte como dígito de control del primer jugador
				longLargEnt = playerFile.ReadByte();
				playerFile.ReadByte();
				bytesLargEnt = new byte[longLargEnt];
				playerFile.Read(bytesLargEnt, 0, longLargEnt);
				SkipBytes(playerFile, 14);

				// PLANTILLA
				var jugador = new Jugador();

				while (true)
				{
					jugador = ReadJugadorBytes(playerFile);
					if (jugador.Puntero == -5) break;
					newEquipo.Plantilla.Add(jugador);
				}

				return newEquipo;
			}
			catch (Exception)
			{
				return new Equipo() { Puntero = -5 };
			}
		}

		public static Jugador ReadJugadorBytes(FileStream playerFile)
		{
			try
			{
				var newJugador = new Jugador();

				var control = playerFile.ReadByte();
				if (control != 1)
				{
					newJugador.Puntero = -5;
					return newJugador;
				}

				// PUNTERO
				var bytesPt = new byte[2];
				playerFile.Read(bytesPt, 0, 2);

				newJugador.Puntero = BitConverter.ToInt16(bytesPt, 0);

				// Dorsal
				newJugador.Dorsal = playerFile.ReadByte();

				// Nombre corto
				var longNcorto = playerFile.ReadByte();
				playerFile.ReadByte();
				var bytesNcorto = new byte[longNcorto];
				playerFile.Read(bytesNcorto, 0, longNcorto);

				newJugador.NombreCorto = DinamicEncoding.GetString(bytesNcorto);

				// Nombre largo
				var longNlargo = playerFile.ReadByte();
				playerFile.ReadByte();
				var bytesNlargo = new byte[longNlargo];
				playerFile.Read(bytesNlargo, 0, longNlargo);

				newJugador.NombreLargo = DinamicEncoding.GetString(bytesNlargo);

				// Posición plantilla
				playerFile.ReadByte();
				playerFile.ReadByte();

				// Demarcación
				newJugador.Demarcacion = playerFile.ReadByte() - 1;

				//TODO: ???
				SkipBytes(playerFile, 8);

				// Nacionalidad
				var bytePais = playerFile.ReadByte();
				newJugador.Nacionalidad = (Pais)bytePais;

				// Color piel
				newJugador.ColorPiel = playerFile.ReadByte() > 0;

				// Fecha Nac
				SkipBytes(playerFile, 6);
				var bytesFnac = new byte[2];
				playerFile.Read(bytesFnac, 0, 2);

				var difAnnos = DateTime.Now.Year - AnoInicio;
				var anoNac = BitConverter.ToInt16(bytesFnac, 0) + difAnnos;

				newJugador.AnoNacimiento = anoNac;

				// Altura 
				newJugador.Altura = playerFile.ReadByte();

				// Peso
				newJugador.Peso = playerFile.ReadByte();

				// Origen jugador - SKIP
				playerFile.ReadByte();
				var longOrigen = playerFile.ReadByte();
				playerFile.ReadByte();
				var bytesOrigen = new byte[longOrigen];
				playerFile.Read(bytesOrigen, 0, longOrigen);
				longOrigen = playerFile.ReadByte();
				playerFile.ReadByte();
				bytesOrigen = new byte[longOrigen];
				playerFile.Read(bytesOrigen, 0, longOrigen);

				SkipBytes(playerFile, 149);

				// Medias
				newJugador.Medias.Velocidad = playerFile.ReadByte();
				newJugador.Medias.Resistencia = playerFile.ReadByte();
				newJugador.Medias.Agresividad = playerFile.ReadByte();
				newJugador.Medias.Salto = playerFile.ReadByte();
				newJugador.Medias.Oculto = playerFile.ReadByte();
				newJugador.Medias.Defensa = playerFile.ReadByte();
				newJugador.Medias.Tiro2 = playerFile.ReadByte();
				newJugador.Medias.Tiro3 = playerFile.ReadByte();
				newJugador.Medias.TiroL = playerFile.ReadByte();
				newJugador.Medias.Rebotes = playerFile.ReadByte();
				newJugador.Medias.Asistencias = playerFile.ReadByte();

				return newJugador;
			}
			catch (Exception)
			{
				return new Jugador() { Puntero = -5 };
			}
		}

		public static void SaveJugadorBytes(FileStream playerFile, Jugador jugador, int posicionPlantilla)
		{
			// Puntero
			playerFile.WriteByte(1);
			var bytesPuntero = BitConverter.GetBytes((short)jugador.Puntero);
			playerFile.Write(bytesPuntero, 0, bytesPuntero.Length);

			// Dorsal
			playerFile.WriteByte((byte)jugador.Dorsal);

			// Nombre corto
			playerFile.WriteByte((byte)jugador.NombreCorto.Length);
			playerFile.WriteByte(0);
			playerFile.Write(DinamicEncoding.GetBytes(jugador.NombreCorto), 0, jugador.NombreCorto.Length);

			// Nombre largo
			playerFile.WriteByte((byte)jugador.NombreLargo.Length);
			playerFile.WriteByte(0);
			playerFile.Write(DinamicEncoding.GetBytes(jugador.NombreLargo), 0, jugador.NombreLargo.Length);

			// Orden en plantilla 
			playerFile.WriteByte((byte)posicionPlantilla);
			playerFile.WriteByte(0);

			// Demarcacion
			playerFile.WriteByte((byte)(jugador.Demarcacion + 1));

			// Tácticas ataque
			var ata = DinamicEncoding.GetBytes("cebgdcda");
			playerFile.Write(ata, 0, ata.Length);

			// Nacionalidad
			playerFile.WriteByte((byte)jugador.Nacionalidad);

			// Color piel
			byte color = jugador.ColorPiel ? (byte)1 : (byte)0;
			playerFile.WriteByte(color);

			// Color pelo + barba
			playerFile.WriteByte(1);
			playerFile.WriteByte(0);

			// ???
			playerFile.WriteByte(0);

			// Posición bis
			playerFile.WriteByte((byte)jugador.Demarcacion);

			// Fecha nacimiento - día, mes, año
			playerFile.WriteByte(1);
			playerFile.WriteByte(1);
			var difAnnos = DateTime.Now.Year - AnoInicio;
			var bytesAnoNac = BitConverter.GetBytes((short)(jugador.AnoNacimiento - difAnnos));
			playerFile.Write(bytesAnoNac, 0, bytesAnoNac.Length);

			// Altura y peso
			playerFile.WriteByte((byte)jugador.Altura);
			playerFile.WriteByte((byte)jugador.Peso);

			// Procedencia
			playerFile.WriteByte(22);
			AddDummyField(playerFile);
			AddDummyField(playerFile);

			// Bytes basura (estadísticas y texto bbdd)
			var dumpString = "'aN'ax'ax'ax'ax'ax'axaaaa=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
			var dumpBytes = DinamicEncoding.GetBytes(dumpString);
			playerFile.Write(dumpBytes, 0, dumpBytes.Length);

			// Medias
			playerFile.WriteByte((byte)jugador.Medias.Velocidad);
			playerFile.WriteByte((byte)jugador.Medias.Resistencia);
			playerFile.WriteByte((byte)jugador.Medias.Agresividad);
			playerFile.WriteByte((byte)jugador.Medias.Salto);
			playerFile.WriteByte((byte)jugador.Medias.Oculto);
			playerFile.WriteByte((byte)jugador.Medias.Defensa);
			playerFile.WriteByte((byte)jugador.Medias.Tiro2);
			playerFile.WriteByte((byte)jugador.Medias.Tiro3);
			playerFile.WriteByte((byte)jugador.Medias.TiroL);
			playerFile.WriteByte((byte)jugador.Medias.Rebotes);
			playerFile.WriteByte((byte)jugador.Medias.Asistencias);
		}

		public static void SaveEquipoBytes(Equipo equipo)
		{	
			var teamFile = File.OpenWrite(CheckPreviousDbc(equipo));

			try
			{
				// Cabecera
				var cabecera = Encoding.UTF8.GetBytes("Copyright (c)1997 Dinamic Multimedia");
				teamFile.Write(cabecera, 0, cabecera.Length);
				teamFile.Write(new byte[] { 247, 8, 91, 2, 0, 0 }, 0, 6);

				// Nombre corto
				teamFile.WriteByte((byte)equipo.NombreCorto.Length);
				teamFile.WriteByte(0);
				teamFile.Write(DinamicEncoding.GetBytes(equipo.NombreCorto), 0, equipo.NombreCorto.Length);

				// Pabellón
				teamFile.WriteByte((byte)equipo.Pabellon.Length);
				teamFile.WriteByte(0);
				teamFile.Write(DinamicEncoding.GetBytes(equipo.Pabellon), 0, equipo.Pabellon.Length);

				// País
				teamFile.WriteByte((byte)equipo.Pais);

				// Aforo
				var bytesCapacidad = BitConverter.GetBytes((short)equipo.Aforo);
				teamFile.Write(bytesCapacidad, 0, bytesCapacidad.Length);

				AddBytes(teamFile, 2);

				// Nombre largo
				teamFile.WriteByte((byte)equipo.NombreLargo.Length);
				teamFile.WriteByte(0);
				teamFile.Write(DinamicEncoding.GetBytes(equipo.NombreLargo), 0, equipo.NombreLargo.Length);

				AddBytes(teamFile, 4);

				// C. Social
				AddDummyField(teamFile);

				// Año fundación
				var bytesFundacion = BitConverter.GetBytes((short)1997);
				teamFile.Write(bytesFundacion, 0, bytesFundacion.Length);

				AddBytes(teamFile, 4);

				// Presidente
				AddDummyField(teamFile);

				// Presupuesto
				var bytesPresupuesto = BitConverter.GetBytes((short)equipo.Presupuesto);
				teamFile.Write(bytesPresupuesto, 0, bytesPresupuesto.Length);

				AddBytes(teamFile, 6);

				// Patrocinador y equipador
				AddDummyField(teamFile);
				AddDummyField(teamFile);

				AddBytes(teamFile, 2);

				// Estadisticas
				AddBytes(teamFile, 15);

				// TODO: Tácticas
				var tacticas = DinamicEncoding.GetBytes("cbc''''cfbc'''k");
				teamFile.Write(tacticas, 0, tacticas.Length);

				// TODO: examinar este cacho
				var relleno = DinamicEncoding.GetBytes("aaaaaaaaaaaaaaaaaaaakaaaaaaaaaaaaaaaaaaaakaaaaaaaaaaaaaaaaaaaakaaaaaaaaaaaaaaaaaaaakaaaaaaaaaaaaaaaaaaaakaaaaaaaaaaaaaaaaaaaakaaaaaaaaaaaaaaaaaaaakaaaaaaaaaaaaaaaaaaaa(b.dBaK'.a.'Ka=a=cSbõaÜavbóa#'-aè'/a4ahaj'JahbÔañ{=dCafaô')ac");
				teamFile.Write(relleno, 0, relleno.Length);

				// Entrenador
				teamFile.Write(BitConverter.GetBytes((short)(equipo.Puntero * 2 - 1)), 0, 2);
				teamFile.WriteByte((byte)equipo.Entrenador.Length);
				teamFile.WriteByte(0);
				teamFile.Write(DinamicEncoding.GetBytes(equipo.Entrenador), 0, equipo.Entrenador.Length);
				teamFile.WriteByte((byte)equipo.Entrenador.Length);
				teamFile.WriteByte(0);
				teamFile.Write(DinamicEncoding.GetBytes(equipo.Entrenador), 0, equipo.Entrenador.Length);

				var estadisticas = DinamicEncoding.GetBytes("'ax'axaa'ax'ax");
				teamFile.Write(estadisticas, 0, estadisticas.Length);
				teamFile.Write(DinamicEncoding.GetBytes("c"), 0, 1);

				// 2º entrenador
				teamFile.Write(BitConverter.GetBytes((short)(equipo.Puntero * 2)), 0, 2);
				AddDummyField(teamFile);
				AddDummyField(teamFile);
				teamFile.Write(estadisticas, 0, estadisticas.Length);

				var pos = 1;
				foreach (var jug in equipo.Plantilla)
				{
					SaveJugadorBytes(teamFile, jug, pos);
					pos++;
				}

				var bytesToAdd = 51200 - teamFile.Length;
				AddBytes(teamFile, bytesToAdd);

				teamFile.Close();
			}
			catch (Exception)
			{
				teamFile.Close();
			}
		}

		public static void SkipBytes(FileStream file, int bytesToSkip)
		{
			for (int i = 0; i < bytesToSkip; i++)
			{
				file.ReadByte();
			}
		}
		public static void AddBytes(FileStream file, long bytesToAdd)
		{
			for (int i = 0; i < bytesToAdd; i++)
			{
				file.WriteByte(0);
			}
		}

		public static void AddDummyField(FileStream file)
		{
			var dummyText = "ACBLive";
			file.WriteByte((byte)dummyText.Length);
			file.WriteByte(0);
			file.Write(DinamicEncoding.GetBytes(dummyText), 0, dummyText.Length);
		}

		public static string CheckPreviousDbc(Equipo equipo)
		{
			var filePath = DbdatUtils.PcbPath + "\\DBDAT\\EQ022022\\EQBA" + equipo.Puntero.ToString("0000") + ".DBC";

			if (File.Exists(filePath))
			{
				var backupFolder = DbdatUtils.PcbPath + "\\DBDAT\\EQ022022\\Backup";
				if (!Directory.Exists(backupFolder))
				{
					Directory.CreateDirectory(backupFolder);
				}

				var backupFile = backupFolder + "\\EQBA" + equipo.Puntero.ToString("0000") + "_" + DateTime.Now.Ticks + ".DBC";

				File.Move(filePath, backupFile);

				LoggerUtils.LogString(string.Format("El equipo {0} ya tenía DBC asociado. Se ha movido el archivo a la carpeta Backup", equipo.NombreCorto));
			}

			return filePath;
		}
	}
}
