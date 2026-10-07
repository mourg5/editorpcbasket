import { Equipo, Jugador, Settings, Demarcacion } from '../types/pcbasket';
import { getCountry, PAISES } from './paises';

export type PassportType = 'NAC' | 'COM' | 'COT' | 'EXT';

export interface ValidationIssue {
  id: string;
  type: 'error' | 'warning';
  title: string;
  message: string;
  playerIds?: number[];
}

export interface TeamValidationResult {
  isValid: boolean;
  hasErrors: boolean;
  hasWarnings: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  stats: {
    totalPlayers: number;
    foreignCount: number;
    maxForeigners: number;
    communityCount: number;
    cotonouCount: number;
    nationalCount: number;
    foreignPlayers: Jugador[];
    duplicateDorsales: number[];
    starterPositions: Demarcacion[];
    missingStarterPositions: Demarcacion[];
  };
}

export function getPlayerPassportType(
  player: Jugador,
  teamCountryId: number = 22,
  useEurNationality: boolean = true,
  useCotNationality: boolean = true
): { type: PassportType; label: string; badgeClass: string } {
  // If player country matches team country (by default Spain = 22)
  if (player.nacionalidad === teamCountryId || player.nacionalidad === 22) {
    return {
      type: 'NAC',
      label: 'Nacional',
      badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    };
  }

  const country = PAISES[player.nacionalidad] || getCountry(player.nacionalidad);

  if (useEurNationality && country.comunitario) {
    return {
      type: 'COM',
      label: 'Comunitario',
      badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    };
  }

  if (useCotNationality && country.cotonou) {
    return {
      type: 'COT',
      label: 'Cotonou',
      badgeClass: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    };
  }

  return {
    type: 'EXT',
    label: 'Extranjero',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  };
}

export const POS_NAMES: Record<Demarcacion, string> = {
  0: 'Base (B)',
  1: 'Escolta (E)',
  2: 'Alero (A)',
  3: 'Ala-Pívot (AP)',
  4: 'Pívot (P)',
};

export function validateTeamRoster(
  team: Equipo,
  options?: {
    useEurNationality?: boolean;
    useCotNationality?: boolean;
    maxForeigners?: number;
    minPlayers?: number;
    recommendedMinPlayers?: number;
    maxPlayers?: number;
  }
): TeamValidationResult {
  const useEur = options?.useEurNationality ?? true;
  const useCot = options?.useCotNationality ?? true;
  const maxForeigners = options?.maxForeigners ?? 2;
  const minPlayers = options?.minPlayers ?? 8;
  const recommendedMin = options?.recommendedMinPlayers ?? 10;
  const maxPlayers = options?.maxPlayers ?? 15;

  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  const foreignPlayers: Jugador[] = [];
  let communityCount = 0;
  let cotonouCount = 0;
  let nationalCount = 0;

  const dorsalMap = new Map<number, number[]>();

  const teamCountry = team.pais || 22;

  team.plantilla.forEach((player) => {
    const passport = getPlayerPassportType(player, teamCountry, useEur, useCot);
    if (passport.type === 'EXT') {
      foreignPlayers.push(player);
    } else if (passport.type === 'COM') {
      communityCount++;
    } else if (passport.type === 'COT') {
      cotonouCount++;
    } else {
      nationalCount++;
    }

    const currentWithDorsal = dorsalMap.get(player.dorsal) || [];
    currentWithDorsal.push(player.puntero);
    dorsalMap.set(player.dorsal, currentWithDorsal);
  });

  const foreignCount = foreignPlayers.length;

  // 1. Foreigners limit rule (ACB / PC Basket default: max 2 foreigners)
  if (foreignCount > maxForeigners) {
    errors.push({
      id: 'foreigners_limit',
      type: 'error',
      title: 'Límite de extranjeros superado',
      message: `La plantilla tiene ${foreignCount} jugadores extranjeros (el reglamento estándar de PC Basket permite un máximo de ${maxForeigners}).`,
      playerIds: foreignPlayers.map((p) => p.puntero),
    });
  }

  // 2. Minimum players rule (at least 8 to avoid forfeit, recommended 10+)
  if (team.plantilla.length < minPlayers) {
    errors.push({
      id: 'min_players_error',
      type: 'error',
      title: 'Plantilla insuficiente para competir',
      message: `El equipo tiene solo ${team.plantilla.length} jugadores. PC Basket requiere un mínimo reglamentario de ${minPlayers} jugadores para disputar partidos oficiales sin incomparecencia.`,
    });
  } else if (team.plantilla.length < recommendedMin) {
    warnings.push({
      id: 'min_players_warning',
      type: 'warning',
      title: 'Plantilla corta',
      message: `El equipo cuenta con ${team.plantilla.length} jugadores. Se recomienda un mínimo de ${recommendedMin} a 12 jugadores para asegurar rotaciones y suplentes por puesto.`,
    });
  }

  // 3. Maximum players rule (PC Basket DBC allows max 15)
  if (team.plantilla.length > maxPlayers) {
    errors.push({
      id: 'max_players_error',
      type: 'error',
      title: 'Límite máximo de plantilla superado',
      message: `El equipo tiene ${team.plantilla.length} jugadores. El formato binario de PC Basket admite un máximo estricto de ${maxPlayers} jugadores por equipo.`,
    });
  }

  // 4. Duplicate dorsals check
  const duplicateDorsales: number[] = [];
  dorsalMap.forEach((ids, dorsal) => {
    if (ids.length > 1) {
      duplicateDorsales.push(dorsal);
    }
  });

  if (duplicateDorsales.length > 0) {
    warnings.push({
      id: 'duplicate_dorsals',
      type: 'warning',
      title: 'Dorsales repetidos',
      message: `Hay números de dorsal repetidos en la plantilla: #${duplicateDorsales.join(', #')}. En baloncesto cada jugador debe tener un dorsal único.`,
    });
  }

  // 5. Starting 5 Demarcations coverage check
  const starterPositions: Demarcacion[] = [];
  const missingStarterPositions: Demarcacion[] = [];
  const starters = team.plantilla.slice(0, 5);

  starters.forEach((p) => {
    if (!starterPositions.includes(p.demarcacion)) {
      starterPositions.push(p.demarcacion);
    }
  });

  ([0, 1, 2, 3, 4] as Demarcacion[]).forEach((pos) => {
    if (!starterPositions.includes(pos)) {
      missingStarterPositions.push(pos);
    }
  });

  if (starters.length === 5 && missingStarterPositions.length > 0) {
    const missingNames = missingStarterPositions.map((p) => POS_NAMES[p]).join(', ');
    warnings.push({
      id: 'missing_starter_positions',
      type: 'warning',
      title: 'Desequilibrio en el quinteto titular',
      message: `El quinteto titular no cubre todas las posiciones naturales. Falta: ${missingNames}.`,
    });
  }

  const hasErrors = errors.length > 0;
  const hasWarnings = warnings.length > 0;
  const isValid = !hasErrors;

  return {
    isValid,
    hasErrors,
    hasWarnings,
    errors,
    warnings,
    stats: {
      totalPlayers: team.plantilla.length,
      foreignCount,
      maxForeigners,
      communityCount,
      cotonouCount,
      nationalCount,
      foreignPlayers,
      duplicateDorsales,
      starterPositions,
      missingStarterPositions,
    },
  };
}
