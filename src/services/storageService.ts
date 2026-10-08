import { Equipo, Jugador, Settings, Demarcacion, TransferRecord } from '../types/pcbasket';

const SETTINGS_KEY = 'epcb_settings';
const TEAMS_KEY = 'epcb_teams';
const TRANSFER_LEDGER_KEY = 'epcb_transfer_ledger';

export const DEFAULT_SETTINGS: Settings = {
  path: 'C:\\DINAMIC\\PCBASKET6',
  settingsCompleted: true,
  useEurNationality: true,
  useCotNationality: true,
  adjustBirthDates: false,
  maxPlayers: 15,
  startingYear: 1997,
};

function createPlayer(
  puntero: number,
  dorsal: number,
  nombreCorto: string,
  nombreLargo: string,
  demarcacion: Demarcacion,
  anoNacimiento: number,
  nacionalidad: number,
  altura: number,
  peso: number,
  colorPiel: boolean,
  velocidad: number,
  resistencia: number,
  agresividad: number,
  salto: number,
  defensa: number,
  tiro2: number,
  tiro3: number,
  tiroL: number,
  rebotes: number,
  asistencias: number,
  oculto: number = 85
): Jugador {
  return {
    jugadorId: puntero,
    puntero,
    dorsal,
    nombreCorto,
    nombreLargo,
    demarcacion,
    anoNacimiento,
    nacionalidad,
    altura,
    peso,
    colorPiel,
    medias: {
      velocidad,
      resistencia,
      agresividad,
      salto,
      defensa,
      tiro2,
      tiro3,
      tiroL,
      rebotes,
      asistencias,
      oculto,
    },
  };
}

export const INITIAL_TEAMS: Equipo[] = [
  {
    equipoId: 101,
    puntero: 101,
    nombreCorto: 'REAL MADRID',
    nombreLargo: 'REAL MADRID TEKA',
    pabellon: 'Palacio de Deportes',
    aforo: 12000,
    presupuesto: 1800,
    entrenador: 'Miguel Ángel Martín',
    pais: 22,
    plantilla: [
      createPlayer(1001, 11, 'HERREROS', 'Alberto HERREROS', 2, 1969, 22, 200, 95, false, 82, 85, 78, 80, 75, 91, 93, 89, 70, 78, 92),
      createPlayer(1002, 10, 'DJORDJEVIC', 'Aleksandar DJORDJEVIC', 0, 1967, 58, 188, 86, false, 84, 82, 80, 76, 74, 89, 92, 94, 65, 95, 96),
      createPlayer(1003, 14, 'ARLAUCKAS', 'Joe ARLAUCKAS', 3, 1965, 61, 204, 105, false, 79, 84, 88, 85, 82, 92, 60, 84, 88, 75, 94),
      createPlayer(1004, 6, 'SANTOS', 'Ismael SANTOS', 1, 1972, 22, 194, 90, false, 84, 88, 92, 82, 95, 72, 70, 75, 74, 76, 86),
      createPlayer(1005, 12, 'STRUELENS', 'Eric STRUELENS', 4, 1969, 12, 208, 112, false, 72, 80, 85, 78, 86, 82, 45, 78, 91, 68, 88),
      createPlayer(1006, 4, 'ANGULO', 'Alberto ANGULO', 1, 1970, 22, 196, 92, false, 80, 82, 76, 78, 78, 85, 84, 85, 68, 79, 87),
      createPlayer(1007, 7, 'LASO', 'Pablo LASO', 0, 1967, 22, 178, 75, false, 78, 79, 72, 70, 72, 76, 74, 82, 58, 91, 85),
      createPlayer(1008, 15, 'ORENGA', 'Juan Antonio ORENGA', 4, 1966, 22, 207, 108, false, 68, 78, 82, 74, 84, 80, 40, 76, 89, 70, 86),
      createPlayer(1009, 8, 'ANTUNEZ', 'José Miguel ANTÚNEZ', 0, 1967, 22, 183, 78, false, 80, 80, 75, 72, 76, 79, 78, 80, 60, 84, 84),
      createPlayer(1010, 9, 'MORALES', 'Juan Antonio MORALES', 3, 1969, 22, 211, 110, false, 67, 75, 78, 72, 80, 78, 42, 74, 84, 64, 82),
      createPlayer(1011, 13, 'LORENZO', 'Bobby LORENZO', 3, 1974, 22, 203, 98, false, 74, 76, 75, 78, 76, 74, 62, 70, 78, 68, 80),
      createPlayer(1012, 5, 'ITURBE', 'Iker ITURBE', 3, 1976, 22, 201, 101, false, 72, 75, 74, 75, 74, 76, 78, 75, 76, 68, 80),
    ],
  },
  {
    equipoId: 102,
    puntero: 102,
    nombreCorto: 'BARCELONA',
    nombreLargo: 'FC BARCELONA BANCA CATALANA',
    pabellon: 'Palau Blaugrana',
    aforo: 8200,
    presupuesto: 1850,
    entrenador: 'Manel Comas',
    pais: 22,
    plantilla: [
      createPlayer(1013, 7, 'DJORDJEVIC', 'Sasa DJORDJEVIC', 0, 1967, 58, 188, 85, false, 85, 84, 82, 78, 75, 90, 94, 95, 66, 96, 95),
      createPlayer(1014, 11, 'KARNISOVAS', 'Arturas KARNISOVAS', 2, 1971, 37, 204, 102, false, 80, 86, 84, 82, 80, 92, 90, 92, 85, 82, 94),
      createPlayer(1015, 12, 'DUENAS', 'Roberto DUEÑAS', 4, 1975, 22, 221, 140, false, 60, 78, 86, 70, 90, 84, 20, 68, 96, 55, 92),
      createPlayer(1016, 5, 'JOFRESA', 'Rafael JOFRESA', 0, 1966, 22, 183, 80, false, 80, 82, 78, 74, 78, 82, 85, 88, 62, 88, 88),
      createPlayer(1017, 4, 'JIMENEZ', 'Andrés JIMÉNEZ', 3, 1962, 22, 205, 105, false, 75, 80, 82, 78, 82, 86, 65, 82, 86, 75, 89),
      createPlayer(1018, 6, 'ESTELLER', 'Roger ESTELLER', 1, 1972, 22, 191, 88, false, 82, 84, 88, 80, 84, 85, 82, 86, 72, 78, 88),
      createPlayer(1019, 8, 'RODRIGUEZ', 'Quique RODRÍGUEZ', 1, 1970, 22, 193, 89, false, 78, 79, 75, 76, 76, 80, 80, 82, 65, 75, 82),
      createPlayer(1020, 14, 'MUSTAF', 'Jerrod MUSTAF', 4, 1969, 61, 208, 110, true, 72, 80, 85, 80, 84, 82, 45, 72, 90, 65, 88),
      createPlayer(1021, 9, 'FERRER', 'Xavi FERRER', 2, 1973, 22, 198, 92, false, 76, 78, 76, 76, 78, 78, 78, 78, 70, 72, 80),
      createPlayer(1022, 10, 'MONTERO', 'José Antonio MONTERO', 1, 1965, 22, 193, 87, false, 77, 78, 75, 74, 76, 80, 80, 84, 66, 80, 83),
      createPlayer(1023, 13, 'DE LA FUENTE', 'Enrique DE LA FUENTE', 2, 1975, 22, 195, 91, false, 78, 80, 82, 78, 80, 78, 74, 76, 74, 72, 82),
      createPlayer(1024, 15, 'AMAT', 'Oriol AMAT', 4, 1976, 22, 206, 104, false, 68, 74, 76, 72, 78, 75, 35, 70, 80, 60, 78),
    ],
  },
  {
    equipoId: 103,
    puntero: 103,
    nombreCorto: 'MANRESA',
    nombreLargo: 'TDK MANRESA',
    pabellon: 'Nou Congost',
    aforo: 5000,
    presupuesto: 750,
    entrenador: 'Luis Casimiro',
    pais: 22,
    plantilla: [
      createPlayer(1025, 4, 'CREUS', 'Joan CREUS', 0, 1956, 22, 176, 74, false, 78, 85, 80, 70, 78, 88, 90, 96, 64, 94, 95),
      createPlayer(1026, 12, 'VAZQUEZ', 'Paco VÁZQUEZ', 1, 1974, 22, 190, 86, false, 82, 84, 82, 80, 82, 88, 89, 86, 70, 76, 88),
      createPlayer(1027, 9, 'SALLIER', 'Herb SALLIER', 4, 1969, 61, 205, 108, true, 74, 82, 86, 82, 85, 84, 40, 76, 92, 68, 89),
      createPlayer(1028, 14, 'JONES', 'Derrick JONES', 3, 1970, 61, 203, 104, true, 76, 82, 84, 85, 84, 86, 68, 78, 88, 72, 89),
      createPlayer(1029, 6, 'SINGLA', 'Pere SINGLA', 4, 1972, 22, 211, 115, false, 66, 78, 84, 72, 82, 78, 30, 72, 86, 60, 82),
      createPlayer(1030, 7, 'MONTALBAN', 'Jesús MONTALBÁN', 2, 1972, 22, 198, 93, false, 78, 80, 78, 76, 80, 80, 82, 80, 72, 74, 82),
      createPlayer(1031, 8, 'CAPDEVILA', 'Román CAPDEVILA', 1, 1975, 22, 195, 90, false, 79, 80, 76, 78, 78, 80, 80, 82, 68, 75, 81),
      createPlayer(1032, 10, 'OLIVER', 'Albert OLIVER', 0, 1978, 22, 187, 82, false, 82, 80, 76, 75, 76, 78, 80, 84, 62, 82, 82),
      createPlayer(1033, 11, 'PEÑARROYA', 'Joan PEÑARROYA', 2, 1969, 22, 197, 92, false, 76, 80, 82, 76, 80, 82, 84, 85, 72, 76, 84),
      createPlayer(1034, 15, 'ALSTON', 'Derrick ALSTON', 4, 1972, 61, 208, 105, true, 78, 84, 88, 88, 88, 88, 65, 80, 94, 70, 92),
    ],
  },
  {
    equipoId: 104,
    puntero: 104,
    nombreCorto: 'JOVENTUT',
    nombreLargo: 'FESTINA JOVENTUT BADALONA',
    pabellon: 'Palau Olímpic de Badalona',
    aforo: 12500,
    presupuesto: 1100,
    entrenador: 'Alfred Julbe',
    pais: 22,
    plantilla: [
      createPlayer(1035, 10, 'TURNER', 'Andre TURNER', 0, 1964, 61, 182, 77, true, 86, 84, 80, 76, 78, 89, 90, 92, 64, 92, 94),
      createPlayer(1036, 12, 'BEARD', 'Tanoka BEARD', 4, 1971, 61, 206, 120, true, 78, 88, 92, 88, 88, 90, 45, 78, 96, 72, 95),
      createPlayer(1037, 5, 'JOFRESA', 'Tomás JOFRESA', 0, 1970, 22, 184, 81, false, 82, 82, 78, 76, 78, 82, 84, 86, 62, 86, 86),
      createPlayer(1038, 9, 'ESPINOSA', 'Dani ESPINOSA', 3, 1971, 22, 204, 102, false, 74, 80, 80, 78, 80, 80, 72, 78, 82, 72, 82),
      createPlayer(1039, 4, 'GRIMAU', 'Jordi GRIMAU', 1, 1983, 22, 195, 88, false, 80, 80, 78, 78, 78, 82, 80, 82, 68, 76, 81),
      createPlayer(1040, 8, 'VILLACAMPA', 'Jordi VILLACAMPA', 2, 1963, 22, 196, 92, false, 80, 82, 80, 78, 80, 88, 86, 89, 72, 80, 91),
      createPlayer(1041, 11, 'BASTIDA', 'Fran BASTIDA', 2, 1975, 22, 199, 94, false, 76, 78, 76, 76, 78, 78, 76, 78, 74, 70, 79),
      createPlayer(1042, 13, 'ALVAREZ', 'Nacho ÁLVAREZ', 3, 1973, 22, 203, 100, false, 72, 76, 78, 74, 78, 76, 60, 74, 80, 68, 78),
      createPlayer(1043, 14, 'MORALES', 'Nacho MORALES', 4, 1974, 22, 208, 108, false, 68, 76, 80, 72, 80, 76, 35, 72, 84, 62, 80),
      createPlayer(1044, 15, 'LOPEZ', 'Raül LÓPEZ', 0, 1980, 22, 182, 78, false, 84, 80, 75, 76, 76, 82, 82, 86, 60, 88, 86),
    ],
  },
  {
    equipoId: 105,
    puntero: 105,
    nombreCorto: 'BASKONIA',
    nombreLargo: 'TAU CERÁMICA BASKONIA',
    pabellon: 'Pabellón Araba',
    aforo: 9500,
    presupuesto: 1400,
    entrenador: 'Sergio Scariolo',
    pais: 22,
    plantilla: [
      createPlayer(1045, 6, 'BENNETT', 'Elmer BENNETT', 0, 1970, 61, 183, 79, true, 88, 86, 82, 80, 82, 91, 91, 92, 68, 96, 95),
      createPlayer(1046, 14, 'BERIC', 'Miroslav BERIC', 1, 1973, 58, 200, 95, false, 82, 84, 82, 80, 82, 90, 92, 91, 74, 80, 92),
      createPlayer(1047, 9, 'MILLERA', 'Carlos MILLERA', 0, 1972, 22, 187, 82, false, 80, 82, 78, 76, 78, 80, 80, 82, 62, 82, 82),
      createPlayer(1048, 12, 'BURKE', 'Pat BURKE', 4, 1973, 31, 211, 118, false, 70, 84, 90, 76, 88, 84, 30, 76, 94, 64, 90),
      createPlayer(1049, 11, 'GARBAJOSA', 'Jorge GARBAJOSA', 3, 1977, 22, 206, 103, false, 76, 82, 88, 80, 88, 85, 84, 82, 86, 78, 90),
      createPlayer(1050, 7, 'ESPINAL', 'Juan Pedro ESPINAL', 2, 1974, 22, 198, 93, false, 78, 80, 80, 78, 80, 80, 78, 80, 74, 74, 82),
      createPlayer(1051, 8, 'KAZLAUSKAS', 'Tomas KAZLAUSKAS', 2, 1972, 37, 201, 96, false, 79, 82, 80, 80, 80, 84, 85, 84, 76, 78, 85),
      createPlayer(1052, 13, 'CAZORLA', 'Carlos CAZORLA', 2, 1977, 22, 197, 92, false, 80, 82, 85, 80, 85, 78, 74, 76, 74, 74, 83),
      createPlayer(1053, 15, 'TIMINSKAS', 'Mindaugas TIMINSKAS', 3, 1974, 37, 202, 100, false, 78, 82, 84, 82, 82, 84, 80, 82, 82, 76, 86),
    ],
  },
  {
    equipoId: 106,
    puntero: 106,
    nombreCorto: 'ESTUDIANTES',
    nombreLargo: 'ADECCA ESTUDIANTES',
    pabellon: 'Palacio de los Deportes',
    aforo: 12000,
    presupuesto: 1050,
    entrenador: 'Pepu Hernández',
    pais: 22,
    plantilla: [
      createPlayer(1054, 14, 'THOMPSON', 'Chandler THOMPSON', 2, 1970, 61, 195, 96, true, 86, 88, 84, 98, 82, 90, 88, 84, 80, 80, 94),
      createPlayer(1055, 9, 'JIMENEZ', 'Carlos JIMÉNEZ', 2, 1976, 22, 205, 100, false, 80, 88, 90, 82, 92, 84, 76, 84, 92, 84, 93),
      createPlayer(1056, 11, 'VANDERMEER', 'Dan VANDER MEER', 4, 1970, 61, 210, 116, false, 68, 82, 86, 75, 86, 82, 35, 74, 90, 65, 88),
      createPlayer(1057, 5, 'AZOFRA', 'Nacho AZOFRA', 0, 1969, 22, 185, 82, false, 82, 84, 82, 78, 80, 84, 85, 88, 66, 92, 91),
      createPlayer(1058, 8, 'DE MIGUEL', 'Iñaki DE MIGUEL', 3, 1973, 22, 205, 105, false, 76, 84, 88, 80, 86, 82, 50, 78, 88, 72, 88),
      createPlayer(1059, 10, 'REYES', 'Alfonso REYES', 4, 1971, 22, 202, 115, false, 74, 86, 94, 82, 90, 86, 40, 80, 95, 74, 92),
      createPlayer(1060, 4, 'MARTINEZ', 'Gonzalo MARTÍNEZ', 0, 1974, 22, 178, 76, false, 82, 82, 78, 74, 78, 80, 84, 86, 60, 85, 84),
      createPlayer(1061, 7, 'GARCIA', 'Javier GARCÍA', 1, 1976, 22, 192, 87, false, 78, 78, 76, 76, 76, 78, 78, 80, 64, 74, 80),
      createPlayer(1062, 12, 'REYES', 'Felipe REYES', 3, 1980, 22, 204, 108, false, 76, 86, 92, 84, 88, 84, 45, 80, 94, 74, 91),
    ],
  },
  {
    equipoId: 107,
    puntero: 107,
    nombreCorto: 'UNICAJA',
    nombreLargo: 'UNICAJA MÁLAGA',
    pabellon: 'Martín Carpena',
    aforo: 9000,
    presupuesto: 950,
    entrenador: 'Javier Imbroda',
    pais: 22,
    plantilla: [
      createPlayer(1063, 6, 'BABKOV', 'Sergei BABKOV', 1, 1967, 50, 192, 88, false, 84, 84, 80, 82, 78, 92, 94, 92, 70, 82, 94),
      createPlayer(1064, 4, 'RODRIGUEZ', 'Nacho RODRÍGUEZ', 0, 1970, 22, 186, 84, false, 84, 86, 85, 80, 85, 84, 82, 86, 68, 90, 92),
      createPlayer(1065, 8, 'CURCIC', 'Radisav CURCIC', 4, 1965, 58, 206, 122, false, 68, 82, 90, 74, 88, 86, 35, 78, 94, 70, 91),
      createPlayer(1066, 12, 'ANSLEY', 'Michael ANSLEY', 3, 1967, 61, 201, 106, true, 78, 84, 86, 84, 84, 88, 75, 84, 90, 76, 92),
      createPlayer(1067, 5, 'ROMERO', 'Dani ROMERO', 2, 1973, 22, 198, 92, false, 80, 82, 80, 78, 80, 82, 82, 82, 72, 76, 83),
      createPlayer(1068, 7, 'GARCIA', 'Jesús Lázaro GARCÍA', 0, 1971, 22, 184, 80, false, 80, 80, 78, 76, 78, 78, 78, 82, 62, 82, 82),
      createPlayer(1069, 10, 'RUIZ', 'Gabi RUIZ', 3, 1973, 22, 204, 102, false, 74, 80, 82, 78, 82, 80, 65, 76, 84, 70, 83),
      createPlayer(1070, 14, 'MILLER', 'Kenny MILLER', 4, 1967, 61, 205, 110, true, 72, 82, 88, 80, 86, 82, 40, 74, 92, 68, 88),
    ],
  },
  {
    equipoId: 108,
    puntero: 108,
    nombreCorto: 'VALENCIA',
    nombreLargo: 'PAMESA VALENCIA',
    pabellon: 'Fuente de San Luis',
    aforo: 8500,
    presupuesto: 900,
    entrenador: 'Miki Vukovic',
    pais: 22,
    plantilla: [
      createPlayer(1071, 4, 'RODOLFO', 'Berni ÁLVAREZ', 2, 1971, 22, 196, 90, false, 82, 82, 78, 80, 78, 88, 92, 90, 70, 78, 90),
      createPlayer(1072, 11, 'HOPKINS', 'Bernard HOPKINS', 3, 1973, 61, 200, 104, true, 80, 88, 90, 86, 86, 90, 70, 84, 92, 80, 93),
      createPlayer(1073, 5, 'ALONSO', 'Salva DÍEZ', 0, 1963, 22, 182, 78, false, 80, 82, 84, 76, 84, 80, 80, 84, 64, 88, 86),
      createPlayer(1074, 7, 'LUENGO', 'Víctor LUENGO', 1, 1974, 22, 195, 92, false, 80, 84, 88, 80, 86, 82, 82, 84, 74, 76, 86),
      createPlayer(1075, 14, 'MALUENDA', 'José Luis MALUENDA', 1, 1977, 22, 192, 88, false, 82, 82, 78, 80, 78, 86, 88, 86, 68, 76, 86),
      createPlayer(1076, 12, 'SWINSON', 'Aaron SWINSON', 2, 1971, 61, 198, 102, true, 82, 86, 88, 88, 84, 88, 72, 82, 88, 76, 91),
      createPlayer(1077, 9, 'ALBERT', 'César ALBERT', 4, 1970, 22, 210, 115, false, 68, 78, 82, 74, 82, 78, 35, 72, 86, 64, 82),
      createPlayer(1078, 8, 'BURGOS', 'Nacho BURGOS', 3, 1975, 22, 202, 98, false, 74, 78, 80, 76, 80, 78, 62, 75, 80, 70, 80),
    ],
  },
];

export class StorageService {
  static getSettings(): Settings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SETTINGS;
  }

  static saveSettings(settings: Settings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }

  static getTeams(): Equipo[] {
    try {
      const data = localStorage.getItem(TEAMS_KEY);
      if (data) {
        const teams: Equipo[] = JSON.parse(data);
        if (Array.isArray(teams) && teams.length > 0) {
          return teams;
        }
      }
    } catch (e) {
      console.error(e);
    }
    // Seed initial teams
    this.saveTeams(INITIAL_TEAMS);
    return INITIAL_TEAMS;
  }

  static saveTeams(teams: Equipo[]): void {
    try {
      localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
    } catch (e) {
      console.error(e);
    }
  }

  static resetDatabase(): Equipo[] {
    this.saveTeams(INITIAL_TEAMS);
    return INITIAL_TEAMS;
  }

  static clearDatabase(): Equipo[] {
    this.saveTeams([]);
    return [];
  }

  static saveTeam(team: Equipo): Equipo[] {
    const teams = this.getTeams();
    const index = teams.findIndex((t) => t.puntero === team.puntero);
    if (index >= 0) {
      teams[index] = team;
    } else {
      teams.push(team);
    }
    teams.sort((a, b) => a.puntero - b.puntero);
    this.saveTeams(teams);
    return teams;
  }

  static deleteTeam(puntero: number): Equipo[] {
    const teams = this.getTeams().filter((t) => t.puntero !== puntero);
    this.saveTeams(teams);
    return teams;
  }

  static getAllPlayers(): Jugador[] {
    const teams = this.getTeams();
    const players: Jugador[] = [];
    for (const team of teams) {
      for (const player of team.plantilla) {
        players.push({
          ...player,
          equipoPuntero: team.puntero,
        });
      }
    }
    return players;
  }

  // --- TRANSFER LEDGER METHODS ---

  static getTransferLedger(): TransferRecord[] {
    try {
      const stored = localStorage.getItem(TRANSFER_LEDGER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading transfer ledger:', e);
    }

    // Seed default historical records if empty
    const seeded = this.getInitialTransfers();
    this.saveTransferLedger(seeded);
    return seeded;
  }

  static getInitialTransfers(): TransferRecord[] {
    const now = Date.now();
    return [
      {
        id: 'tr-seed-1',
        timestamp: now - 1000 * 60 * 18, // 18 mins ago
        playerPuntero: 1001,
        playerName: 'Alberto HERREROS',
        playerDorsal: 11,
        playerDemarcacion: 2,
        playerMedia: 92,
        fromTeamPuntero: 104,
        fromTeamName: 'ESTUDIANTES',
        toTeamPuntero: 101,
        toTeamName: 'REAL MADRID',
        type: 'TRANSFER',
        notes: 'Fichaje estrella ACB - Traspaso cerrado',
      },
      {
        id: 'tr-seed-2',
        timestamp: now - 1000 * 60 * 60 * 4, // 4 hours ago
        playerPuntero: 1002,
        playerName: 'Aleksandar DJORDJEVIC',
        playerDorsal: 10,
        playerDemarcacion: 0,
        playerMedia: 96,
        fromTeamPuntero: 201,
        fromTeamName: 'OLIMPIA MILANO',
        toTeamPuntero: 102,
        toTeamName: 'FC BARCELONA',
        type: 'TRANSFER',
        notes: 'Incorporación internacional director de juego',
      },
      {
        id: 'tr-seed-3',
        timestamp: now - 1000 * 60 * 60 * 26, // 26 hours ago
        playerPuntero: 1005,
        playerName: 'Eric STRUELENS',
        playerDorsal: 12,
        playerDemarcacion: 4,
        playerMedia: 88,
        fromTeamPuntero: 205,
        fromTeamName: 'SPIROU CHARLEROI',
        toTeamPuntero: 101,
        toTeamName: 'REAL MADRID',
        type: 'TRANSFER',
        notes: 'Pívot comunitario - Refuerzo juego interior',
      },
    ];
  }

  static saveTransferLedger(records: TransferRecord[]): void {
    try {
      localStorage.setItem(TRANSFER_LEDGER_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Error saving transfer ledger:', e);
    }
  }

  static recordTransfers(
    records: (Omit<TransferRecord, 'id' | 'timestamp'> & {
      id?: string;
      timestamp?: number;
    })[]
  ): TransferRecord[] {
    const existing = this.getTransferLedger();
    const newRecords: TransferRecord[] = records.map((r, i) => ({
      ...r,
      id: r.id || `tr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${i}`,
      timestamp: r.timestamp || Date.now() + i, // Preserve order
    }));

    // Prepend new records to the top
    const combined = [...newRecords, ...existing];
    this.saveTransferLedger(combined);
    return combined;
  }

  static deleteTransferRecord(id: string): TransferRecord[] {
    const existing = this.getTransferLedger().filter((r) => r.id !== id);
    this.saveTransferLedger(existing);
    return existing;
  }

  static clearTransferLedger(): void {
    this.saveTransferLedger([]);
  }

  static resetTransferLedger(): TransferRecord[] {
    const initial = this.getInitialTransfers();
    this.saveTransferLedger(initial);
    return initial;
  }
}
