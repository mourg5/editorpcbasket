import React, { useState, useRef } from 'react';
import {
  Shield,
  Plus,
  Globe,
  Trash2,
  Download,
  Upload,
  Search,
  Edit3,
  FileCode,
  Archive,
  ChevronRight,
} from 'lucide-react';
import { Equipo } from '../types/pcbasket';
import { getCountry } from '../utils/paises';
import { calculateTeamMedias } from '../utils/ratingsUtils';
import { downloadDbcFile, readEquipoBytes, createEquipoDbcBytes } from '../utils/hexUtils';
import JSZip from 'jszip';

interface TeamsViewProps {
  teams: Equipo[];
  onSelectTeam: (team: Equipo) => void;
  onCreateTeam: () => void;
  onDeleteTeam: (puntero: number) => void;
  onOpenImportModal: () => void;
  onTeamImportedFromDbc: (team: Equipo) => void;
  startingYear: number;
  useCotNationality: boolean;
  useEurNationality: boolean;
}

export const TeamsView: React.FC<TeamsViewProps> = ({
  teams,
  onSelectTeam,
  onCreateTeam,
  onDeleteTeam,
  onOpenImportModal,
  onTeamImportedFromDbc,
  startingYear,
  useCotNationality,
  useEurNationality,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPuntero, setSelectedPuntero] = useState<number | null>(
    teams.length > 0 ? teams[0].puntero : null
  );
  const [isExportingZip, setIsExportingZip] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTeams = teams.filter((t) => {
    const q = searchTerm.toLowerCase();
    return (
      t.nombreCorto.toLowerCase().includes(q) ||
      t.nombreLargo.toLowerCase().includes(q) ||
      t.entrenador.toLowerCase().includes(q) ||
      t.pabellon.toLowerCase().includes(q) ||
      String(t.puntero).includes(q)
    );
  });

  const selectedTeam = teams.find((t) => t.puntero === selectedPuntero);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = event.target?.result as ArrayBuffer;
        // Attempt to extract puntero from filename: EQBA0101.DBC -> 101
        let defaultPuntero = 101;
        const match = file.name.match(/\d+/);
        if (match) {
          defaultPuntero = parseInt(match[0], 10);
        }
        const parsedTeam = readEquipoBytes(buffer, defaultPuntero);
        onTeamImportedFromDbc(parsedTeam);
      } catch (err) {
        console.error('Error al leer DBC:', err);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const handleExportAllZip = async () => {
    setIsExportingZip(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder('DBDAT/EQ022022');

      for (const team of teams) {
        const bytes = createEquipoDbcBytes(team, {
          startingYear,
          useCotNationality,
          useEurNationality,
        });
        const punteroStr = String(team.puntero).padStart(4, '0');
        folder?.file(`EQBA${punteroStr}.DBC`, bytes);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PCBASKET_EQUIPOS_DBC.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error al crear ZIP:', err);
    } finally {
      setIsExportingZip(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Hidden file input for DBC loading */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".dbc,.DBC,.bin"
        className="hidden"
      />

      {/* Herramientas GroupBox matching WPF TeamsView.xaml */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-[#1e3462] px-6 py-3 border-b border-[#ffce42]/40 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-white font-bold text-sm tracking-wide">
            <Shield className="w-5 h-5 text-[#ffce42]" />
            <span>Herramientas de Equipos</span>
          </div>
          <span className="text-xs text-slate-300 font-mono">
            {teams.length} equipos cargados
          </span>
        </div>

        <div className="p-6 grid grid-cols-2 sm:grid-cols-5 gap-4">
          {/* Añadir nuevo equipo */}
          <button
            onClick={onCreateTeam}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 hover:text-white transition-all group hover:border-[#ffce42]"
          >
            <div className="w-14 h-14 rounded-xl bg-blue-600/20 text-blue-400 group-hover:bg-[#ffce42]/20 group-hover:text-[#ffce42] flex items-center justify-center mb-2 transition-colors">
              <Plus className="w-7 h-7" />
            </div>
            <span className="text-xs font-semibold text-center">
              Añadir nuevo equipo
            </span>
          </button>

          {/* Importar desde Proballers */}
          <button
            onClick={onOpenImportModal}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 hover:text-white transition-all group hover:border-emerald-400"
          >
            <div className="w-14 h-14 rounded-xl bg-emerald-600/20 text-emerald-400 group-hover:bg-emerald-500/20 flex items-center justify-center mb-2 transition-colors">
              <Globe className="w-7 h-7" />
            </div>
            <span className="text-xs font-semibold text-center">
              Importar desde Proballers
            </span>
          </button>

          {/* Cargar archivo DBC */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 hover:text-white transition-all group hover:border-purple-400"
          >
            <div className="w-14 h-14 rounded-xl bg-purple-600/20 text-purple-400 group-hover:bg-purple-500/20 flex items-center justify-center mb-2 transition-colors">
              <Upload className="w-7 h-7" />
            </div>
            <span className="text-xs font-semibold text-center">
              Cargar archivo .DBC
            </span>
          </button>

          {/* Borrar equipo */}
          <button
            onClick={() => {
              if (selectedTeam) {
                if (window.confirm(`¿Estás seguro de eliminar el equipo "${selectedTeam.nombreCorto}"?`)) {
                  onDeleteTeam(selectedTeam.puntero);
                }
              }
            }}
            disabled={!selectedTeam}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
              selectedTeam
                ? 'bg-slate-800/80 hover:bg-rose-900/30 border-slate-700 text-slate-200 hover:text-rose-300 hover:border-rose-500 cursor-pointer'
                : 'bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <div className="w-14 h-14 rounded-xl bg-rose-600/10 text-rose-400 flex items-center justify-center mb-2">
              <Trash2 className="w-7 h-7" />
            </div>
            <span className="text-xs font-semibold text-center">
              Borrar equipo
            </span>
          </button>

          {/* Exportar BBDD a PC Basket (ZIP) */}
          <button
            onClick={handleExportAllZip}
            disabled={isExportingZip || teams.length === 0}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 hover:text-white transition-all group hover:border-[#ffce42]"
          >
            <div className="w-14 h-14 rounded-xl bg-amber-500/20 text-[#ffce42] group-hover:bg-[#ffce42]/30 flex items-center justify-center mb-2 transition-colors">
              <Archive className="w-7 h-7" />
            </div>
            <span className="text-xs font-semibold text-center">
              {isExportingZip ? 'Comprimiendo...' : 'Exportar todos (.ZIP)'}
            </span>
          </button>
        </div>
      </div>

      {/* Lista de equipos DataGrid */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Header bar with Search */}
        <div className="bg-slate-800/80 px-6 py-4 border-b border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <h2 className="text-base font-bold text-white tracking-wide">
              Lista de Equipos ({filteredTeams.length})
            </h2>
            <span className="text-xs text-slate-400">
              Doble clic para editar plantilla y datos
            </span>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, pabellón..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#ffce42]"
            />
          </div>
        </div>

        {/* Table matching original DataGrid columns */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#121c33] text-slate-300 font-semibold uppercase tracking-wider border-b border-slate-800">
                <th className="py-3 px-4 w-16 text-center">Punt.</th>
                <th className="py-3 px-4">Nombre Corto</th>
                <th className="py-3 px-4">Nombre Largo</th>
                <th className="py-3 px-3 text-center">Media (Q)</th>
                <th className="py-3 px-3 text-center">Media (P)</th>
                <th className="py-3 px-4">País</th>
                <th className="py-3 px-4">Pabellón</th>
                <th className="py-3 px-3 text-right">Aforo</th>
                <th className="py-3 px-3 text-right">Presupuesto</th>
                <th className="py-3 px-4">Entrenador</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredTeams.map((team) => {
                const country = getCountry(team.pais);
                const medias = calculateTeamMedias(team.plantilla);
                const isSelected = team.puntero === selectedPuntero;

                return (
                  <tr
                    key={team.puntero}
                    onClick={() => setSelectedPuntero(team.puntero)}
                    onDoubleClick={() => onSelectTeam(team)}
                    className={`transition-colors cursor-pointer select-none ${
                      isSelected
                        ? 'bg-blue-600/20 text-white font-semibold'
                        : 'hover:bg-slate-800/50 text-slate-300'
                    }`}
                  >
                    <td className="py-3 px-4 text-center font-mono font-bold text-amber-400">
                      {team.puntero}
                    </td>
                    <td className="py-3 px-4 font-bold text-white tracking-wide">
                      {team.nombreCorto}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {team.nombreLargo}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded font-black text-xs bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        {medias.mediaQuinteto}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded font-bold text-xs bg-slate-800 text-slate-300 border border-slate-700">
                        {medias.mediaPlantilla}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-base">{country.banderaEmoji}</span>
                        <span className="text-slate-300">{country.nombre}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{team.pabellon}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-300">
                      {team.aforo.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-400">
                      {team.presupuesto.toLocaleString()}M
                    </td>
                    <td className="py-3 px-4 text-slate-300">{team.entrenador}</td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTeam(team);
                          }}
                          title="Editar equipo y plantilla"
                          className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadDbcFile(team, {
                              startingYear,
                              useCotNationality,
                              useEurNationality,
                            });
                          }}
                          title="Descargar archivo EQBAxxxx.DBC"
                          className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredTeams.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    No se encontraron equipos que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
