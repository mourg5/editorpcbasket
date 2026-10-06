import React, { useState } from 'react';
import {
  X,
  Globe,
  Sparkles,
  Download,
  CheckCircle2,
  Trophy,
  Loader2,
} from 'lucide-react';
import { Equipo, Jugador, Demarcacion, Medias } from '../types/pcbasket';
import { generatePlayerRating } from '../utils/ratingsUtils';

interface ProballersImportModalProps {
  onClose: () => void;
  onImportTeam: (team: Equipo) => void;
  nextTeamPointer: number;
}

interface TeamPreset {
  name: string;
  fullName: string;
  pabellon: string;
  aforo: number;
  presupuesto: number;
  entrenador: string;
  pais: number;
  desiredRating: number;
  players: {
    nombreCorto: string;
    nombreLargo: string;
    pos: Demarcacion;
    pais: number;
    altura: number;
    peso: number;
    anoNac: number;
    dorsal: number;
    colorPiel: boolean;
  }[];
}

const PRESETS: TeamPreset[] = [
  {
    name: 'PANATHINAIKOS',
    fullName: 'PANATHINAIKOS AKTOR ATHENS',
    pabellon: 'OAKA Altion',
    aforo: 18500,
    presupuesto: 2200,
    entrenador: 'Ergin Ataman',
    pais: 26, // Grecia
    desiredRating: 88,
    players: [
      { nombreCorto: 'SLOUKAS', nombreLargo: 'Kostas SLOUKAS', pos: 0, pais: 26, altura: 190, peso: 87, anoNac: 1990, dorsal: 10, colorPiel: false },
      { nombreCorto: 'NUNN', nombreLargo: 'Kendrick NUNN', pos: 1, pais: 61, altura: 195, peso: 86, anoNac: 1995, dorsal: 25, colorPiel: true },
      { nombreCorto: 'GRIGONIS', nombreLargo: 'Marius GRIGONIS', pos: 2, pais: 37, altura: 198, peso: 93, anoNac: 1994, dorsal: 40, colorPiel: false },
      { nombreCorto: 'MITOGLOU', nombreLargo: 'Dinos MITOGLOU', pos: 3, pais: 26, altura: 210, peso: 116, anoNac: 1996, dorsal: 44, colorPiel: false },
      { nombreCorto: 'LESSORT', nombreLargo: 'Mathias LESSORT', pos: 4, pais: 24, altura: 206, peso: 112, anoNac: 1995, dorsal: 26, colorPiel: true },
      { nombreCorto: 'GRANT', nombreLargo: 'Jerian GRANT', pos: 0, pais: 61, altura: 196, peso: 93, anoNac: 1992, dorsal: 22, colorPiel: true },
      { nombreCorto: 'HERNANGOMEZ', nombreLargo: 'Juancho HERNANGÓMEZ', pos: 3, pais: 22, altura: 206, peso: 104, anoNac: 1995, dorsal: 41, colorPiel: false },
      { nombreCorto: 'YURTSEVEN', nombreLargo: 'Omer YURTSEVEN', pos: 4, pais: 55, altura: 213, peso: 125, anoNac: 1998, dorsal: 77, colorPiel: false },
      { nombreCorto: 'OSMAN', nombreLargo: 'Cedi OSMAN', pos: 2, pais: 55, altura: 201, peso: 104, anoNac: 1995, dorsal: 16, colorPiel: false },
      { nombreCorto: 'PAPAPETROU', nombreLargo: 'Ioannis PAPAPETROU', pos: 2, pais: 26, altura: 206, peso: 105, anoNac: 1994, dorsal: 33, colorPiel: false },
    ],
  },
  {
    name: 'OLYMPIACOS',
    fullName: 'OLYMPIACOS PIRAEUS BC',
    pabellon: 'Peace and Friendship Stadium',
    aforo: 12000,
    presupuesto: 2100,
    entrenador: 'Georgios Bartzokas',
    pais: 26, // Grecia
    desiredRating: 87,
    players: [
      { nombreCorto: 'WALKUP', nombreLargo: 'Thomas WALKUP', pos: 0, pais: 26, altura: 193, peso: 92, anoNac: 1992, dorsal: 0, colorPiel: false },
      { nombreCorto: 'FOURNIER', nombreLargo: 'Evan FOURNIER', pos: 1, pais: 24, altura: 198, peso: 93, anoNac: 1992, dorsal: 94, colorPiel: false },
      { nombreCorto: 'PAPANIKOLAOU', nombreLargo: 'Kostas PAPANIKOLAOU', pos: 2, pais: 26, altura: 204, peso: 104, anoNac: 1990, dorsal: 16, colorPiel: false },
      { nombreCorto: 'VEZENKOV', nombreLargo: 'Sasha VEZENKOV', pos: 3, pais: 11, altura: 206, peso: 102, anoNac: 1995, dorsal: 14, colorPiel: false },
      { nombreCorto: 'FALL', nombreLargo: 'Moustapha FALL', pos: 4, pais: 24, altura: 218, peso: 124, anoNac: 1992, dorsal: 10, colorPiel: true },
      { nombreCorto: 'WILLIAMS-GOSS', nombreLargo: 'Nigel WILLIAMS-GOSS', pos: 0, pais: 61, altura: 191, peso: 86, anoNac: 1994, dorsal: 3, colorPiel: true },
      { nombreCorto: 'MILUTINOV', nombreLargo: 'Nikola MILUTINOV', pos: 4, pais: 58, altura: 213, peso: 116, anoNac: 1994, dorsal: 11, colorPiel: false },
      { nombreCorto: 'PETRUSEV', nombreLargo: 'Filip PETRUSEV', pos: 3, pais: 58, altura: 211, peso: 107, anoNac: 2000, dorsal: 33, colorPiel: false },
      { nombreCorto: 'PETERS', nombreLargo: 'Alec PETERS', pos: 3, pais: 61, altura: 206, peso: 107, anoNac: 1995, dorsal: 25, colorPiel: false },
      { nombreCorto: 'MCKISSIC', nombreLargo: 'Shaquielle MCKISSIC', pos: 2, pais: 61, altura: 196, peso: 96, anoNac: 1990, dorsal: 77, colorPiel: true },
    ],
  },
  {
    name: 'CELTICS',
    fullName: 'BOSTON CELTICS',
    pabellon: 'TD Garden',
    aforo: 19156,
    presupuesto: 3500,
    entrenador: 'Joe Mazzulla',
    pais: 61, // USA
    desiredRating: 92,
    players: [
      { nombreCorto: 'HOLIDAY', nombreLargo: 'Jrue HOLIDAY', pos: 0, pais: 61, altura: 193, peso: 93, anoNac: 1990, dorsal: 4, colorPiel: true },
      { nombreCorto: 'WHITE', nombreLargo: 'Derrick WHITE', pos: 1, pais: 61, altura: 193, peso: 86, anoNac: 1994, dorsal: 9, colorPiel: false },
      { nombreCorto: 'BROWN', nombreLargo: 'Jaylen BROWN', pos: 2, pais: 61, altura: 198, peso: 101, anoNac: 1996, dorsal: 7, colorPiel: true },
      { nombreCorto: 'TATUM', nombreLargo: 'Jayson TATUM', pos: 3, pais: 61, altura: 203, peso: 95, anoNac: 1998, dorsal: 0, colorPiel: true },
      { nombreCorto: 'PORZINGIS', nombreLargo: 'Kristaps PORZINGIS', pos: 4, pais: 112, altura: 218, peso: 109, anoNac: 1995, dorsal: 8, colorPiel: false },
      { nombreCorto: 'HORFORD', nombreLargo: 'Al HORFORD', pos: 4, pais: 146, altura: 206, peso: 109, anoNac: 1986, dorsal: 42, colorPiel: true },
      { nombreCorto: 'PRITCHARD', nombreLargo: 'Payton PRITCHARD', pos: 0, pais: 61, altura: 185, peso: 88, anoNac: 1998, dorsal: 11, colorPiel: false },
      { nombreCorto: 'HAUSER', nombreLargo: 'Sam HAUSER', pos: 2, pais: 61, altura: 201, peso: 98, anoNac: 1997, dorsal: 30, colorPiel: false },
      { nombreCorto: 'KORNET', nombreLargo: 'Luke KORNET', pos: 4, pais: 61, altura: 216, peso: 113, anoNac: 1995, dorsal: 40, colorPiel: false },
      { nombreCorto: 'TILLMAN', nombreLargo: 'Xavier TILLMAN', pos: 3, pais: 61, altura: 201, peso: 111, anoNac: 1999, dorsal: 26, colorPiel: true },
    ],
  },
];

export const ProballersImportModal: React.FC<ProballersImportModalProps> = ({
  onClose,
  onImportTeam,
  nextTeamPointer,
}) => {
  const [url, setUrl] = useState(
    'https://www.proballers.com/basketball/team/123/panathinaikos'
  );
  const [teamPointer, setTeamPointer] = useState<number>(nextTeamPointer);
  const [playerPointer, setPlayerPointer] = useState<number>(nextTeamPointer * 10 + 1);
  const [desiredRating, setDesiredRating] = useState<number>(85);
  const [generateRatings, setGenerateRatings] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);

  const handleApplyPreset = (index: number) => {
    setSelectedPresetIndex(index);
    const p = PRESETS[index];
    setUrl(`https://www.proballers.com/basketball/team/${index + 100}/${p.name.toLowerCase()}`);
    setDesiredRating(p.desiredRating);
  };

  const handleExecuteImport = () => {
    setIsLoading(true);

    setTimeout(() => {
      const preset = PRESETS[selectedPresetIndex] || PRESETS[0];

      let currentJugId = playerPointer;
      const plantilla: Jugador[] = preset.players.map((p, idx) => {
        const medias: Medias = {
          velocidad: 50,
          salto: 50,
          resistencia: 50,
          agresividad: 50,
          oculto: 80,
          defensa: 50,
          tiro2: 50,
          tiro3: 50,
          tiroL: 50,
          rebotes: 50,
          asistencias: 50,
        };

        if (generateRatings) {
          // Add some individual variance based on position in roster
          const playerDesired =
            idx < 5 ? desiredRating + Math.floor(Math.random() * 5) : desiredRating - 3 - Math.floor(Math.random() * 6);
          generatePlayerRating(
            medias,
            {
              isVeloz: idx === 0 || idx === 1,
              isAtletico: idx === 2 || idx === 4,
              isIntimidador: idx === 3 || idx === 4,
              isTirador: idx === 1 || idx === 2,
              isCreador: idx === 0,
              isDefensor: idx === 3 || idx === 4,
            },
            playerDesired,
            p.pos
          );
        }

        const jugador: Jugador = {
          jugadorId: currentJugId,
          puntero: currentJugId,
          dorsal: p.dorsal,
          nombreCorto: p.nombreCorto,
          nombreLargo: p.nombreLargo,
          demarcacion: p.pos,
          anoNacimiento: p.anoNac,
          nacionalidad: p.pais,
          altura: p.altura,
          peso: p.peso,
          colorPiel: p.colorPiel,
          medias,
          equipoPuntero: teamPointer,
        };

        currentJugId++;
        return jugador;
      });

      const newEquipo: Equipo = {
        equipoId: teamPointer,
        puntero: teamPointer,
        nombreCorto: preset.name,
        nombreLargo: preset.fullName,
        pabellon: preset.pabellon,
        aforo: preset.aforo,
        presupuesto: preset.presupuesto,
        entrenador: preset.entrenador,
        pais: preset.pais,
        plantilla,
      };

      setIsLoading(false);
      onImportTeam(newEquipo);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-950 to-slate-900 px-6 py-4 flex items-center justify-between border-b border-emerald-500/30">
          <div className="flex items-center space-x-3">
            <Globe className="w-6 h-6 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Importar Equipo desde Proballers.com
              </h2>
              <p className="text-xs text-emerald-300/80">
                Extracción de plantillas y generador de ratings automáticos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Quick Presets Selector */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-[#ffce42]" />
              Plantillas Rápidas Disponibles:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PRESETS.map((p, idx) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleApplyPreset(idx)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedPresetIndex === idx
                      ? 'bg-emerald-600/20 border-emerald-400 text-white shadow-lg'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-black tracking-wide text-white">
                    {p.name}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                    {p.fullName}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono mt-1 font-bold">
                    Media Q: {p.desiredRating}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields matching WPF Dialog */}
          <div className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                URL del equipo en Proballers:
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.proballers.com/basketball/team/..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Puntero del Equipo (ID):
                </label>
                <input
                  type="number"
                  value={teamPointer}
                  onChange={(e) => setTeamPointer(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-amber-400 font-mono font-bold focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Puntero inicial Jugadores:
                </label>
                <input
                  type="number"
                  value={playerPointer}
                  onChange={(e) => setPlayerPointer(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-emerald-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Ratings Generator Toggle */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={generateRatings}
                  onChange={(e) => setGenerateRatings(e.target.checked)}
                  className="rounded accent-emerald-500"
                />
                <span className="font-semibold text-white">
                  Generar valoraciones y atributos de plantilla automáticamente
                </span>
              </label>

              {generateRatings && (
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">
                      Media objetivo del equipo:
                    </span>
                    <span className="font-mono font-black text-emerald-400 text-sm">
                      {desiredRating}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={95}
                    value={desiredRating}
                    onChange={(e) => setDesiredRating(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-4 flex items-center justify-end space-x-3 border-t border-slate-800 select-none">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleExecuteImport}
            disabled={isLoading}
            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-lg text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Importando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Importar Plantilla
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
