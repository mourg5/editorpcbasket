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
