/**
 * Port of EpcbUtils/ManagerUtils.cs
 * Tools for inspecting and binary patching MANAGER.EXE
 */

export const YEAR_OFFSETS: number[] = [
  0x00003f8b, 0x0001efa3, 0x00025e13, 0x00025e93, 0x0002ca61, 0x00038cf3,
  0x000b2aa9, 0x00123cda, 0x00124804, 0x0013d207, 0x0013d2d4, 0x00142783,
  0x00142db4, 0x00145f5c, 0x0014637a, 0x00146b3a, 0x00146deb, 0x0014cca1,
];

export const NEXT_YEAR_OFFSETS: number[] = [
  0x00000475, 0x00000495, 0x000004b5, 0x00003bc7, 0x00003f84, 0x00004107,
  0x0000411d, 0x00004125, 0x00004138, 0x0000414b, 0x0000415e, 0x00004171,
  0x00004184, 0x00004197, 0x000041aa, 0x000041bd, 0x000041d0, 0x000041e3,
  0x000041f6, 0x00004208, 0x00009e65, 0x00009e73, 0x00009ee3, 0x00009f53,
  0x0000e535, 0x0000e543, 0x0001f073, 0x0001f0a3, 0x0001f0d3, 0x0001f103,
  0x0001f145, 0x00025ec3, 0x00025ef3, 0x00025f23, 0x00025f53, 0x0002cb33,
  0x0002cbb3, 0x0002cc03, 0x0002cc65, 0x0002cc85, 0x0002cca5,
];

export interface ManagerPatchResult {
  modifiedBytesCount: number;
  patchesApplied: string[];
}

export function patchStartingYear(
  exeBuffer: Uint8Array,
  startingYear: number
): ManagerPatchResult {
  const patchesApplied: string[] = [];
  let modifiedBytesCount = 0;

  const yearLow = startingYear & 0xff;
  const yearHigh = (startingYear >> 8) & 0xff;

  const nextYear = startingYear + 1;
  const nextLow = nextYear & 0xff;
  const nextHigh = (nextYear >> 8) & 0xff;

  for (const offset of YEAR_OFFSETS) {
    if (offset + 1 < exeBuffer.length) {
      exeBuffer[offset] = yearLow;
      exeBuffer[offset + 1] = yearHigh;
      modifiedBytesCount += 2;
    }
  }
  patchesApplied.push(
    `Temporada inicial modificada a ${startingYear}/${nextYear} (${YEAR_OFFSETS.length} posiciones actualizadas)`
  );

  for (const offset of NEXT_YEAR_OFFSETS) {
    if (offset + 1 < exeBuffer.length) {
      exeBuffer[offset] = nextLow;
      exeBuffer[offset + 1] = nextHigh;
      modifiedBytesCount += 2;
    }
  }
  patchesApplied.push(
    `Año siguiente actualizado a ${nextYear} (${NEXT_YEAR_OFFSETS.length} posiciones actualizadas)`
  );

  return { modifiedBytesCount, patchesApplied };
}

export function patchRemoveAgeRestriction(exeBuffer: Uint8Array): ManagerPatchResult {
  const patchesApplied: string[] = [];
  let modifiedBytesCount = 0;

  // manager.Position = 0x0014A391; write(0x00, 0x00)
  if (0x0014a391 + 1 < exeBuffer.length) {
    exeBuffer[0x0014a391] = 0x00;
    exeBuffer[0x0014a392] = 0x00;
    modifiedBytesCount += 2;
  }

  // manager.Position = 0x0014A399; write(0xFF, 0xFF)
  if (0x0014a399 + 1 < exeBuffer.length) {
    exeBuffer[0x0014a399] = 0xff;
    exeBuffer[0x0014a39a] = 0xff;
    modifiedBytesCount += 2;
  }

  patchesApplied.push(
    "Eliminado 'Efecto 2000' (límite de edad retirado en offsets 0x0014A391 y 0x0014A399)"
  );

  return { modifiedBytesCount, patchesApplied };
}

export function readTournamentTeams(
  exeBuffer: Uint8Array
): { euroliga: number[]; eurocup: number[] } {
  const view = new DataView(exeBuffer.buffer, exeBuffer.byteOffset, exeBuffer.byteLength);
  const euroliga: number[] = [];
  const eurocup: number[] = [];

  // Euroliga: 24 teams at 0x002397A8
  if (0x002397a8 + 48 <= exeBuffer.length) {
    for (let i = 0; i < 24; i++) {
      euroliga.push(view.getInt16(0x002397a8 + i * 2, true));
    }
  }

  // Eurocup: 48 teams at 0x002394D8
  if (0x002394d8 + 96 <= exeBuffer.length) {
    for (let i = 0; i < 48; i++) {
      eurocup.push(view.getInt16(0x002394d8 + i * 2, true));
    }
  }

  return { euroliga, eurocup };
}
