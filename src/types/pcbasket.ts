export interface Medias {
  velocidad: number;
  salto: number;
  resistencia: number;
  agresividad: number;
  oculto: number;
  defensa: number;
  tiro2: number;
  tiro3: number;
  tiroL: number;
  rebotes: number;
  asistencias: number;
}

export type Demarcacion = 0 | 1 | 2 | 3 | 4;
// 0: Base, 1: Escolta, 2: Alero, 3: Ala-Pívot, 4: Pívot

export interface Jugador {
  jugadorId: number;
  puntero: number;
  dorsal: number;
  nombreCorto: string;
  nombreLargo: string;
  nacionalidad: number; // Pais ID
  demarcacion: Demarcacion;
  anoNacimiento: number;
  colorPiel: boolean; // false = Blanco, true = Negro
  altura: number; // in cm
  peso: number; // in kg
  medias: Medias;
  equipoPuntero?: number;
  contrato?: number; // Salario/Ficha anual en Millones de pesetas (M)
}

export interface Equipo {
  equipoId: number;
  puntero: number;
  nombreCorto: string;
  nombreLargo: string;
  pabellon: string;
  aforo: number;
  presupuesto: number;
  entrenador: string;
  pais: number; // Pais ID
  plantilla: Jugador[];
}

export interface IAbilities {
  isVeloz: boolean;
  isAtletico: boolean;
  isIntimidador: boolean;
  isTirador: boolean;
  isCreador: boolean;
  isDefensor: boolean;
}

export interface PlayerStatistics {
  points?: number;
  rebounds?: number;
  assists?: number;
  minutes?: number;
  pct3Pointers?: number;
  pctFieldGoals?: number;
  pctFreeThrows?: number;
  offensiveRebounds?: number;
  steals?: number;
  turnovers?: number;
  blocks?: number;
  fouls?: number;
  efficiency?: number;
  highestPoints?: number;
  highestRebounds?: number;
  highestAssists?: number;
}

export interface Settings {
  path: string;
  settingsCompleted: boolean;
  useEurNationality: boolean;
  useCotNationality: boolean;
  adjustBirthDates: boolean;
  maxPlayers: number;
  startingYear: number;
}

export interface TransferRecord {
  id: string;
  timestamp: number; // Epoch time in ms
  playerPuntero: number;
  playerName: string;
  playerDorsal: number;
  playerDemarcacion: Demarcacion;
  playerMedia?: number;
  fromTeamPuntero: number;
  fromTeamName: string;
  toTeamPuntero: number;
  toTeamName: string;
  type?: 'TRANSFER' | 'RELEASE' | 'SIGNING' | 'SWAP';
  batchId?: string;
  notes?: string;
}

export type NavigationView =
  | 'MainMenuView'
  | 'TeamsView'
  | 'PlayersView'
  | 'StatsDashboardView'
  | 'ManagerView'
  | 'SettingsView';
