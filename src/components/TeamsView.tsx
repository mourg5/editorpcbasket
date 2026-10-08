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
  Archive,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  X,
  Users,
  Check,
  Trophy,
  ArrowRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Info,
} from 'lucide-react';
import { Equipo } from '../types/pcbasket';
import { getCountry } from '../utils/paises';
import { calculateTeamMedias } from '../utils/ratingsUtils';
import { downloadDbcFile, readEquipoBytes, createEquipoDbcBytes } from '../utils/hexUtils';
import { validateTeamRoster, POS_NAMES } from '../utils/validationUtils';
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

interface PendingDbcImport {
  team: Equipo;
  filename: string;
  initialPuntero: number;
  customPuntero: number;
  hasConflict: boolean;
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

  // In-app Delete Team confirmation modal state
  const [teamToDelete, setTeamToDelete] = useState<Equipo | null>(null);

  // In-app DBC Import Preview & Confirmation modal state
  const [pendingDbc, setPendingDbc] = useState<PendingDbcImport | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Sorting state: supports sorting by name, budget, players, puntero, medias, aforo
  const [sortField, setSortField] = useState<
    'name' | 'nameLong' | 'budget' | 'players' | 'puntero' | 'mediaQ' | 'mediaP' | 'aforo'
  >('puntero');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (
    field: 'name' | 'nameLong' | 'budget' | 'players' | 'puntero' | 'mediaQ' | 'mediaP' | 'aforo'
  ) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      // For numeric metrics, descending is usually most interesting as first click
      if (['budget', 'players', 'mediaQ', 'mediaP', 'aforo'].includes(field)) {
        setSortDirection('desc');
      } else {
        setSortDirection('asc');
      }
    }
  };

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

  const sortedTeams = [...filteredTeams].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'name':
        comparison = a.nombreCorto.localeCompare(b.nombreCorto, 'es', { sensitivity: 'base' });
        break;
      case 'nameLong':
        comparison = a.nombreLargo.localeCompare(b.nombreLargo, 'es', { sensitivity: 'base' });
        break;
      case 'budget':
        comparison = (a.presupuesto || 0) - (b.presupuesto || 0);
        break;
      case 'players':
        comparison = (a.plantilla?.length || 0) - (b.plantilla?.length || 0);
        break;
      case 'mediaQ': {
        const mqA = calculateTeamMedias(a.plantilla).mediaQuinteto;
        const mqB = calculateTeamMedias(b.plantilla).mediaQuinteto;
        comparison = mqA - mqB;
        break;
      }
      case 'mediaP': {
        const mpA = calculateTeamMedias(a.plantilla).mediaPlantilla;
        const mpB = calculateTeamMedias(b.plantilla).mediaPlantilla;
        comparison = mpA - mpB;
        break;
      }
      case 'aforo':
        comparison = (a.aforo || 0) - (b.aforo || 0);
        break;
      case 'puntero':
      default:
        comparison = (a.puntero || 0) - (b.puntero || 0);
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const selectedTeam = teams.find((t) => t.puntero === selectedPuntero);

  // Drag and drop state
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const processDbcFile = (file: File) => {
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

        if (!parsedTeam || parsedTeam.plantilla.length === 0) {
          setImportError(
            `El archivo "${file.name}" no contiene una plantilla reconocible de PC Basket 6.0. Comprueba que sea un archivo de equipo (.DBC).`
          );
          return;
        }

        const conflict = teams.some((t) => t.puntero === parsedTeam.puntero);
        const maxCurrent =
          teams.length > 0 ? Math.max(...teams.map((t) => t.puntero)) : 100;
        const nextFree = maxCurrent + 1;

        setPendingDbc({
          team: parsedTeam,
          filename: file.name,
          initialPuntero: parsedTeam.puntero,
          customPuntero: conflict ? nextFree : parsedTeam.puntero,
          hasConflict: conflict,
        });
      } catch (err: any) {
        console.error('Error al leer DBC:', err);
        setImportError(
          `Error al procesar el archivo .DBC: ${err?.message || 'Formato incompatible'}. Asegúrate de que es un archivo .DBC de PC Basket.`
        );
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processDbcFile(file);
    e.target.value = '';
  };

  const handleDropFile = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.toLowerCase().endsWith('.dbc') || file.name.toLowerCase().endsWith('.bin'))) {
      processDbcFile(file);
    } else if (file) {
      setImportError('Por favor selecciona un archivo con extensión .DBC o .bin de PC Basket.');
    }
  };

  const handleConfirmImport = (overwriteExisting: boolean = false) => {
    if (!pendingDbc) return;

    const finalPuntero = overwriteExisting
      ? pendingDbc.initialPuntero
      : pendingDbc.customPuntero;

    const finalTeam: Equipo = {
      ...pendingDbc.team,
      equipoId: finalPuntero,
      puntero: finalPuntero,
      plantilla: pendingDbc.team.plantilla.map((p, idx) => ({
        ...p,
        equipoPuntero: finalPuntero,
        puntero:
          p.puntero > 0 ? p.puntero : finalPuntero * 10 + (idx + 1),
      })),
    };

    onTeamImportedFromDbc(finalTeam);
    setSelectedPuntero(finalPuntero);
    showToast(
      `Equipo "${finalTeam.nombreCorto}" importado con éxito (${finalTeam.plantilla.length} jugadores, ID: ${finalPuntero}).`
    );
    setPendingDbc(null);
  };

  const handleConfirmDelete = () => {
    if (!teamToDelete) return;

    const deletedPuntero = teamToDelete.puntero;
    const deletedName = teamToDelete.nombreCorto;

    onDeleteTeam(deletedPuntero);

    // Pick another team to select if needed
    const remaining = teams.filter((t) => t.puntero !== deletedPuntero);
    if (selectedPuntero === deletedPuntero) {
      setSelectedPuntero(remaining.length > 0 ? remaining[0].puntero : null);
    }

    setTeamToDelete(null);
    showToast(`Equipo "${deletedName}" eliminado correctamente de la base de datos.`);
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
      showToast(`Exportados ${teams.length} equipos en formato .DBC comprimidos en ZIP.`);
    } catch (err) {
      console.error('Error al crear ZIP:', err);
      showToast('Error al empaquetar archivos ZIP.');
    } finally {
      setIsExportingZip(false);
    }
  };

  // Validation breakdown for the pending DBC preview
  const pendingValidation = pendingDbc
    ? validateTeamRoster(pendingDbc.team, {
        useEurNationality,
        useCotNationality,
      })
    : null;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggingFile(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsDraggingFile(false);
        }
      }}
      onDrop={handleDropFile}
      className="max-w-7xl mx-auto px-4 py-8 space-y-6 relative"
    >
      {/* Drag & Drop Visual Overlay */}
      {isDraggingFile && (
        <div className="fixed inset-0 z-50 bg-[#1e3462]/90 backdrop-blur-sm border-4 border-dashed border-[#ffce42] flex flex-col items-center justify-center pointer-events-none animate-fade-in">
          <div className="w-20 h-20 rounded-2xl bg-[#ffce42]/20 text-[#ffce42] flex items-center justify-center mb-4 shadow-xl">
            <Upload className="w-10 h-10 animate-bounce" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-wide">
            Suelta el archivo .DBC aquí para importarlo
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Compatible con archivos de equipo de PC Basket 6.0 (EQBAxxxx.DBC)
          </p>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1e3462] border-2 border-[#ffce42] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 text-xs font-semibold animate-slide-in">
          <CheckCircle2 className="w-5 h-5 text-[#ffce42] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

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
          <div className="flex items-center space-x-4 text-xs font-mono">
            <span className="text-slate-300">
              {teams.length} equipos cargados
            </span>
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {
                teams.filter(
                  (t) =>
                    validateTeamRoster(t, { useEurNationality, useCotNationality })
                      .isValid
                ).length
              }{' '}
              reglamentarios
            </span>
          </div>
        </div>

        <div className="p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Añadir nuevo equipo */}
          <button
            onClick={onCreateTeam}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 hover:text-white transition-all group hover:border-[#ffce42] cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 group-hover:bg-[#ffce42]/20 group-hover:text-[#ffce42] flex items-center justify-center mb-2 transition-colors">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-center">
              Añadir nuevo
            </span>
          </button>

          {/* Importar desde Proballers */}
          <button
            onClick={onOpenImportModal}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 hover:text-white transition-all group hover:border-emerald-400 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 group-hover:bg-emerald-500/20 flex items-center justify-center mb-2 transition-colors">
              <Globe className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-center">
              Importar Web
            </span>
          </button>

          {/* Cargar archivo DBC */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 hover:text-white transition-all group hover:border-purple-400 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 group-hover:bg-purple-500/20 flex items-center justify-center mb-2 transition-colors">
              <Upload className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-center">
              Cargar .DBC
            </span>
          </button>

          {/* Exportar equipo seleccionado a DBC */}
          <button
            onClick={() => {
              if (selectedTeam) {
                downloadDbcFile(selectedTeam, {
                  startingYear,
                  useCotNationality,
                  useEurNationality,
                });
                showToast(`Equipo "${selectedTeam.nombreCorto}" exportado a archivo EQBA${String(selectedTeam.puntero).padStart(4, '0')}.DBC`);
              }
            }}
            disabled={!selectedTeam}
            title={selectedTeam ? `Exportar ${selectedTeam.nombreCorto} a EQBAxxxx.DBC` : 'Selecciona un equipo primero'}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
              selectedTeam
                ? 'bg-slate-800/80 hover:bg-emerald-900/30 border-slate-700 text-slate-200 hover:text-emerald-300 hover:border-emerald-500 cursor-pointer'
                : 'bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 ${
              selectedTeam ? 'bg-emerald-600/20 text-emerald-400' : 'bg-slate-800/40 text-slate-600'
            }`}>
              <Download className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-center">
              Exportar .DBC
            </span>
          </button>

          {/* Exportar BBDD a PC Basket (ZIP) */}
          <button
            onClick={handleExportAllZip}
            disabled={isExportingZip || teams.length === 0}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 hover:text-white transition-all group hover:border-[#ffce42] cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-[#ffce42] group-hover:bg-[#ffce42]/30 flex items-center justify-center mb-2 transition-colors">
              <Archive className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-center">
              {isExportingZip ? 'Creando...' : 'Exportar todos (ZIP)'}
            </span>
          </button>

          {/* Borrar equipo */}
          <button
            onClick={() => {
              if (selectedTeam) {
                setTeamToDelete(selectedTeam);
              }
            }}
            disabled={!selectedTeam}
            title={selectedTeam ? `Borrar ${selectedTeam.nombreCorto}` : 'Selecciona un equipo primero'}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
              selectedTeam
                ? 'bg-slate-800/80 hover:bg-rose-900/30 border-slate-700 text-slate-200 hover:text-rose-300 hover:border-rose-500 cursor-pointer'
                : 'bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 ${
              selectedTeam ? 'bg-rose-600/20 text-rose-400' : 'bg-slate-800/40 text-slate-600'
            }`}>
              <Trash2 className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-center">
              Borrar equipo
            </span>
          </button>
        </div>
      </div>

      {/* Lista de equipos DataGrid */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Header bar with Search and Quick Sort */}
        <div className="bg-slate-800/80 px-6 py-4 border-b border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <h2 className="text-base font-bold text-white tracking-wide">
              Lista de Equipos ({sortedTeams.length})
            </h2>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Haz clic en cualquier cabecera para ordenar
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            {/* Quick Sort Shortcuts for Primary Filters */}
            <div className="flex items-center gap-1.5 text-xs bg-slate-950/70 p-1 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 px-2 font-semibold">Ordenar:</span>
              <button
                onClick={() => handleSort('name')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  sortField === 'name'
                    ? 'bg-[#ffce42] text-black shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="Ordenar por Nombre de Equipo"
              >
                <span>Nombre</span>
                {sortField === 'name' ? (
                  sortDirection === 'asc' ? (
                    <ArrowUp className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDown className="w-3.5 h-3.5" />
                  )
                ) : (
                  <ArrowUpDown className="w-3 h-3 opacity-40" />
                )}
              </button>
              <button
                onClick={() => handleSort('budget')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  sortField === 'budget'
                    ? 'bg-[#ffce42] text-black shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="Ordenar por Presupuesto"
              >
                <span>Presupuesto</span>
                {sortField === 'budget' ? (
                  sortDirection === 'asc' ? (
                    <ArrowUp className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDown className="w-3.5 h-3.5" />
                  )
                ) : (
                  <ArrowUpDown className="w-3 h-3 opacity-40" />
                )}
              </button>
              <button
                onClick={() => handleSort('players')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  sortField === 'players'
                    ? 'bg-[#ffce42] text-black shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="Ordenar por Total de Jugadores en Plantilla"
              >
                <span>Jugadores</span>
                {sortField === 'players' ? (
                  sortDirection === 'asc' ? (
                    <ArrowUp className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDown className="w-3.5 h-3.5" />
                  )
                ) : (
                  <ArrowUpDown className="w-3 h-3 opacity-40" />
                )}
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre, pabellón..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#ffce42]"
              />
            </div>
          </div>
        </div>

        {/* Table matching original DataGrid columns with PC Basket Rules validation and Click-to-Sort */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#121c33] text-slate-300 font-semibold uppercase tracking-wider border-b border-slate-800">
                {/* ID / Puntero */}
                <th
                  onClick={() => handleSort('puntero')}
                  className={`py-3 px-3 w-16 text-center cursor-pointer select-none transition-colors hover:bg-white/5 hover:text-white group ${
                    sortField === 'puntero' ? 'text-[#ffce42] bg-white/5' : ''
                  }`}
                  title="Ordenar por Puntero / ID"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Punt.</span>
                    {sortField === 'puntero' ? (
                      sortDirection === 'asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-[#ffce42]" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-[#ffce42]" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-100" />
                    )}
                  </div>
                </th>

                {/* Nombre Corto (Name Sort) */}
                <th
                  onClick={() => handleSort('name')}
                  className={`py-3 px-4 cursor-pointer select-none transition-colors hover:bg-white/5 hover:text-white group ${
                    sortField === 'name' ? 'text-[#ffce42] bg-white/5 font-bold' : ''
                  }`}
                  title="Ordenar por Nombre Corto"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Nombre Corto</span>
                    {sortField === 'name' ? (
                      sortDirection === 'asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-[#ffce42]" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-[#ffce42]" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 opacity-30 group-hover:opacity-100" />
                    )}
                  </div>
                </th>

                {/* Nombre Largo */}
                <th
                  onClick={() => handleSort('nameLong')}
                  className={`py-3 px-4 cursor-pointer select-none transition-colors hover:bg-white/5 hover:text-white group ${
                    sortField === 'nameLong' ? 'text-[#ffce42] bg-white/5' : ''
                  }`}
                  title="Ordenar por Nombre Largo"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Nombre Largo</span>
                    {sortField === 'nameLong' ? (
                      sortDirection === 'asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-[#ffce42]" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-[#ffce42]" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 opacity-30 group-hover:opacity-100" />
                    )}
                  </div>
                </th>

                {/* Total Jugadores (Total Number of Players Sort) */}
                <th
                  onClick={() => handleSort('players')}
                  className={`py-3 px-3 text-center cursor-pointer select-none transition-colors hover:bg-white/5 hover:text-white group ${
                    sortField === 'players' ? 'text-[#ffce42] bg-white/5 font-bold' : ''
                  }`}
                  title="Ordenar por Total de Jugadores en Plantilla"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Jugadores</span>
                    {sortField === 'players' ? (
                      sortDirection === 'asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-[#ffce42]" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-[#ffce42]" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 opacity-30 group-hover:opacity-100" />
                    )}
                  </div>
                </th>

                {/* Media Quinteto */}
                <th
                  onClick={() => handleSort('mediaQ')}
                  className={`py-3 px-3 text-center cursor-pointer select-none transition-colors hover:bg-white/5 hover:text-white group ${
                    sortField === 'mediaQ' ? 'text-[#ffce42] bg-white/5' : ''
                  }`}
                  title="Ordenar por Media del Quinteto Titular"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Media (Q)</span>
                    {sortField === 'mediaQ' ? (
                      sortDirection === 'asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-[#ffce42]" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-[#ffce42]" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-100" />
                    )}
                  </div>
                </th>

                {/* Media Plantilla */}
                <th
                  onClick={() => handleSort('mediaP')}
                  className={`py-3 px-3 text-center cursor-pointer select-none transition-colors hover:bg-white/5 hover:text-white group ${
                    sortField === 'mediaP' ? 'text-[#ffce42] bg-white/5' : ''
                  }`}
                  title="Ordenar por Media de la Plantilla Completa"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Media (P)</span>
                    {sortField === 'mediaP' ? (
                      sortDirection === 'asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-[#ffce42]" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-[#ffce42]" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-100" />
                    )}
                  </div>
                </th>

                <th className="py-3 px-3 text-center">Reglamento</th>
                <th className="py-3 px-4">País</th>
                <th className="py-3 px-4">Pabellón</th>

                {/* Aforo */}
                <th
                  onClick={() => handleSort('aforo')}
                  className={`py-3 px-3 text-right cursor-pointer select-none transition-colors hover:bg-white/5 hover:text-white group ${
                    sortField === 'aforo' ? 'text-[#ffce42] bg-white/5' : ''
                  }`}
                  title="Ordenar por Aforo del Pabellón"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Aforo</span>
                    {sortField === 'aforo' ? (
                      sortDirection === 'asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-[#ffce42]" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-[#ffce42]" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-100" />
                    )}
                  </div>
                </th>

                {/* Presupuesto (Budget Sort) */}
                <th
                  onClick={() => handleSort('budget')}
                  className={`py-3 px-3 text-right cursor-pointer select-none transition-colors hover:bg-white/5 hover:text-white group ${
                    sortField === 'budget' ? 'text-[#ffce42] bg-white/5 font-bold' : ''
                  }`}
                  title="Ordenar por Presupuesto del Club"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Presupuesto</span>
                    {sortField === 'budget' ? (
                      sortDirection === 'asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-[#ffce42]" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-[#ffce42]" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 opacity-30 group-hover:opacity-100" />
                    )}
                  </div>
                </th>

                <th className="py-3 px-4">Entrenador</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {sortedTeams.map((team) => {
                const country = getCountry(team.pais);
                const medias = calculateTeamMedias(team.plantilla);
                const isSelected = team.puntero === selectedPuntero;
                const validation = validateTeamRoster(team, {
                  useEurNationality,
                  useCotNationality,
                });

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
                    <td className="py-3 px-3 text-center font-mono font-bold text-amber-400">
                      {team.puntero}
                    </td>
                    <td className="py-3 px-4 font-bold text-white tracking-wide">
                      {team.nombreCorto}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {team.nombreLargo}
                    </td>

                    {/* Total Jugadores de Plantilla */}
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono font-bold text-xs bg-slate-800 text-slate-200 border border-slate-700 shadow-xs">
                        <Users className="w-3 h-3 text-blue-400" />
                        <span>{team.plantilla?.length || 0}</span>
                      </span>
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
                    {/* PC Basket Validation Status Column */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {validation.isValid ? (
                        <span
                          title={`Plantilla reglamentaria: ${team.plantilla.length} jugadores, ${validation.stats.foreignCount}/2 extranjeros`}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>OK ({validation.stats.foreignCount} ext)</span>
                        </span>
                      ) : (
                        <span
                          title={validation.errors.map((e) => e.message).join(' | ')}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        >
                          <AlertOctagon className="w-3 h-3 text-rose-400" />
                          <span>
                            {validation.stats.foreignCount > 2
                              ? `${validation.stats.foreignCount} Ext.`
                              : `${team.plantilla.length} Jug.`}
                          </span>
                        </span>
                      )}
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
                    <td className="py-3 px-3 text-right font-mono text-emerald-400 font-bold">
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTeamToDelete(team);
                          }}
                          title="Borrar equipo de la base de datos"
                          className="p-1.5 rounded-lg bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {sortedTeams.length === 0 && (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-slate-500">
                    No se encontraron equipos que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Team Quick Actions Bar */}
      {selectedTeam && (() => {
        const selCountry = getCountry(selectedTeam.pais);
        const selValidation = validateTeamRoster(selectedTeam, {
          useEurNationality,
          useCotNationality,
        });

        return (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4 w-full md:w-auto">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1e3462] to-slate-900 border-2 border-[#ffce42]/40 flex items-center justify-center text-xl shrink-0">
                {selCountry.banderaEmoji}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white tracking-wide">
                    {selectedTeam.nombreCorto}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    ({selectedTeam.nombreLargo})
                  </span>
                  <span className="text-[11px] font-mono bg-slate-800 px-2 py-0.5 rounded text-amber-400 border border-slate-700">
                    ID: {selectedTeam.puntero}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span>{selectedTeam.pabellon} ({selectedTeam.aforo.toLocaleString()} esp.)</span>
                  <span>•</span>
                  <span>Entrenador: <strong className="text-slate-300">{selectedTeam.entrenador}</strong></span>
                  <span>•</span>
                  <span>Plantilla: <strong className="text-slate-200">{selectedTeam.plantilla.length} jug.</strong></span>
                  <span>•</span>
                  {selValidation.isValid ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Reglas PC Basket OK ({selValidation.stats.foreignCount}/2 ext)
                    </span>
                  ) : (
                    <span className="text-rose-400 font-semibold flex items-center gap-1">
                      <AlertOctagon className="w-3.5 h-3.5" /> Infringe Reglamento ({selValidation.stats.foreignCount} extranjeros)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2.5 w-full md:w-auto justify-end">
              <button
                onClick={() => setTeamToDelete(selectedTeam)}
                className="px-3.5 py-2 rounded-xl bg-rose-900/30 hover:bg-rose-900/60 text-rose-300 border border-rose-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title={`Eliminar ${selectedTeam.nombreCorto}`}
              >
                <Trash2 className="w-4 h-4" /> Borrar
              </button>
              <button
                onClick={() => {
                  downloadDbcFile(selectedTeam, {
                    startingYear,
                    useCotNationality,
                    useEurNationality,
                  });
                  showToast(`Descargado archivo EQBA${String(selectedTeam.puntero).padStart(4, '0')}.DBC`);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title={`Exportar ${selectedTeam.nombreCorto} a archivo .DBC`}
              >
                <Download className="w-4 h-4 text-emerald-400" /> Exportar .DBC
              </button>
              <button
                onClick={() => onSelectTeam(selectedTeam)}
                className="px-5 py-2 rounded-xl bg-[#ffce42] hover:bg-amber-400 text-black text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-lg transition-colors cursor-pointer"
              >
                <Edit3 className="w-4 h-4" /> Editar Equipo
              </button>
            </div>
          </div>
        );
      })()}

      {/* IN-APP MODAL: Delete Team Confirmation (No window.confirm!) */}
      {teamToDelete && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border-2 border-rose-600/60 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5 text-slate-100">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/40">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  ¿Eliminar este equipo de PC Basket?
                </h3>
                <p className="text-xs text-slate-400">
                  Esta acción eliminará el equipo de forma definitiva de la base de datos.
                </p>
              </div>
            </div>

            {/* Team details card */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">
                    {getCountry(teamToDelete.pais).banderaEmoji}
                  </span>
                  <span className="text-sm font-black text-[#ffce42] tracking-wide">
                    {teamToDelete.nombreCorto}
                  </span>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                  ID: {teamToDelete.puntero}
                </span>
              </div>
              <div className="text-xs text-slate-300 font-medium">
                {teamToDelete.nombreLargo}
              </div>
              <div className="flex items-center space-x-4 text-xs text-slate-400 pt-1 border-t border-slate-900">
                <span>
                  Plantilla:{' '}
                  <strong className="text-white">
                    {teamToDelete.plantilla.length} jugadores
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Pabellón:{' '}
                  <strong className="text-white">{teamToDelete.pabellon}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setTeamToDelete(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-950/50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IN-APP MODAL: DBC Import Preview & Configuration */}
      {pendingDbc && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fade-in overflow-y-auto">
          <div className="bg-slate-900 border-2 border-purple-500/60 rounded-2xl max-w-2xl w-full shadow-2xl text-slate-100 overflow-hidden my-6">
            {/* Modal Header */}
            <div className="bg-[#1e3462] border-b border-[#ffce42]/40 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/30 text-purple-300 flex items-center justify-center border border-purple-400/40">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Cargar Archivo .DBC de PC Basket
                  </h3>
                  <span className="text-xs text-purple-200/80 font-mono">
                    {pendingDbc.filename}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setPendingDbc(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Conflict warning if team ID is already present */}
              {pendingDbc.hasConflict && (
                <div className="bg-amber-950/40 border border-amber-600/60 rounded-xl p-4 text-xs text-amber-200 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-white">
                      Conflicto de Puntero (ID {pendingDbc.initialPuntero})
                    </p>
                    <p>
                      Ya existe un equipo en tu base de datos con el ID{' '}
                      <strong>{pendingDbc.initialPuntero}</strong> (
                      {teams.find((t) => t.puntero === pendingDbc.initialPuntero)?.nombreCorto}
                      ). Puedes importar con un nuevo ID asignado o sobrescribir el existente.
                    </p>
                  </div>
                </div>
              )}

              {/* Parsed Team Overview Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {getCountry(pendingDbc.team.pais).banderaEmoji}
                    </span>
                    <div>
                      <h4 className="text-base font-black text-white tracking-wide">
                        {pendingDbc.team.nombreCorto}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {pendingDbc.team.nombreLargo}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Puntero / ID:</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <input
                        type="number"
                        value={pendingDbc.customPuntero}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10) || 1;
                          setPendingDbc((prev) =>
                            prev ? { ...prev, customPuntero: val } : null
                          );
                        }}
                        className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-center text-xs font-mono font-bold text-amber-400 focus:border-[#ffce42] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Pabellón:</span>
                    <span className="font-semibold text-slate-200">
                      {pendingDbc.team.pabellon}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Aforo:</span>
                    <span className="font-mono text-slate-200">
                      {pendingDbc.team.aforo.toLocaleString()} esp.
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Presupuesto:</span>
                    <span className="font-mono text-emerald-400">
                      {pendingDbc.team.presupuesto} M
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Entrenador:</span>
                    <span className="font-semibold text-slate-200">
                      {pendingDbc.team.entrenador}
                    </span>
                  </div>
                </div>
              </div>

              {/* Roster & PC Basket Validation Status */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#ffce42] uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Plantilla Leída del Archivo ({pendingDbc.team.plantilla.length} jugadores)
                  </h4>
                  {pendingValidation && (
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                        pendingValidation.isValid
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {pendingValidation.isValid ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Reglas PC Basket OK
                        </>
                      ) : (
                        <>
                          <AlertOctagon className="w-3.5 h-3.5" /> Infringe Reglamento (
                          {pendingValidation.stats.foreignCount}/2 ext)
                        </>
                      )}
                    </span>
                  )}
                </div>

                <div className="max-h-56 overflow-y-auto border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#121c33] text-slate-300 sticky top-0 uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-2 px-3 text-center w-10">#</th>
                        <th className="py-2 px-3">Nombre</th>
                        <th className="py-2 px-2 text-center">Pos.</th>
                        <th className="py-2 px-2 text-center">M.Q</th>
                        <th className="py-2 px-2 text-center">M.P</th>
                        <th className="py-2 px-3">País</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {pendingDbc.team.plantilla.map((p, idx) => {
                        const country = getCountry(p.nacionalidad);
                        const medias = calculateTeamMedias([p]);
                        return (
                          <tr key={idx} className="hover:bg-slate-800/40">
                            <td className="py-1.5 px-3 text-center font-mono font-bold text-amber-400">
                              {p.dorsal}
                            </td>
                            <td className="py-1.5 px-3 text-white font-semibold">
                              {p.nombreCorto}{' '}
                              <span className="text-slate-400 text-[11px] font-normal">
                                ({p.nombreLargo})
                              </span>
                            </td>
                            <td className="py-1.5 px-2 text-center">
                              <span className="text-[11px] font-mono text-slate-300">
                                {POS_NAMES[p.demarcacion] || 'Alero'}
                              </span>
                            </td>
                            <td className="py-1.5 px-2 text-center font-bold text-amber-400">
                              {medias.mediaQuinteto}
                            </td>
                            <td className="py-1.5 px-2 text-center text-slate-300">
                              {medias.mediaPlantilla}
                            </td>
                            <td className="py-1.5 px-3 text-slate-300 whitespace-nowrap">
                              <span className="mr-1">{country.banderaEmoji}</span>
                              <span className="text-slate-400 text-[11px]">
                                {country.nombre}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="bg-slate-950 border-t border-slate-800 px-6 py-4 flex items-center justify-between">
              <button
                onClick={() => setPendingDbc(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>

              <div className="flex items-center space-x-3">
                {pendingDbc.hasConflict && (
                  <button
                    onClick={() => handleConfirmImport(true)}
                    className="px-4 py-2 bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 border border-rose-600/50 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Sobrescribir ID {pendingDbc.initialPuntero}
                  </button>
                )}
                <button
                  onClick={() => handleConfirmImport(false)}
                  className="px-5 py-2 bg-[#ffce42] hover:bg-amber-400 text-black font-extrabold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg transition-colors cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  {pendingDbc.hasConflict
                    ? `Importar con ID ${pendingDbc.customPuntero}`
                    : 'Confirmar e Importar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IN-APP MODAL: Error on DBC reading */}
      {importError && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border-2 border-rose-500 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/40">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  Error al Cargar Archivo .DBC
                </h3>
                <p className="text-xs text-rose-300/90 leading-relaxed">
                  {importError}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setImportError(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
