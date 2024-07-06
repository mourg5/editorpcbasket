using EpcbModel;
using System;
using System.Collections.Generic;
using System.Linq;

namespace EpcbUtils
{
	public static class RatingsUtils
	{
		private static Random _random = new Random(DateTime.Now.Millisecond);

		public static void GenerateTeamRatings(IEnumerable<Jugador> players, IDictionary<int, PlayerStatistics> statistics, int desiredTeamRating)
		{
			var effAvg = statistics.Values.Sum(p => p.Efficiency) / statistics.Count;
			var pointsAvg = statistics.Values.Sum(p => p.Points) / statistics.Count;

			foreach (var player in players)
			{
				var stats = statistics[player.Puntero];
				
				var playerEff = stats.Efficiency / effAvg;
				var playerPoints = stats.Points / pointsAvg;
				
				var effAdd = playerEff > 1
					? 3 * playerEff
					: 3 * -playerEff;

				var pointsAdd = playerPoints > 1
					? 1.5 * playerPoints
					: 1.5 * -playerPoints;

				var playerRating = (int)(desiredTeamRating + pointsAdd + effAdd);
				playerRating = Math.Min(95, Math.Max(11, playerRating));

				GeneratePlayerRating(player.Medias, stats, playerRating, player.Demarcacion);
			}

			var averageRating = Math.Ceiling(players.Average(p => p.Medias.MediaQuinteto));

			while (averageRating != desiredTeamRating)
			{
				var diff = (int)(desiredTeamRating - averageRating);
				foreach (var player in players)
				{
					player.Medias.Add(diff);
				}

				averageRating = Math.Ceiling(players.Average(p => p.Medias.MediaQuinteto));
			}
		}

		#region Abilities

		public static void GeneratePlayerRating(Medias medias, IAbilities abilities, int desiredRating, int position)
		{
			switch (position)
			{
				case 0:
					GeneratePgRating(medias, abilities, desiredRating);
					break;
				case 1:
					GenerateSgRating(medias, abilities, desiredRating);
					break;
				case 2:
					GenerateSfRating(medias, abilities, desiredRating);
					break;
				case 3:
					GeneratePfRating(medias, abilities, desiredRating);
					break;
				default:
					GenerateCRating(medias, abilities, desiredRating);
					break;
			}
		}

		private static void GeneratePgRating(Medias medias, IAbilities abilities, int desiredRating)
		{
			var mediaBase = (desiredRating * 13 - 141) / 11;

			medias.SetMediasToValue(mediaBase);
			medias.Velocidad = abilities.IsVeloz ? (int)(mediaBase * 1.3) + _random.Next(15) : mediaBase - _random.Next(15);
			medias.Salto = abilities.IsAtletico ? mediaBase + _random.Next(15) : mediaBase - _random.Next(15);
			medias.Resistencia = abilities.IsAtletico ? mediaBase + _random.Next(20) : mediaBase - _random.Next(10);
			medias.Agresividad = abilities.IsIntimidador ? (int)(mediaBase * .8) + _random.Next(15) : (int)(mediaBase * .75) - _random.Next(20);
			medias.Defensa = abilities.IsDefensor ? mediaBase + _random.Next(15) : mediaBase - _random.Next(15);
			medias.Tiro2 = abilities.IsTirador ? (int)(mediaBase * 1.15 + _random.Next(15)) : (int)(mediaBase - _random.Next(10));
			medias.Tiro3 = abilities.IsTirador ? (int)(mediaBase * 1.2 + _random.Next(15)) : (int)(mediaBase - _random.Next(10));
			medias.TiroL = abilities.IsTirador ? (int)(mediaBase * 1.2 + _random.Next(15)) : (int)(mediaBase - _random.Next(10));
			medias.Rebotes = abilities.IsIntimidador ? (int)(mediaBase * .7) + _random.Next(10) : (int)(mediaBase * .6) - _random.Next(30);
			medias.Asistencias = abilities.IsCreador ? (int)(mediaBase * 1.1) + _random.Next(15) : (int)(mediaBase * 1) - _random.Next(10);
			medias.Oculto = 99;

			while (desiredRating != medias.MediaQuinteto)
			{
				medias.Add(desiredRating - medias.MediaQuinteto);
			}
		}

		private static void GenerateSgRating(Medias medias, IAbilities abilities, int desiredRating)
		{
			var totalPoints = desiredRating * 13 - 141;
			var mediaBase = totalPoints / 11;

			medias.SetMediasToValue(mediaBase);

			medias.Velocidad = abilities.IsVeloz ? (int)(mediaBase * 1.2) + _random.Next(15) : mediaBase - _random.Next(15);
			totalPoints -= medias.Velocidad;

			medias.Salto = abilities.IsAtletico ? mediaBase + _random.Next(25) : mediaBase - _random.Next(15);
			totalPoints -= medias.Salto;

			medias.Resistencia = abilities.IsAtletico ? mediaBase + _random.Next(25) : mediaBase - _random.Next(10);
			totalPoints -= medias.Resistencia;

			medias.Agresividad = abilities.IsIntimidador ? mediaBase + _random.Next(15) : (int)(mediaBase * .8) - _random.Next(20);
			totalPoints -= medias.Agresividad;

			medias.Defensa = abilities.IsDefensor ? mediaBase + _random.Next(15) : mediaBase - _random.Next(15);
			totalPoints -= medias.Defensa;

			medias.Tiro2 = abilities.IsTirador ? (int)(mediaBase * 1.15 + _random.Next(20)) : (int)(mediaBase - _random.Next(10));
			totalPoints -= medias.Tiro2;

			medias.Tiro3 = abilities.IsTirador ? (int)(mediaBase * 1.2 + _random.Next(25)) : (int)(mediaBase - _random.Next(10));
			totalPoints -= medias.Tiro3;

			medias.TiroL = abilities.IsTirador ? (int)(mediaBase * 1.2 + _random.Next(15)) : (int)(mediaBase - _random.Next(10));
			totalPoints -= medias.TiroL;

			medias.Rebotes = abilities.IsIntimidador ? (int)(mediaBase * .7) + _random.Next(10) : (int)(mediaBase * .6) - _random.Next(30);
			totalPoints -= medias.Rebotes;

			medias.Asistencias = abilities.IsCreador ? mediaBase + _random.Next(15) : mediaBase - _random.Next(15);
			totalPoints -= medias.Asistencias;

			medias.Oculto = 99;

			while (desiredRating != medias.MediaQuinteto)
			{
				medias.Add(desiredRating - medias.MediaQuinteto);
			}
		}

		private static void GenerateSfRating(Medias medias, IAbilities abilities, int desiredRating)
		{
			var totalPoints = desiredRating * 13 - 141;
			var mediaBase = totalPoints / 11;

			medias.SetMediasToValue(mediaBase);

			medias.Velocidad = abilities.IsVeloz ? mediaBase + _random.Next(25) : mediaBase - _random.Next(15);
			totalPoints -= medias.Velocidad;

			medias.Salto = abilities.IsAtletico ? (int)(mediaBase * 1.2) + _random.Next(20) : mediaBase - _random.Next(15);
			totalPoints -= medias.Salto;

			medias.Resistencia = abilities.IsAtletico ? mediaBase + _random.Next(25) : mediaBase - _random.Next(10);
			totalPoints -= medias.Resistencia;

			medias.Agresividad = abilities.IsIntimidador ? mediaBase + _random.Next(20) : mediaBase - _random.Next(20);
			totalPoints -= medias.Agresividad;

			medias.Defensa = abilities.IsDefensor ? mediaBase + _random.Next(20) : mediaBase - _random.Next(15);
			totalPoints -= medias.Defensa;

			medias.Tiro2 = abilities.IsTirador ? (int)(mediaBase * 1.15 + _random.Next(20)) : (int)(mediaBase - _random.Next(10));
			totalPoints -= medias.Tiro2;

			medias.Tiro3 = abilities.IsTirador ? (int)(mediaBase * 1.2 + _random.Next(15)) : (int)(mediaBase - _random.Next(10));
			totalPoints -= medias.Tiro3;

			medias.TiroL = abilities.IsTirador ? (int)(mediaBase * 1.2 + _random.Next(15)) : (int)(mediaBase - _random.Next(10));
			totalPoints -= medias.TiroL;

			medias.Rebotes = abilities.IsIntimidador ? mediaBase + _random.Next(10) : (int)(mediaBase * .9) - _random.Next(20);
			totalPoints -= medias.Rebotes;

			medias.Asistencias = abilities.IsCreador ? mediaBase + _random.Next(10) : mediaBase - _random.Next(15);
			totalPoints -= medias.Asistencias;

			medias.Oculto = 99;

			while (desiredRating != medias.MediaQuinteto)
			{
				medias.Add(desiredRating - medias.MediaQuinteto);
			}
		}

		private static void GeneratePfRating(Medias medias, IAbilities abilities, int desiredRating)
		{
			var totalPoints = desiredRating * 13 - 141;
			var mediaBase = totalPoints / 11;

			medias.SetMediasToValue(mediaBase);

			medias.Velocidad = abilities.IsVeloz ? (int)(mediaBase * .8) - _random.Next(15) : (int)(mediaBase * .7) - _random.Next(25);
			totalPoints -= medias.Velocidad;

			medias.Salto = abilities.IsAtletico ? mediaBase + _random.Next(5) : mediaBase - _random.Next(15);
			totalPoints -= medias.Salto;

			medias.Resistencia = abilities.IsAtletico ? mediaBase + _random.Next(20) : mediaBase - _random.Next(10);
			totalPoints -= medias.Resistencia;

			medias.Agresividad = abilities.IsIntimidador ? (int)(mediaBase * 1.1) + _random.Next(10) : mediaBase - _random.Next(15);
			totalPoints -= medias.Agresividad;

			medias.Defensa = abilities.IsDefensor ? mediaBase + _random.Next(15) : mediaBase - _random.Next(15);
			totalPoints -= medias.Defensa;

			medias.Tiro2 = abilities.IsTirador ? mediaBase + _random.Next(15) : (int)(mediaBase * .8 - _random.Next(20));
			totalPoints -= medias.Tiro2;

			medias.Tiro3 = abilities.IsTirador ? (int)(mediaBase * .75 + _random.Next(10)) : (int)(mediaBase * .4 - _random.Next(10));
			totalPoints -= medias.Tiro3;

			medias.TiroL = abilities.IsTirador ? mediaBase + _random.Next(25) : mediaBase - _random.Next(15);
			totalPoints -= medias.TiroL;

			medias.Rebotes = abilities.IsDefensor ? mediaBase + _random.Next(25) : mediaBase - _random.Next(15);
			totalPoints -= medias.Rebotes;

			medias.Asistencias = abilities.IsCreador ? (int)(mediaBase * .7) - _random.Next(10) : (int)(mediaBase * .66) - _random.Next(25);
			totalPoints -= medias.Asistencias;

			medias.Oculto = totalPoints;
			totalPoints -= medias.Oculto;

			while (desiredRating != medias.MediaQuinteto)
			{
				medias.Add(desiredRating - medias.MediaQuinteto);
			}
		}

		private static void GenerateCRating(Medias medias, IAbilities abilities, int desiredRating)
		{
			var totalPoints = desiredRating * 13 - 141;
			var mediaBase = totalPoints / 11;

			medias.SetMediasToValue(mediaBase);

			medias.Velocidad = abilities.IsVeloz ? (int)(mediaBase * .7) - _random.Next(5) : (int)(mediaBase * .5) - _random.Next(20);
			totalPoints -= medias.Velocidad;

			medias.Salto = abilities.IsAtletico ? mediaBase - _random.Next(5) : mediaBase - _random.Next(20);
			totalPoints -= medias.Salto;

			medias.Resistencia = abilities.IsAtletico ? mediaBase + _random.Next(15) : mediaBase - _random.Next(10);
			totalPoints -= medias.Resistencia;

			medias.Agresividad = abilities.IsIntimidador ? (int)(mediaBase * 1.1) + _random.Next(10) : mediaBase - _random.Next(15);
			totalPoints -= medias.Agresividad;

			medias.Defensa = abilities.IsDefensor ? mediaBase + _random.Next(15) : mediaBase - _random.Next(15);
			totalPoints -= medias.Defensa;

			medias.Tiro2 = abilities.IsTirador ? mediaBase + _random.Next(15) : (int)(mediaBase * .8 - _random.Next(20));
			totalPoints -= medias.Tiro2;

			medias.Tiro3 = abilities.IsTirador ? (int)(mediaBase * .5 + _random.Next(10)) : (int)(mediaBase * .25 - _random.Next(10));
			totalPoints -= medias.Tiro3;

			medias.TiroL = abilities.IsTirador ? mediaBase + _random.Next(15) : mediaBase - _random.Next(15);
			totalPoints -= medias.TiroL;

			medias.Rebotes = abilities.IsDefensor ? (int)(mediaBase * 1.1) + _random.Next(15) : (int)(mediaBase * 1) - _random.Next(10);
			totalPoints -= medias.Rebotes;

			medias.Asistencias = abilities.IsCreador ? (int)(mediaBase * .6) - _random.Next(10) : (int)(mediaBase * .4) - _random.Next(30);
			totalPoints -= medias.Asistencias;

			medias.Oculto = totalPoints;
			totalPoints -= medias.Oculto;

			while (desiredRating != medias.MediaQuinteto)
			{
				medias.Add(desiredRating - medias.MediaQuinteto);
			}
		}

		#endregion

		#region Statistics

		private static void GeneratePlayerRating(Medias medias, PlayerStatistics stats, int desiredRating, int position)
		{
			switch (position)
			{
				case 0:
					GeneratePgRating(medias, stats, desiredRating);
					break;
				case 1:
					GenerateSgRating(medias, stats, desiredRating);
					break;
				case 2:
					GenerateSfRating(medias, stats, desiredRating);
					break;
				case 3:
					GeneratePfRating(medias, stats, desiredRating);
					break;
				default:
					GenerateCRating(medias, stats, desiredRating);
					break;
			}
		}

		private static void GeneratePgRating(Medias medias, PlayerStatistics stats, int desiredRating)
		{
			var mediaBase = (desiredRating * 13 - 141) / 11;

			medias.SetMediasToValue(mediaBase);

			medias.Velocidad = mediaBase + _random.Next(20) - _random.Next(10);
			medias.Salto = (int)(mediaBase + _random.NextDouble() * stats.Rebounds - _random.Next(10));
			medias.Resistencia = (int)(mediaBase + _random.NextDouble() * stats.Minutes - _random.Next(10));
			medias.Agresividad = (int)(mediaBase * .6 + _random.NextDouble() * stats.Fouls + _random.NextDouble() * stats.Steals + _random.NextDouble() * stats.HighestRebounds - _random.Next(10));

			medias.Defensa = (int)(mediaBase + _random.NextDouble() * stats.TurnOvers + _random.NextDouble() * stats.Steals + _random.NextDouble() * stats.Rebounds) - _random.Next(15);
			medias.Tiro2 = (int)(mediaBase + _random.NextDouble() * stats.Points + stats.PctFieldGoalds * stats.HighestPoints * .25);
			medias.Tiro3 = (int)(mediaBase + _random.NextDouble() * stats.Points + stats.Pct3Pointers * 10);
			medias.TiroL = (int)(stats.PctFreeThrows * 100 + _random.Next(10) - _random.Next(10));
			medias.Rebotes = (int)(mediaBase * .7 + _random.NextDouble() * stats.Rebounds + _random.NextDouble() * stats.HighestRebounds) - _random.Next(15);
			medias.Asistencias = (int)(mediaBase * .9 + _random.NextDouble() * stats.Assists + _random.NextDouble() * stats.HighestAssists) - _random.Next(15);

			medias.Oculto = 99;

			while (desiredRating != medias.MediaQuinteto)
			{
				medias.Add(desiredRating - medias.MediaQuinteto);
			}
		}

		private static void GenerateSgRating(Medias medias, PlayerStatistics stats, int desiredRating)
		{
			var mediaBase = (desiredRating * 13 - 141) / 11;

			medias.SetMediasToValue(mediaBase);

			medias.Velocidad = mediaBase + _random.Next(15) - _random.Next(10);
			medias.Salto = (int)(mediaBase + _random.NextDouble() * stats.Rebounds - _random.Next(10));
			medias.Resistencia = (int)(mediaBase + _random.NextDouble() * stats.Minutes - _random.Next(10));
			medias.Agresividad = (int)(mediaBase * .7 + _random.NextDouble() * stats.Fouls + _random.NextDouble() * stats.Steals + _random.NextDouble() * stats.HighestRebounds - _random.Next(10));

			medias.Defensa = (int)(mediaBase + _random.NextDouble() * stats.TurnOvers + _random.NextDouble() * stats.Steals + _random.NextDouble() * stats.Rebounds) - _random.Next(15);
			medias.Tiro2 = (int)(mediaBase + _random.NextDouble() * stats.Points + stats.PctFieldGoalds * stats.HighestPoints * .3);
			medias.Tiro3 = (int)(mediaBase + _random.NextDouble() * stats.Points + stats.Pct3Pointers * 15);
			medias.TiroL = (int)(stats.PctFreeThrows * 100 + _random.Next(10) - _random.Next(10));
			medias.Rebotes = (int)(mediaBase * .7 + _random.NextDouble() * stats.Rebounds + _random.NextDouble() * stats.HighestRebounds) - _random.Next(15);
			medias.Asistencias = (int)(mediaBase * 1.1 + _random.NextDouble() * stats.Assists + _random.NextDouble() * stats.HighestAssists) - _random.Next(15);

			medias.Oculto = 99;

			while (desiredRating != medias.MediaQuinteto)
			{
				medias.Add(desiredRating - medias.MediaQuinteto);
			}
		}

		private static void GenerateSfRating(Medias medias, PlayerStatistics stats, int desiredRating)
		{
			var mediaBase = (desiredRating * 13 - 141) / 11;

			medias.SetMediasToValue(mediaBase);

			medias.Velocidad = mediaBase + _random.Next(10) - _random.Next(10);
			medias.Salto = (int)(mediaBase + _random.NextDouble() * stats.Rebounds + _random.NextDouble() * stats.HighestRebounds - _random.Next(15));
			medias.Resistencia = (int)(mediaBase + _random.NextDouble() * stats.Minutes - _random.Next(5));
			medias.Agresividad = (int)(mediaBase * .8 + _random.NextDouble() * stats.Fouls + _random.NextDouble() * stats.Steals + _random.NextDouble() * stats.HighestRebounds - _random.Next(10));

			medias.Defensa = (int)(mediaBase + _random.NextDouble() * stats.TurnOvers + _random.NextDouble() * stats.Steals + _random.NextDouble() * stats.Rebounds) - _random.Next(15);
			medias.Tiro2 = (int)(mediaBase + _random.NextDouble() * stats.Points + stats.PctFieldGoalds * stats.HighestPoints * .3);
			medias.Tiro3 = (int)(mediaBase + _random.NextDouble() * stats.Points + stats.Pct3Pointers * 15);
			medias.TiroL = (int)(stats.PctFreeThrows * 100 + _random.Next(10) - _random.Next(10));
			medias.Rebotes = (int)(mediaBase * .9 + _random.NextDouble() * stats.Rebounds + _random.NextDouble() * stats.HighestRebounds) - _random.Next(15);
			medias.Asistencias = (int)(mediaBase * .8 + _random.NextDouble() * stats.Assists + _random.NextDouble() * stats.HighestAssists) - _random.Next(15);

			medias.Oculto = 99;

			while (desiredRating != medias.MediaQuinteto)
			{
				medias.Add(desiredRating - medias.MediaQuinteto);
			}
		}

		private static void GeneratePfRating(Medias medias, PlayerStatistics stats, int desiredRating)
		{
			var mediaBase = (desiredRating * 13 - 141) / 11;

			medias.SetMediasToValue(mediaBase);

			medias.Velocidad = mediaBase + _random.Next(5) - _random.Next(10);
			medias.Salto = (int)(mediaBase + _random.NextDouble() * stats.Rebounds + _random.NextDouble() * stats.HighestRebounds - _random.Next(5));
			medias.Resistencia = (int)(mediaBase + _random.NextDouble() * stats.Minutes - _random.Next(5));
			medias.Agresividad = (int)(mediaBase + _random.NextDouble() * stats.Fouls + _random.NextDouble() * stats.Steals + _random.NextDouble() * stats.HighestRebounds - _random.Next(5));

			medias.Defensa = (int)(mediaBase + _random.NextDouble() * stats.TurnOvers + _random.NextDouble() * stats.Steals + _random.NextDouble() * stats.Rebounds) - _random.Next(15);
			medias.Tiro2 = (int)(mediaBase + _random.NextDouble() * stats.Points + stats.PctFieldGoalds * stats.HighestPoints * .35);
			medias.Tiro3 = (int)(mediaBase * .7 + _random.NextDouble() * 5 + stats.Pct3Pointers * 7);
			medias.TiroL = (int)(stats.PctFreeThrows * 100 + _random.Next(10) - _random.Next(15));
			medias.Rebotes = (int)(mediaBase * 1.1 + _random.NextDouble() * stats.Rebounds + _random.NextDouble() * stats.HighestRebounds) - _random.Next(15);
			medias.Asistencias = (int)(mediaBase * .7 + _random.NextDouble() * stats.Assists + _random.NextDouble() * stats.HighestAssists) - _random.Next(15);

			medias.Oculto = 99;

			while (desiredRating != medias.MediaQuinteto)
			{
				medias.Add(desiredRating - medias.MediaQuinteto);
			}
		}

		private static void GenerateCRating(Medias medias, PlayerStatistics stats, int desiredRating)
		{
			var mediaBase = (desiredRating * 13 - 141) / 11;

			medias.SetMediasToValue(mediaBase);

			medias.Velocidad = mediaBase + _random.Next(5) - _random.Next(15);
			medias.Salto = (int)(mediaBase + _random.NextDouble() * stats.Rebounds + _random.NextDouble() * stats.HighestRebounds - _random.Next(15));
			medias.Resistencia = (int)(mediaBase + _random.NextDouble() * stats.Minutes - _random.Next(5));
			medias.Agresividad = (int)(mediaBase + _random.NextDouble() * stats.Fouls + _random.NextDouble() * stats.Steals + _random.NextDouble() * stats.HighestRebounds);

			medias.Defensa = (int)(mediaBase + _random.NextDouble() * stats.TurnOvers + _random.NextDouble() * stats.Steals + _random.NextDouble() * stats.Rebounds) - _random.Next(10);
			medias.Tiro2 = (int)(mediaBase + _random.NextDouble() * stats.Points + stats.PctFieldGoalds * stats.HighestPoints * .5);
			medias.Tiro3 = (int)(mediaBase * .5 + _random.NextDouble() * 5 + stats.Pct3Pointers * 5);
			medias.TiroL = (int)(stats.PctFreeThrows * 100 + _random.Next(5) - _random.Next(15));
			medias.Rebotes = (int)(mediaBase * 1.25 + _random.NextDouble() * stats.Rebounds + _random.NextDouble() * stats.HighestRebounds) - _random.Next(5);
			medias.Asistencias = (int)(mediaBase * .5 + _random.NextDouble() * stats.Assists + _random.NextDouble() * stats.HighestAssists) - _random.Next(20);

			medias.Oculto = 99;

			while (desiredRating != medias.MediaQuinteto)
			{
				medias.Add(desiredRating - medias.MediaQuinteto);
			}
		}

		#endregion
	}
}
