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
  const reader = new ByteReader(buffer);

  // Skip header: "Copyright (c)1997 Dinamic Multimedia" (36 bytes) + 6 bytes = 42 bytes
  reader.skip(42);

  const nombreCorto = reader.readDinamicField();
  const pabellon = reader.readDinamicField();
  const bytePais = reader.readByte();
  const aforo = reader.readInt16();
  reader.skip(2);
  const nombreLargo = reader.readDinamicField();

  reader.skip(4);
  reader.readDinamicField(); // C. Social
  reader.skip(6); // Fundación + 4B
  reader.readDinamicField(); // Presidente
  const presupuesto = reader.readInt16();

  reader.skip(6);
  reader.readDinamicField(); // Patrocinador
  reader.readDinamicField(); // Equipador
  reader.skip(17); // 2B + estadísticas
  reader.skip(245); // Tactics block

  reader.skip(2); // Coach id
  const entrenador = reader.readDinamicField();
  reader.readDinamicField(); // Coach long name
  reader.skip(15); // Coach stats
  reader.skip(2); // 2nd coach id
  reader.readDinamicField();
  reader.readDinamicField();
  reader.skip(14); // 2nd coach stats

  const plantilla: Jugador[] = [];
  let currentYear = new Date().getFullYear();

  while (reader.pos + 30 < buffer.byteLength) {
    const control = reader.readByte();
    if (control !== 1) break;

    const punteroJug = reader.readInt16();
    const dorsal = reader.readByte();
    const jNombreCorto = reader.readDinamicField();
    const jNombreLargo = reader.readDinamicField();

    reader.skip(2); // orden plantilla
    const demarcacion = (reader.readByte() - 1) as Demarcacion;
    reader.skip(8); // tácticas ataque
    const jPais = reader.readByte();
    const colorPiel = reader.readByte() > 0;
    reader.skip(6);
    const anoNac = reader.readInt16();
    const altura = reader.readByte();
    const peso = reader.readByte();

    // Procedencia skip
    reader.skip(1);
    reader.readDinamicField();
    reader.readDinamicField();
    reader.skip(149); // dump string

    const medias: Medias = {
      velocidad: reader.readByte(),
      resistencia: reader.readByte(),
      agresividad: reader.readByte(),
      salto: reader.readByte(),
      oculto: reader.readByte(),
      defensa: reader.readByte(),
      tiro2: reader.readByte(),
      tiro3: reader.readByte(),
      tiroL: reader.readByte(),
      rebotes: reader.readByte(),
      asistencias: reader.readByte(),
    };

    plantilla.push({
      jugadorId: punteroJug,
      puntero: punteroJug,
      dorsal,
      nombreCorto: jNombreCorto,
      nombreLargo: jNombreLargo,
      nacionalidad: jPais || 22,
      demarcacion: demarcacion >= 0 && demarcacion <= 4 ? demarcacion : 2,
      anoNacimiento: anoNac > 1900 && anoNac < 2050 ? anoNac : currentYear - 24,
      colorPiel,
      altura: altura || 195,
      peso: peso || 90,
      medias,
      equipoPuntero: defaultPuntero,
    });
  }

  return {
    equipoId: defaultPuntero,
    puntero: defaultPuntero,
    nombreCorto: nombreCorto || "EQUIPO",
    nombreLargo: nombreLargo || "EQUIPO DE BALONCESTO",
    pabellon: pabellon || "Pabellón Municipal",
    aforo: aforo > 0 ? aforo : 3500,
    presupuesto: presupuesto > 0 ? presupuesto : 500,
    entrenador: entrenador || "Entrenador",
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
