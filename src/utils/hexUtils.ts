import { Equipo, Jugador, Demarcacion, Medias } from '../types/pcbasket';
import { DinamicEncoding } from './dinamicEncoding';
import { PAISES } from './paises';

const TACTICAS: Record<number, string[]> = {
  0: [
    "bbdeceag", "bbdedd'd", "bcad'bdd", "cedbdgcg", "bbdecd'b", "bb'deggd", "ebde'd'b", "ebddbe'e",
    "'deddegg", "dedgbe'd", "bbddce'g", "bbbedegg", "ebddceag", "be'daggd", "ebdegdgg", "bbdegg'd",
    "cdbbdeae", "cbdbgd'd", "bbad'eeb", "ce'deedd", "bb'edbdg", "bbdedgag", "bbbededd", "bbdbgdbe"
  ],
  1: [
    "dbaeagcg", "degg'gce", "bbce'ddd", "'dcedegg", "deggce'e", "dedgceag", "ebgd'dae", "ebdedg'd",
    "dbcbadgg", "eeddcdag", "ceegdbad", "cgbceegd", "cb'ebede", "ceagebge"
  ],
  2: [
    "ebdeegad", "deggcg'e", "'degbbdd", "'dbedgdb", "db'ecggd", "deggce'g", "ebdegg'b", "'ecgegbb",
    "dedgag'd", "ceag'geg", "'e'gegde", "deceageg", "dbgd'eag", "'eagegge", "bgeecbae", "ce'gggdd",
    "ad'gce'b", "edbebgcg", "ce'dagbb", "eedgcgcb"
  ],
  3: [
    "cgbdbeed", "ceeeegcg", "'dbdegcg", "cdbedeeg", "cdegbeeb", "eeeg'dbd", "cbadggee", "eecdegbb",
    "cdeeegbe", "egcgbd'd", "bdbgeece", "edcdbgbe", "egcdbbdb", "eeddegce", "edbgbece", "cdbeedeg", "ceeebdgd"
  ],
  4: [
    "cebgegde", "egbgedcd", "bgbdcgeg", "cgegbeee", "egbdcdcg", "bdcgeged", "cdbgbdeg", "bgedcgbd",
    "cdcgbged", "cgbdegeb", "cgbeegeb", "cgedegcb", "cgbeed'e", "cgbdbgeg", "edbdbgeg", "bgcgbded",
    "edbgcdcg", "bdcdcgeg", "bgeecged", "bgegbdcg", "bdbgegcd", "bgcdegbe", "bgbeceed"
  ]
};

function getRandomTactica(pos: number): Uint8Array {
  const list = TACTICAS[pos] || TACTICAS[0];
  const item = list[Math.floor(Math.random() * list.length)] || "bbdeceag";
  return DinamicEncoding.getBytes(item.slice(0, 8));
}

class ByteWriter {
  private buffer: Uint8Array;
  public pos: number = 0;

  constructor(size: number = 51200) {
    this.buffer = new Uint8Array(size);
  }

  writeByte(val: number) {
    this.buffer[this.pos++] = val & 0xff;
  }

  writeBytes(bytes: Uint8Array | number[]) {
    for (let i = 0; i < bytes.length; i++) {
      this.buffer[this.pos++] = bytes[i] & 0xff;
    }
  }

  writeInt16(val: number) {
    this.buffer[this.pos++] = val & 0xff;
    this.buffer[this.pos++] = (val >> 8) & 0xff;
  }

  writeStringUtf8(str: string) {
    for (let i = 0; i < str.length; i++) {
      this.buffer[this.pos++] = str.charCodeAt(i) & 0xff;
    }
  }

  writeDinamicField(str: string) {
    const bytes = DinamicEncoding.getBytes(str);
    this.writeByte(bytes.length);
    this.writeByte(0);
    this.writeBytes(bytes);
  }

  addDummyField() {
    this.writeDinamicField("ACBLive");
  }

  padZeros(count: number) {
    for (let i = 0; i < count; i++) {
      this.buffer[this.pos++] = 0;
    }
  }

  getBuffer(): Uint8Array {
    return this.buffer;
  }
}

class ByteReader {
  private view: DataView;
  private u8: Uint8Array;
  public pos: number = 0;

  constructor(buffer: ArrayBuffer) {
    this.view = new DataView(buffer);
    this.u8 = new Uint8Array(buffer);
  }

  readByte(): number {
    return this.u8[this.pos++];
  }

  readInt16(): number {
    const val = this.view.getInt16(this.pos, true);
    this.pos += 2;
    return val;
  }

  readBytes(count: number): Uint8Array {
    const slice = this.u8.subarray(this.pos, this.pos + count);
    this.pos += count;
    return slice;
  }

  skip(count: number) {
    this.pos += count;
  }

  readDinamicField(): string {
    const len = this.readByte();
    this.readByte(); // 0
    const bytes = this.readBytes(len);
    return DinamicEncoding.getString(bytes);
  }

  hasMore(): boolean {
    return this.pos < this.u8.length;
  }
}

export function readEquipoBytes(buffer: ArrayBuffer, defaultPuntero: number = 101): Equipo {
  const u8 = new Uint8Array(buffer);
  const view = new DataView(buffer);

  // 1. Locate start of Team Data (skip Dinamic Copyright if present)
  let startOffset = 0;
  let asciiHead = '';
  for (let i = 0; i < Math.min(80, u8.length); i++) {
    asciiHead += String.fromCharCode(u8[i]);
  }

  if (asciiHead.includes('Dinamic Multimedia')) {
    const idx = asciiHead.indexOf('Dinamic Multimedia') + 'Dinamic Multimedia'.length;
    startOffset = idx + 6;
  } else if (u8.length >= 42 && (asciiHead.startsWith('Copyright') || u8[0] === 0x43)) {
    startOffset = 42;
  }

  // Scan first 64 bytes for a valid Dinamic string length if needed
  if (startOffset > u8.length - 100 || (u8[startOffset] === 0 && u8[startOffset + 1] === 0)) {
    for (let i = 0; i < Math.min(64, u8.length - 20); i++) {
      const len = u8[i] | (u8[i + 1] << 8);
      if (len >= 3 && len <= 20) {
        const testStr = DinamicEncoding.getString(u8.subarray(i + 2, i + 2 + len));
        if (/^[A-Z0-9ÁÉÍÓÚÑ -]{3,}$/i.test(testStr)) {
          startOffset = i;
          break;
        }
      }
    }
  }

  let pos = startOffset;

  const readDinField = (): string => {
    if (pos + 2 > u8.length) return '';
    const len = u8[pos] | (u8[pos + 1] << 8);
    pos += 2;
    if (len <= 0 || len > 200 || pos + len > u8.length) {
      return '';
    }
    const strBytes = u8.subarray(pos, pos + len);
    pos += len;
    return DinamicEncoding.getString(strBytes);
  };

  const nombreCorto = readDinField();
  const pabellon = readDinField();
  const bytePais = pos < u8.length ? u8[pos++] : 22;
  const aforo = pos + 2 <= u8.length ? view.getInt16(pos, true) : 3500;
  pos += 2;
  pos += 2; // skip 2 bytes
  const nombreLargo = readDinField();

  pos += 4; // skip 4 bytes
  readDinField(); // C. Social
  pos += 6; // Fundación (2B) + 4B = 6B
  readDinField(); // Presidente
  const presupuesto = pos + 2 <= u8.length ? view.getInt16(pos, true) : 500;
  pos += 2;

  pos += 6;
  readDinField(); // Patrocinador
  readDinField(); // Equipador
  pos += 17; // 2B + estadísticas (15B)
  pos += 243; // Tactics block (14B) + Relleno (229B)

  // Coach 1 ID
  let coach1Id = 0;
  if (pos + 2 <= u8.length) {
    coach1Id = view.getInt16(pos, true);
    pos += 2;
  }

  let detectedPuntero = defaultPuntero;
  if (defaultPuntero === 101 && coach1Id > 0 && coach1Id < 30000) {
    const calcPuntero = Math.floor((coach1Id + 1) / 2);
    if (calcPuntero > 0 && calcPuntero < 9999) {
      detectedPuntero = calcPuntero;
    }
  }

  const entrenador = readDinField();

  // 2. Scan entire DBC file for genuine Player records
  // This guarantees finding all players even if coach data or statistics blocks vary.
  interface PlayerCandidate {
    offset: number;
    puntero: number;
    dorsal: number;
    nombreCorto: string;
    nombreLargo: string;
    afterNamesOffset: number;
  }

  const candidates: PlayerCandidate[] = [];
  const searchStart = Math.max(40, startOffset + 50);

  for (let i = searchStart; i < u8.length - 80; i++) {
    if (u8[i] === 1) { // Player record control byte = 0x01
      const pId = u8[i + 1] | (u8[i + 2] << 8);
      const dorsal = u8[i + 3];
      const shortLen = u8[i + 4] | (u8[i + 5] << 8);

      if (dorsal <= 99 && shortLen >= 1 && shortLen <= 32 && pId >= 0) {
        const shortNameBytes = u8.subarray(i + 6, i + 6 + shortLen);
        const sName = DinamicEncoding.getString(shortNameBytes);

        if (sName.trim().length >= 1 && !/[\x00-\x1F\x7F=<>]/.test(sName)) {
          const longLenOffset = i + 6 + shortLen;
          if (longLenOffset + 2 < u8.length) {
            const longLen = u8[longLenOffset] | (u8[longLenOffset + 1] << 8);
            if (longLen >= 1 && longLen <= 50) {
              const longNameBytes = u8.subarray(longLenOffset + 2, longLenOffset + 2 + longLen);
              const lName = DinamicEncoding.getString(longNameBytes);

              if (lName.trim().length >= 1 && !/[\x00-\x1F\x7F=<>]/.test(lName)) {
                candidates.push({
                  offset: i,
                  puntero: pId,
                  dorsal,
                  nombreCorto: sName.trim(),
                  nombreLargo: lName.trim(),
                  afterNamesOffset: longLenOffset + 2 + longLen,
                });
                i += 6 + shortLen + 2 + longLen;
              }
            }
          }
        }
      }
    }
  }

  const plantilla: Jugador[] = [];
  const currentYear = new Date().getFullYear();

  for (let cIdx = 0; cIdx < candidates.length; cIdx++) {
    const cand = candidates[cIdx];
    const nextOffset = cIdx + 1 < candidates.length ? candidates[cIdx + 1].offset : u8.length;
    let pPos = cand.afterNamesOffset;

    pPos += 2; // posPlantilla (1B) + 0 (1B)

    // Demarcacion
    const rawDemarcacion = pPos < u8.length ? u8[pPos++] - 1 : 2;
    const demarcacion = (rawDemarcacion >= 0 && rawDemarcacion <= 4 ? rawDemarcacion : 2) as Demarcacion;

    pPos += 8; // Tácticas ataque (8B)

    const jPais = pPos < u8.length ? u8[pPos++] : 22;
    const colorPiel = pPos < u8.length ? u8[pPos++] > 0 : false;

    pPos += 6; // Hair/beard (2B) + 0 (1B) + pos bis (1B) + birth day/month (2B)

    let anoNac = pPos + 2 <= u8.length ? view.getInt16(pPos, true) : currentYear - 24;
    pPos += 2;
    if (anoNac < 100 && anoNac > 0) {
      anoNac += 1900;
    } else if (anoNac <= 1940 || anoNac > 2030) {
      anoNac = currentYear - 24;
    }

    const alturaRaw = pPos < u8.length ? u8[pPos++] : 198;
    const pesoRaw = pPos < u8.length ? u8[pPos++] : 95;
    const altura = alturaRaw >= 150 && alturaRaw <= 240 ? alturaRaw : 198;
    const peso = pesoRaw >= 50 && pesoRaw <= 170 ? pesoRaw : 95;

    // Procedencia skip
    pPos += 1;
    for (let s = 0; s < 2; s++) {
      if (pPos + 2 <= u8.length) {
        const slen = u8[pPos] | (u8[pPos + 1] << 8);
        pPos += 2;
        if (slen > 0 && slen < 100) {
          pPos += slen;
        }
      }
    }

    // Extract 11 Medias
    let foundMedias: Medias | null = null;
    const testStandardDumpOffset = pPos + 149;
    if (testStandardDumpOffset + 11 <= nextOffset) {
      const b = u8.subarray(testStandardDumpOffset, testStandardDumpOffset + 11);
      const allValid = Array.from(b).every((val) => val >= 10 && val <= 99);
      if (allValid) {
        foundMedias = {
          velocidad: b[0],
          resistencia: b[1],
          agresividad: b[2],
          salto: b[3],
          oculto: b[4],
          defensa: b[5],
          tiro2: b[6],
          tiro3: b[7],
          tiroL: b[8],
          rebotes: b[9],
          asistencias: b[10],
        };
      }
    }

    if (!foundMedias) {
      const searchEnd = Math.min(nextOffset, pPos + 200);
      for (let s = searchEnd - 11; s >= pPos + 20; s--) {
        const b = u8.subarray(s, s + 11);
        const allValid = Array.from(b).every((val) => val >= 10 && val <= 99);
        if (allValid) {
          foundMedias = {
            velocidad: b[0],
            resistencia: b[1],
            agresividad: b[2],
            salto: b[3],
            oculto: b[4],
            defensa: b[5],
            tiro2: b[6],
            tiro3: b[7],
            tiroL: b[8],
            rebotes: b[9],
            asistencias: b[10],
          };
          break;
        }
      }
    }

    const medias: Medias = foundMedias || {
      velocidad: demarcacion === 0 ? 80 : 70,
      resistencia: 75,
      agresividad: 70,
      salto: demarcacion >= 3 ? 80 : 72,
      oculto: 75,
      defensa: 72,
      tiro2: 74,
      tiro3: demarcacion <= 2 ? 76 : 50,
      tiroL: 75,
      rebotes: demarcacion >= 3 ? 82 : 62,
      asistencias: demarcacion === 0 ? 84 : 65,
    };

    plantilla.push({
      jugadorId: cand.puntero || plantilla.length + 1,
      puntero: cand.puntero || plantilla.length + 1,
      dorsal: cand.dorsal || plantilla.length + 4,
      nombreCorto: cand.nombreCorto || `JUGADOR ${plantilla.length + 1}`,
      nombreLargo: cand.nombreLargo || cand.nombreCorto || `Jugador ${plantilla.length + 1}`,
      nacionalidad: jPais || 22,
      demarcacion,
      anoNacimiento: anoNac,
      colorPiel,
      altura,
      peso,
      medias,
      equipoPuntero: detectedPuntero,
    });
  }

  return {
    equipoId: detectedPuntero,
    puntero: detectedPuntero,
    nombreCorto: nombreCorto || `EQ ${detectedPuntero}`,
    nombreLargo: nombreLargo || nombreCorto || `EQUIPO ${detectedPuntero}`,
    pabellon: pabellon || 'Pabellón Municipal',
    aforo: aforo > 0 ? aforo : 3500,
    presupuesto: presupuesto > 0 ? presupuesto : 500,
    entrenador: entrenador || 'Entrenador',
    pais: bytePais || 22,
    plantilla,
  };
}

export function createEquipoDbcBytes(
  equipo: Equipo,
  options: {
    useCotNationality?: boolean;
    useEurNationality?: boolean;
    adjustBirthDates?: boolean;
    startingYear?: number;
  } = {}
): Uint8Array {
  const writer = new ByteWriter(51200);

  // Cabecera: "Copyright (c)1997 Dinamic Multimedia" (36 bytes)
  writer.writeStringUtf8("Copyright (c)1997 Dinamic Multimedia");
  writer.writeBytes([247, 8, 91, 2, 0, 0]);

  // Nombre Corto
  writer.writeDinamicField(equipo.nombreCorto || "EQUIPO");

  // Pabellon
  const pab = equipo.pabellon || `${equipo.nombreCorto} Arena`;
  writer.writeDinamicField(pab);

  // Pais
  writer.writeByte(equipo.pais || 22);

  // Aforo
  writer.writeInt16(equipo.aforo > 0 ? equipo.aforo : 1500);

  // 2 bytes 0
  writer.padZeros(2);

  // Nombre Largo
  writer.writeDinamicField(equipo.nombreLargo || equipo.nombreCorto);

  // 4 bytes 0
  writer.padZeros(4);

  // C. Social
  writer.addDummyField();

  // Año fundación
  writer.writeInt16(1950);

  // 4 bytes 0
  writer.padZeros(4);

  // Presidente
  writer.addDummyField();

  // Presupuesto
  writer.writeInt16(equipo.presupuesto > 0 ? equipo.presupuesto : 350);

  // 6 bytes 0
  writer.padZeros(6);

  // Patrocinador y equipador
  writer.addDummyField();
  writer.addDummyField();

  // 2 bytes 0
  writer.padZeros(2);

  // 15 bytes estadísticas
  writer.padZeros(15);

  // Tácticas (14 bytes)
  writer.writeBytes(DinamicEncoding.getBytes("cbc''''cfbc'''k"));

  // Relleno tácticas
  const relleno =
    "aaaaaaaaaaaaaaaaaaaakaaaaaaaaaaaaaaaaaaaakaaaaaaaaaaaaaaaaaaaakaaaaaaaaaaaaaaaaaaaakaaaaaaaaaaaaaaaaaaaakaaaaaaaaaaaaaaaaaaaakaaaaaaaaaaaaaaaaaaaakaaaaaaaaaaaaaaaaaaaa(b.dBaK'.a.'Ka=a=cSbõaÜavbóa#'-aè'/a4ahaj'JahbÔañ{=dCafaô')ac";
  writer.writeBytes(DinamicEncoding.getBytes(relleno));

  // Entrenador
  const entrenadorName = equipo.entrenador || "Naismith";
  writer.writeInt16(equipo.puntero * 2 - 1);
  writer.writeDinamicField(entrenadorName);
  writer.writeDinamicField(entrenadorName);

  // Estadísticas entrenador
  writer.writeBytes(DinamicEncoding.getBytes("'ax'axaa'ax'ax"));
  writer.writeBytes(DinamicEncoding.getBytes("c"));

  // 2º Entrenador
  writer.writeInt16(equipo.puntero * 2);
  writer.addDummyField();
  writer.addDummyField();
  writer.writeBytes(DinamicEncoding.getBytes("'ax'axaa'ax'ax"));

  // Plantilla
  const currentYear = new Date().getFullYear();
  const baseYear = options.startingYear || 1997;
  const difAnnos = currentYear - baseYear;

  let posPlantilla = 1;
  for (const jug of equipo.plantilla) {
    writer.writeByte(1); // Control byte
    writer.writeInt16(jug.puntero || posPlantilla);
    writer.writeByte(jug.dorsal || posPlantilla);

    writer.writeDinamicField(jug.nombreCorto || "JUGADOR");
    writer.writeDinamicField(jug.nombreLargo || jug.nombreCorto || "JUGADOR");

    writer.writeByte(posPlantilla);
    writer.writeByte(0);

    writer.writeByte((jug.demarcacion ?? 2) + 1);

    // Tácticas de ataque
    writer.writeBytes(getRandomTactica(jug.demarcacion ?? 2));

    // Nacionalidad con reglas Cotonou/Comunitario
    let nacByte = jug.nacionalidad || 22;
    const country = PAISES[nacByte];
    if (options.useCotNationality && country?.cotonou) {
      nacByte = 32; // Irlanda del Norte (as per HexUtils.cs)
    } else if (options.useEurNationality && country?.comunitario) {
      nacByte = 38; // Luxemburgo (as per HexUtils.cs)
    }
    writer.writeByte(nacByte);

    // Color de piel
    writer.writeByte(jug.colorPiel ? 1 : 0);

    // Color pelo + barba
    writer.writeByte(1);
    writer.writeByte(0);

    // 0
    writer.writeByte(0);

    // Posición bis
    writer.writeByte(jug.demarcacion ?? 2);

    // Fecha de nacimiento: día=1, mes=1, año (ajustado si se especifica)
    writer.writeByte(1);
    writer.writeByte(1);
    const finalBirthYear = options.adjustBirthDates
      ? jug.anoNacimiento - difAnnos
      : jug.anoNacimiento;
    writer.writeInt16(finalBirthYear);

    // Altura y peso
    writer.writeByte(jug.altura || 198);
    writer.writeByte(jug.peso || 95);

    // Procedencia
    writer.writeByte(22);
    writer.addDummyField();
    writer.addDummyField();

    // Dump bytes (149 bytes)
    const dumpString =
      "'aN'ax'ax'ax'ax'ax'axaaaa=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    writer.writeBytes(DinamicEncoding.getBytes(dumpString));

    // 11 Medias
    writer.writeByte(jug.medias.velocidad);
    writer.writeByte(jug.medias.resistencia);
    writer.writeByte(jug.medias.agresividad);
    writer.writeByte(jug.medias.salto);
    writer.writeByte(jug.medias.oculto);
    writer.writeByte(jug.medias.defensa);
    writer.writeByte(jug.medias.tiro2);
    writer.writeByte(jug.medias.tiro3);
    writer.writeByte(jug.medias.tiroL);
    writer.writeByte(jug.medias.rebotes);
    writer.writeByte(jug.medias.asistencias);

    posPlantilla++;
  }

  // Padding to exactly 51,200 bytes (0xC800 bytes)
  while (writer.pos < 51200) {
    writer.writeByte(0);
  }

  return writer.getBuffer();
}

export function downloadDbcFile(equipo: Equipo, options?: Parameters<typeof createEquipoDbcBytes>[1]) {
  const bytes = createEquipoDbcBytes(equipo, options);
  const blob = new Blob([bytes], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const punteroStr = String(equipo.puntero).padStart(4, '0');
  a.href = url;
  a.download = `EQBA${punteroStr}.DBC`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
