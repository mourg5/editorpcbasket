import { Medias, IAbilities, Jugador, Demarcacion } from '../types/pcbasket';

export function calculateMediaQuinteto(m: Medias): number {
  return Math.round(
    (m.velocidad +
      m.salto +
      m.resistencia +
      m.agresividad +
      m.defensa +
      m.tiro2 +
      m.tiro3 +
      m.tiroL +
      m.rebotes +
      m.asistencias +
      m.oculto +
      141.0) /
      13
  );
}

export function calculateMediaPlantilla(m: Medias): number {
  return Math.round(
    (((m.velocidad +
      m.resistencia +
      m.agresividad +
      m.defensa +
      m.rebotes +
      m.asistencias +
      m.oculto) *
      13) /
      7 +
      100.0) /
      14
  );
}

export function calculateTeamMedias(plantilla: Jugador[]): {
  mediaQuinteto: number;
  mediaPlantilla: number;
} {
  if (!plantilla || plantilla.length === 0) {
    return { mediaQuinteto: 0, mediaPlantilla: 0 };
  }

  const sumQ = plantilla.reduce(
    (acc, j) => acc + calculateMediaQuinteto(j.medias),
    0
  );
  const sumP = plantilla.reduce(
    (acc, j) => acc + calculateMediaPlantilla(j.medias),
    0
  );

  return {
    mediaQuinteto: Math.round((sumQ / plantilla.length) * 100) / 100,
    mediaPlantilla: Math.round((sumP / plantilla.length) * 100) / 100,
  };
}

export function clampRating(val: number): number {
  return Math.max(0, Math.min(99, Math.round(val)));
}

export function addRatingDelta(medias: Medias, delta: number): void {
  medias.velocidad = clampRating(medias.velocidad + delta);
  medias.salto = clampRating(medias.salto + delta);
  medias.resistencia = clampRating(medias.resistencia + delta);
  medias.agresividad = clampRating(medias.agresividad + delta);
  medias.oculto = clampRating(medias.oculto + delta);
  medias.defensa = clampRating(medias.defensa + delta);
  medias.tiro2 = clampRating(medias.tiro2 + delta);
  medias.tiro3 = clampRating(medias.tiro3 + delta);
  medias.tiroL = clampRating(medias.tiroL + delta);
  medias.rebotes = clampRating(medias.rebotes + delta);
  medias.asistencias = clampRating(medias.asistencias + delta);
}

function rnd(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generatePlayerRating(
  medias: Medias,
  abilities: IAbilities,
  desiredRating: number,
  position: Demarcacion
): void {
  desiredRating = Math.min(95, Math.max(11, desiredRating));

  switch (position) {
    case 0:
      generatePgRating(medias, abilities, desiredRating);
      break;
    case 1:
      generateSgRating(medias, abilities, desiredRating);
      break;
    case 2:
      generateSfRating(medias, abilities, desiredRating);
      break;
    case 3:
      generatePfRating(medias, abilities, desiredRating);
      break;
    default:
      generateCRating(medias, abilities, desiredRating);
      break;
  }
}

function generatePgRating(
  medias: Medias,
  abilities: IAbilities,
  desiredRating: number
): void {
  const mediaBase = Math.floor((desiredRating * 13 - 141) / 11);

  medias.velocidad = abilities.isVeloz
    ? clampRating(mediaBase * 1.3 + rnd(0, 14))
    : clampRating(mediaBase - rnd(0, 14));
  medias.salto = abilities.isAtletico
    ? clampRating(mediaBase + rnd(0, 14))
    : clampRating(mediaBase - rnd(0, 14));
  medias.resistencia = abilities.isAtletico
    ? clampRating(mediaBase + rnd(0, 19))
    : clampRating(mediaBase - rnd(0, 9));
  medias.agresividad = abilities.isIntimidador
    ? clampRating(mediaBase * 0.8 + rnd(0, 14))
    : clampRating(mediaBase * 0.75 - rnd(0, 19));
  medias.defensa = abilities.isDefensor
    ? clampRating(mediaBase + rnd(0, 14))
    : clampRating(mediaBase - rnd(0, 14));
  medias.tiro2 = abilities.isTirador
    ? clampRating(mediaBase * 1.15 + rnd(0, 14))
    : clampRating(mediaBase - rnd(0, 9));
  medias.tiro3 = abilities.isTirador
    ? clampRating(mediaBase * 1.2 + rnd(0, 14))
    : clampRating(mediaBase - rnd(0, 9));
  medias.tiroL = abilities.isTirador
    ? clampRating(mediaBase * 1.2 + rnd(0, 14))
    : clampRating(mediaBase - rnd(0, 9));
  medias.rebotes = abilities.isIntimidador
    ? clampRating(mediaBase * 0.7 + rnd(0, 9))
    : clampRating(mediaBase * 0.6 - rnd(0, 29));
  medias.asistencias = abilities.isCreador
    ? clampRating(mediaBase * 1.1 + rnd(0, 14))
    : clampRating(mediaBase * 1.0 - rnd(0, 9));
  medias.oculto = 99;

  let current = calculateMediaQuinteto(medias);
  let attempts = 0;
  while (desiredRating !== current && attempts < 15) {
    addRatingDelta(medias, desiredRating - current);
    current = calculateMediaQuinteto(medias);
    attempts++;
  }
}

function generateSgRating(
  medias: Medias,
  abilities: IAbilities,
  desiredRating: number
): void {
  let totalPoints = desiredRating * 13 - 141;
  const mediaBase = Math.floor(totalPoints / 11);

  medias.velocidad = abilities.isVeloz
    ? clampRating(mediaBase * 1.2 + rnd(0, 14))
    : clampRating(mediaBase - rnd(0, 14));
  totalPoints -= medias.velocidad;

  medias.salto = abilities.isAtletico
    ? clampRating(mediaBase + rnd(0, 24))
    : clampRating(mediaBase - rnd(0, 14));
  totalPoints -= medias.salto;

  medias.resistencia = abilities.isAtletico
    ? clampRating(mediaBase + rnd(0, 24))
    : clampRating(mediaBase - rnd(0, 9));
  totalPoints -= medias.resistencia;

  medias.agresividad = abilities.isIntimidador
    ? clampRating(mediaBase + rnd(0, 14))
    : clampRating(mediaBase * 0.8 - rnd(0, 19));
  totalPoints -= medias.agresividad;

  medias.defensa = abilities.isDefensor
    ? clampRating(mediaBase + rnd(0, 14))
    : clampRating(mediaBase - rnd(0, 14));
  totalPoints -= medias.defensa;

  medias.tiro2 = abilities.isTirador
    ? clampRating(mediaBase * 1.15 + rnd(0, 19))
    : clampRating(mediaBase - rnd(0, 9));
  totalPoints -= medias.tiro2;

  medias.tiro3 = abilities.isTirador
    ? clampRating(mediaBase * 1.2 + rnd(0, 24))
    : clampRating(mediaBase - rnd(0, 9));
  totalPoints -= medias.tiro3;

  medias.tiroL = abilities.isTirador
    ? clampRating(mediaBase * 1.2 + rnd(0, 14))
    : clampRating(mediaBase - rnd(0, 9));
  totalPoints -= medias.tiroL;

  medias.rebotes = abilities.isIntimidador
    ? clampRating(mediaBase * 0.7 + rnd(0, 9))
    : clampRating(mediaBase * 0.6 - rnd(0, 29));
  totalPoints -= medias.rebotes;

  medias.asistencias = abilities.isCreador
    ? clampRating(mediaBase + rnd(0, 14))
    : clampRating(mediaBase - rnd(0, 14));
  totalPoints -= medias.asistencias;

  medias.oculto = 99;

  let current = calculateMediaQuinteto(medias);
  let attempts = 0;
  while (desiredRating !== current && attempts < 15) {
    addRatingDelta(medias, desiredRating - current);
    current = calculateMediaQuinteto(medias);
    attempts++;
  }
}

function generateSfRating(
  medias: Medias,
  abilities: IAbilities,
  desiredRating: number
): void {
  let totalPoints = desiredRating * 13 - 141;
  const mediaBase = Math.floor(totalPoints / 11);

  medias.velocidad = abilities.isVeloz
    ? clampRating(mediaBase + rnd(0, 24))
    : clampRating(mediaBase - rnd(0, 14));
  totalPoints -= medias.velocidad;

  medias.salto = abilities.isAtletico
    ? clampRating(mediaBase * 1.2 + rnd(0, 19))
    : clampRating(mediaBase - rnd(0, 14));
  totalPoints -= medias.salto;

  medias.resistencia = abilities.isAtletico
    ? clampRating(mediaBase + rnd(0, 24))
    : clampRating(mediaBase - rnd(0, 9));
  totalPoints -= medias.resistencia;

  medias.agresividad = abilities.isIntimidador
    ? clampRating(mediaBase + rnd(0, 19))
    : clampRating(mediaBase - rnd(0, 19));
  totalPoints -= medias.agresividad;

  medias.defensa = abilities.isDefensor
    ? clampRating(mediaBase + rnd(0, 19))
    : clampRating(mediaBase - rnd(0, 14));
  totalPoints -= medias.defensa;

  medias.tiro2 = abilities.isTirador
    ? clampRating(mediaBase * 1.15 + rnd(0, 19))
    : clampRating(mediaBase - rnd(0, 9));
  totalPoints -= medias.tiro2;

  medias.tiro3 = abilities.isTirador
    ? clampRating(mediaBase * 1.2 + rnd(0, 14))
    : clampRating(mediaBase - rnd(0, 9));
  totalPoints -= medias.tiro3;

  medias.tiroL = abilities.isTirador
    ? clampRating(mediaBase * 1.2 + rnd(0, 14))
    : clampRating(mediaBase - rnd(0, 9));
  totalPoints -= medias.tiroL;

  medias.rebotes = abilities.isIntimidador
    ? clampRating(mediaBase + rnd(0, 9))
    : clampRating(mediaBase * 0.9 - rnd(0, 19));
  totalPoints -= medias.rebotes;

  medias.asistencias = abilities.isCreador
    ? clampRating(mediaBase + rnd(0, 9))
    : clampRating(mediaBase - rnd(0, 14));
  totalPoints -= medias.asistencias;

  medias.oculto = 99;

  let current = calculateMediaQuinteto(medias);
  let attempts = 0;
  while (desiredRating !== current && attempts < 15) {
    addRatingDelta(medias, desiredRating - current);
    current = calculateMediaQuinteto(medias);
    attempts++;
  }
}

function generatePfRating(
  medias: Medias,
  abilities: IAbilities,
  desiredRating: number
): void {
  let totalPoints = desiredRating * 13 - 141;
  const mediaBase = Math.floor(totalPoints / 11);

  medias.velocidad = abilities.isVeloz
    ? clampRating(mediaBase * 0.8 - rnd(0, 14))
    : clampRating(mediaBase * 0.7 - rnd(0, 24));
  totalPoints -= medias.velocidad;

  medias.salto = abilities.isAtletico
    ? clampRating(mediaBase + rnd(0, 4))
    : clampRating(mediaBase - rnd(0, 14));
  totalPoints -= medias.salto;

  medias.resistencia = abilities.isAtletico
    ? clampRating(mediaBase + rnd(0, 19))
    : clampRating(mediaBase - rnd(0, 9));
  totalPoints -= medias.resistencia;

  medias.agresividad = abilities.isIntimidador
    ? clampRating(mediaBase * 1.1 + rnd(0, 9))
    : clampRating(mediaBase - rnd(0, 14));
  totalPoints -= medias.agresividad;

  medias.defensa = abilities.isDefensor
    ? clampRating(mediaBase + rnd(0, 14))
    : clampRating(mediaBase - rnd(0, 14));
  totalPoints -= medias.defensa;

  medias.tiro2 = abilities.isTirador
    ? clampRating(mediaBase + rnd(0, 14))
    : clampRating(mediaBase * 0.8 - rnd(0, 19));
  totalPoints -= medias.tiro2;

  medias.tiro3 = abilities.isTirador
    ? clampRating(mediaBase * 0.75 + rnd(0, 9))
    : clampRating(mediaBase * 0.4 - rnd(0, 9));
  totalPoints -= medias.tiro3;

  medias.tiroL = abilities.isTirador
    ? clampRating(mediaBase + rnd(0, 24))
    : clampRating(mediaBase - rnd(0, 14));
  totalPoints -= medias.tiroL;

  medias.rebotes = abilities.isDefensor
    ? clampRating(mediaBase + rnd(0, 24))
    : clampRating(mediaBase - rnd(0, 14));
  totalPoints -= medias.rebotes;

  medias.asistencias = abilities.isCreador
    ? clampRating(mediaBase * 0.7 - rnd(0, 9))
    : clampRating(mediaBase * 0.66 - rnd(0, 24));
  totalPoints -= medias.asistencias;

  medias.oculto = Math.max(10, Math.min(99, totalPoints));

  let current = calculateMediaQuinteto(medias);
  let attempts = 0;
  while (desiredRating !== current && attempts < 15) {
    addRatingDelta(medias, desiredRating - current);
    current = calculateMediaQuinteto(medias);
    attempts++;
  }
}

function generateCRating(
  medias: Medias,
  abilities: IAbilities,
  desiredRating: number
): void {
  let totalPoints = desiredRating * 13 - 141;
  const mediaBase = Math.floor(totalPoints / 11);

  medias.velocidad = abilities.isVeloz
    ? clampRating(mediaBase * 0.7 - rnd(0, 4))
    : clampRating(mediaBase * 0.5 - rnd(0, 19));
  totalPoints -= medias.velocidad;

  medias.salto = abilities.isAtletico
    ? clampRating(mediaBase - rnd(0, 4))
    : clampRating(mediaBase - rnd(0, 19));
  totalPoints -= medias.salto;

  medias.resistencia = abilities.isAtletico
    ? clampRating(mediaBase + rnd(0, 14))
    : clampRating(mediaBase - rnd(0, 9));
  totalPoints -= medias.resistencia;

  medias.agresividad = abilities.isIntimidador
    ? clampRating(mediaBase * 1.1 + rnd(0, 9))
    : clampRating(mediaBase - rnd(0, 14));
  totalPoints -= medias.agresividad;

  medias.defensa = abilities.isDefensor
    ? clampRating(mediaBase + rnd(0, 14))
    : clampRating(mediaBase - rnd(0, 14));
  totalPoints -= medias.defensa;

  medias.tiro2 = abilities.isTirador
    ? clampRating(mediaBase + rnd(0, 14))
    : clampRating(mediaBase * 0.8 - rnd(0, 19));
  totalPoints -= medias.tiro2;

  medias.tiro3 = abilities.isTirador
    ? clampRating(mediaBase * 0.5 + rnd(0, 9))
    : clampRating(mediaBase * 0.25 - rnd(0, 9));
  totalPoints -= medias.tiro3;

  medias.tiroL = abilities.isTirador
    ? clampRating(mediaBase + rnd(0, 14))
    : clampRating(mediaBase - rnd(0, 14));
  totalPoints -= medias.tiroL;

  medias.rebotes = abilities.isDefensor
    ? clampRating(mediaBase * 1.1 + rnd(0, 14))
    : clampRating(mediaBase * 1.0 - rnd(0, 9));
  totalPoints -= medias.rebotes;

  medias.asistencias = abilities.isCreador
    ? clampRating(mediaBase * 0.6 - rnd(0, 9))
    : clampRating(mediaBase * 0.4 - rnd(0, 29));
  totalPoints -= medias.asistencias;

  medias.oculto = Math.max(10, Math.min(99, totalPoints));

  let current = calculateMediaQuinteto(medias);
  let attempts = 0;
  while (desiredRating !== current && attempts < 15) {
    addRatingDelta(medias, desiredRating - current);
    current = calculateMediaQuinteto(medias);
    attempts++;
  }
}

/**
 * Calculates a player's annual salary / contract in Millions of pesetas (M)
 * based on PC Basket market valuations, overall quality and foreign status.
 */
export function calculatePlayerSalary(player: Jugador): number {
  if (typeof player.contrato === 'number' && player.contrato > 0) {
    return player.contrato;
  }
  const rating = calculateMediaQuinteto(player.medias);
  let salary = 15;
  if (rating >= 92) {
    salary = 240 + (rating - 92) * 20; // 240 - 380M
  } else if (rating >= 85) {
    salary = 150 + (rating - 85) * 12; // 150 - 234M
  } else if (rating >= 78) {
    salary = 95 + (rating - 78) * 7.5; // 95 - 147.5M
  } else if (rating >= 70) {
    salary = 55 + (rating - 70) * 5; // 55 - 95M
  } else if (rating >= 60) {
    salary = 30 + (rating - 60) * 2.5; // 30 - 55M
  } else {
    salary = Math.max(12, Math.round(rating * 0.45));
  }

  // Premium for non-national / marquee players in European leagues
  if (player.nacionalidad === 2 || player.nacionalidad === 3) {
    salary = Math.round(salary * 1.15);
  }

  return Math.round(salary);
}

/**
 * Calculates total payroll and salary distribution for a team's roster
 */
export function calculateTeamPayroll(plantilla: Jugador[]): {
  total: number;
  starters: number;
  bench: number;
  maxSalaryPlayer: { player: Jugador; salary: number } | null;
  avgSalary: number;
} {
  if (!plantilla || plantilla.length === 0) {
    return { total: 0, starters: 0, bench: 0, maxSalaryPlayer: null, avgSalary: 0 };
  }

  let total = 0;
  let starters = 0;
  let bench = 0;
  let maxSalary = -1;
  let maxSalaryPlayer: { player: Jugador; salary: number } | null = null;

  plantilla.forEach((player, idx) => {
    const salary = calculatePlayerSalary(player);
    total += salary;
    if (idx < 5) {
      starters += salary;
    } else {
      bench += salary;
    }
    if (salary > maxSalary) {
      maxSalary = salary;
      maxSalaryPlayer = { player, salary };
    }
  });

  return {
    total,
    starters,
    bench,
    maxSalaryPlayer,
    avgSalary: Math.round((total / plantilla.length) * 10) / 10,
  };
}
