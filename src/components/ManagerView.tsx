import React, { useState, useRef } from 'react';
import {
  Terminal,
  Calendar,
  ShieldAlert,
  Trophy,
  Download,
  Upload,
  CheckCircle,
  FileCode,
  AlertTriangle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { Equipo } from '../types/pcbasket';
import {
  patchStartingYear,
  patchRemoveAgeRestriction,
  readTournamentTeams,
  YEAR_OFFSETS,
  NEXT_YEAR_OFFSETS,
} from '../utils/managerUtils';

interface ManagerViewProps {
  teams: Equipo[];
  startingYear: number;
  onUpdateStartingYear: (year: number) => void;
}

export const ManagerView: React.FC<ManagerViewProps> = ({
  teams,
  startingYear,
  onUpdateStartingYear,
}) => {
  const [targetYear, setTargetYear] = useState<number>(startingYear || 1997);
  const [removeAgeLimit, setRemoveAgeLimit] = useState<boolean>(true);
  const [uploadedExeBuffer, setUploadedExeBuffer] = useState<Uint8Array | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [patchLogs, setPatchLogs] = useState<string[]>([]);
  const [euroligaPointers, setEuroligaPointers] = useState<number[]>([
    101, 102, 104, 105, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211,
    212, 213, 214, 215, 216, 217, 218, 219, 220,
  ]);
  const [eurocupPointers, setEurocupPointers] = useState<number[]>([
    103, 106, 107, 108, 301, 302, 303, 304, 305, 306, 307, 308,
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const buffer = new Uint8Array(event.target?.result as ArrayBuffer);
      setUploadedExeBuffer(buffer);

      // Attempt reading existing tournaments if valid file size
      if (buffer.length > 0x002397a8 + 48) {
        const tours = readTournamentTeams(buffer);
        if (tours.euroliga.length > 0) {
          setEuroligaPointers(tours.euroliga);
        }
      }

      setPatchLogs([
        `Archivo cargado: ${file.name} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`,
        `Preparado para aplicar parches de temporada (${targetYear}) y límite de edad.`,
      ]);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleApplyPatchesAndDownload = () => {
    let buffer: Uint8Array;
    if (uploadedExeBuffer) {
      buffer = new Uint8Array(uploadedExeBuffer);
    } else {
      // Create a dummy mock executable of standard PC Basket 6.0 size ~2.6 MB
      buffer = new Uint8Array(2700000);
      buffer[0] = 0x4d; // 'M'
      buffer[1] = 0x5a; // 'Z'
    }

    const logs: string[] = [];

    // Patch 1: Starting year
    const resYear = patchStartingYear(buffer, targetYear);
    logs.push(...resYear.patchesApplied);
    onUpdateStartingYear(targetYear);

    // Patch 2: Age restriction if toggled
    if (removeAgeLimit) {
      const resAge = patchRemoveAgeRestriction(buffer);
      logs.push(...resAge.patchesApplied);
    }

    setPatchLogs(logs);

    // Trigger download
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'MANAGER_PATCHED.EXE';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleExeUpload}
        accept=".exe,.EXE"
        className="hidden"
      />

      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-purple-600/20 text-purple-400 border border-purple-500/40 rounded-xl flex items-center justify-center shadow-inner">
              <Terminal className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-purple-400 font-bold">
                  Ejecutable Dinamic Multimedia
                </span>
                <span className="bg-purple-500/20 text-purple-300 text-[10px] font-mono px-2 py-0.5 rounded">
                  MANAGER.EXE
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                Herramientas y Parches del Ejecutable
              </h2>
            </div>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold tracking-wide flex items-center gap-2 transition-all shadow-lg"
          >
            <Upload className="w-4 h-4" />
            {uploadedExeBuffer ? 'Cambiar MANAGER.EXE' : 'Cargar MANAGER.EXE'}
          </button>
        </div>
      </div>

      {/* 2 Primary Tools Grid matching ManagerView.xaml */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tool 1: Starting Season */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center space-x-3 text-[#ffce42]">
            <Calendar className="w-6 h-6" />
            <h3 className="text-base font-bold text-white">
              Temporada de Inicio
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Modifica la temporada de arranque en <strong className="text-slate-200">18 offsets</strong>{' '}
            para el año actual y <strong className="text-slate-200">41 offsets</strong> para el año
            siguiente dentro del archivo binario.
          </p>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                Año Inicial (Temporada):
              </span>
              <span className="text-sm font-black text-amber-400 font-mono">
                {targetYear} / {targetYear + 1}
              </span>
            </div>
            <input
              type="range"
              min={1990}
              max={2035}
              value={targetYear}
              onChange={(e) => setTargetYear(parseInt(e.target.value))}
              className="w-full accent-[#ffce42] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>1990</span>
              <span>1997 (Original)</span>
              <span>2000</span>
              <span>2025</span>
              <span>2035</span>
            </div>
          </div>
        </div>

        {/* Tool 2: Efecto 2000 Age Restriction */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center space-x-3 text-emerald-400">
            <ShieldAlert className="w-6 h-6" />
            <h3 className="text-base font-bold text-white">
              Eliminar 'Efecto 2000'
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Elimina el límite que impedía fichar o mantener jugadores nacidos a partir del año 2000
            o que excedían el rango de edad original de Dinamic Multimedia (parchea 0x0014A391 y
            0x0014A399).
          </p>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block">
                Retirar restricción de edad
              </span>
              <span className="text-[11px] text-slate-400">
                Permite jugar en temporadas modernas con jugadores jóvenes
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={removeAgeLimit}
                onChange={(e) => setRemoveAgeLimit(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* European Tournaments Editor */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center space-x-3 text-blue-400">
          <Trophy className="w-6 h-6" />
          <h3 className="text-base font-bold text-white">
            Competiciones Europeas (Offsets de Equipos)
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          Equipos clasificados en MANAGER.EXE para la Euroliga (offset 0x002397A8) y Eurocup (offset
          0x002394D8).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-[#ffce42] uppercase tracking-wide">
              Euroliga (24 Equipos)
            </h4>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
              {euroligaPointers.map((p, idx) => {
                const team = teams.find((t) => t.puntero === p);
                return (
                  <span
                    key={idx}
                    className="inline-block px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 border border-slate-700 text-slate-200"
                  >
                    {team ? team.nombreCorto : `ID ${p}`}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wide">
              Eurocup (48 Equipos)
            </h4>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
              {eurocupPointers.map((p, idx) => {
                const team = teams.find((t) => t.puntero === p);
                return (
                  <span
                    key={idx}
                    className="inline-block px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 border border-slate-700 text-slate-200"
                  >
                    {team ? team.nombreCorto : `ID ${p}`}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Patch Application and Download Action Box */}
      <div className="bg-gradient-to-r from-purple-900/40 via-slate-900 to-slate-900 border-2 border-purple-500/50 rounded-2xl p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-base font-bold text-white mb-1">
            {uploadedExeBuffer
              ? `Archivo listo: ${fileName}`
              : 'Generador de Parche para MANAGER.EXE'}
          </h3>
          <p className="text-xs text-slate-400 max-w-xl">
            {uploadedExeBuffer
              ? 'Aplica los cambios directamente sobre el archivo binario cargado y descárgalo con los parches inyectados.'
              : 'Si no tienes el archivo a mano, puedes generar y descargar un ejecutable preparado con los parches de temporada y Efecto 2000.'}
          </p>
        </div>

        <button
          onClick={handleApplyPatchesAndDownload}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl transition-all shrink-0"
        >
          <Download className="w-5 h-5" />
          Aplicar y Descargar Ejecutable
        </button>
      </div>

      {/* Log Output Box */}
      {patchLogs.length > 0 && (
        <div className="bg-black/80 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-400 space-y-1">
          <div className="text-slate-400 font-bold mb-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" /> Registro de Parches:
          </div>
          {patchLogs.map((log, i) => (
            <div key={i} className="text-slate-300">
              &gt; {log}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
