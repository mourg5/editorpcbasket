import React, { useState, useRef, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Edit3,
  Shield,
  Trophy,
  CheckSquare,
  Square,
  MinusSquare,
  GripVertical,
  ArrowRight,
  ArrowRightLeft,
  X,
  Check,
  AlertTriangle,
  ChevronDown,
  Layers,
  Sparkles,
  MoveRight,
  UserCheck,
} from 'lucide-react';
import { Equipo, Jugador, Demarcacion } from '../types/pcbasket';
import { getCountry } from '../utils/paises';
import { calculateMediaQuinteto, calculateMediaPlantilla } from '../utils/ratingsUtils';
import { getPlayerPassportType } from '../utils/validationUtils';

interface PlayersDirectoryViewProps {
  teams: Equipo[];
  onEditPlayer: (player: Jugador, onPlayerSave: (updatedPlayer: Jugador) => void) => void;
  onSelectTeam: (team: Equipo) => void;
  onBatchMovePlayers?: (playerPunteros: number[], targetTeamPuntero: number) => void;
  startingYear?: number;
  useCotNationality?: boolean;
  useEurNationality?: boolean;
}

const POS_NAMES: Record<Demarcacion, string> = {
  0: 'Base',
  1: 'Escolta',
  2: 'Alero',
  3: 'Ala-Pívot',
  4: 'Pívot',
};

const POS_BADGE_COLORS: Record<Demarcacion, string> = {
  0: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  1: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  2: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  3: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  4: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
};

export const PlayersDirectoryView: React.FC<PlayersDirectoryViewProps> = ({
  teams,
  onEditPlayer,
  onSelectTeam,
  onBatchMovePlayers,
  startingYear = 1997,
  useCotNationality = true,
  useEurNationality = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPos, setSelectedPos] = useState<string>('all');
  const [selectedTeamPuntero, setSelectedTeamPuntero] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'ratingQ' | 'ratingP' | 'nombre' | 'altura'>('ratingQ');

  // Batch Selection State
  const [selectedPlayerPunteros, setSelectedPlayerPunteros] = useState<Set<number>>(new Set());

  // Drag and Drop State
  const [isDragging, setIsDragging] = useState(false);
  const [draggedPunteros, setDraggedPunteros] = useState<number[]>([]);
  const [dragOverTeamPuntero, setDragOverTeamPuntero] = useState<number | null>(null);
  const [showDropDock, setShowDropDock] = useState(true);

  // Batch Move Modal State
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [targetTeamPuntero, setTargetTeamPuntero] = useState<number | null>(null);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Flatten all players with team reference
  const allPlayersWithTeam = teams.flatMap((team) =>
    team.plantilla.map((player) => ({
      player,
      team,
    }))
  );

  // Helper to normalize strings for robust accent-insensitive matching
  const normalize = (text: string) =>
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const highlightMatch = (text: string, query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return text;
    const normQ = normalize(trimmed);
    const normText = normalize(text);
    const matchIndex = normText.indexOf(normQ);
    if (matchIndex === -1) return text;

    const before = text.slice(0, matchIndex);
    const matched = text.slice(matchIndex, matchIndex + trimmed.length);
    const after = text.slice(matchIndex + trimmed.length);

    return (
      <>
        {before}
        <mark className="bg-[#ffce42]/30 text-[#ffce42] font-black rounded px-0.5">{matched}</mark>
        {after}
      </>
    );
  };

  const filtered = allPlayersWithTeam.filter(({ player, team }) => {
    const q = normalize(searchTerm.trim());
    const matchSearch =
      !q ||
      normalize(player.nombreCorto).includes(q) ||
      normalize(player.nombreLargo).includes(q) ||
      normalize(team.nombreCorto).includes(q) ||
      normalize(team.nombreLargo).includes(q) ||
      String(player.puntero).includes(q) ||
      String(player.dorsal) === q;

    const matchPos = selectedPos === 'all' || String(player.demarcacion) === selectedPos;
    const matchTeam =
      selectedTeamPuntero === 'all' || String(team.puntero) === selectedTeamPuntero;

    return matchSearch && matchPos && matchTeam;
  });

  filtered.sort((a, b) => {
    if (sortBy === 'ratingQ') {
      return (
        calculateMediaQuinteto(b.player.medias) -
        calculateMediaQuinteto(a.player.medias)
      );
    }
    if (sortBy === 'ratingP') {
      return (
        calculateMediaPlantilla(b.player.medias) -
        calculateMediaPlantilla(a.player.medias)
      );
    }
    if (sortBy === 'altura') {
      return b.player.altura - a.player.altura;
    }
    return a.player.nombreLargo.localeCompare(b.player.nombreLargo);
  });

  // Checkbox helpers
  const visiblePunteros = filtered.map(({ player }) => player.puntero);
  const isAllVisibleSelected =
    visiblePunteros.length > 0 &&
    visiblePunteros.every((pId) => selectedPlayerPunteros.has(pId));
  const isSomeVisibleSelected =
    visiblePunteros.some((pId) => selectedPlayerPunteros.has(pId)) && !isAllVisibleSelected;

  const toggleSelectPlayer = (puntero: number) => {
    setSelectedPlayerPunteros((prev) => {
      const next = new Set(prev);
      if (next.has(puntero)) {
        next.delete(puntero);
      } else {
        next.add(puntero);
      }
      return next;
    });
  };

  const handleSelectAllVisible = () => {
    if (isAllVisibleSelected) {
      // Deselect visible
      setSelectedPlayerPunteros((prev) => {
        const next = new Set(prev);
        visiblePunteros.forEach((pId) => next.delete(pId));
        return next;
      });
    } else {
      // Select visible
      setSelectedPlayerPunteros((prev) => {
        const next = new Set(prev);
        visiblePunteros.forEach((pId) => next.add(pId));
        return next;
      });
    }
  };

  const clearSelection = () => {
    setSelectedPlayerPunteros(new Set());
  };

  // Get selected players items
  const selectedPlayersList = allPlayersWithTeam.filter(({ player }) =>
    selectedPlayerPunteros.has(player.puntero)
  );

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, player: Jugador) => {
    let punterosToMove: number[];
    if (selectedPlayerPunteros.has(player.puntero)) {
      punterosToMove = Array.from(selectedPlayerPunteros);
    } else {
      punterosToMove = [player.puntero];
      setSelectedPlayerPunteros(new Set([player.puntero]));
    }

    setDraggedPunteros(punterosToMove);
    setIsDragging(true);

    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ playerPunteros: punterosToMove })
    );
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedPunteros([]);
    setDragOverTeamPuntero(null);
  };

  const handleDropOnTeam = (e: React.DragEvent, team: Equipo) => {
    e.preventDefault();
    setDragOverTeamPuntero(null);
    setIsDragging(false);

    let punteros: number[] = draggedPunteros;
    try {
      const data = e.dataTransfer.getData('application/json');
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed.playerPunteros)) {
          punteros = parsed.playerPunteros;
        }
      }
    } catch {
      // fallback to state
    }

    if (punteros.length === 0) return;

    executeTransfer(punteros, team.puntero);
  };

  // Transfer execution
  const executeTransfer = (playerPunteros: number[], destTeamPuntero: number) => {
    const destTeam = teams.find((t) => t.puntero === destTeamPuntero);
    if (!destTeam) return;

    if (onBatchMovePlayers) {
      onBatchMovePlayers(playerPunteros, destTeamPuntero);
    }

    const count = playerPunteros.length;
    showToast(
      `✓ Se ${count === 1 ? 'ha' : 'han'} traspasado ${count} jugador${
        count === 1 ? '' : 'es'
      } a ${destTeam.nombreCorto} con éxito.`
    );

    clearSelection();
    setIsTransferModalOpen(false);
    setTargetTeamPuntero(null);
  };

  // Target team details for modal
  const chosenDestTeam = teams.find((t) => t.puntero === targetTeamPuntero);

  // Validation details for preview modal
  const transferValidation = chosenDestTeam
    ? (() => {
        const incomingPlayers = selectedPlayersList
          .filter(({ team }) => team.puntero !== chosenDestTeam.puntero)
          .map(({ player }) => player);

        const currentForeigners = chosenDestTeam.plantilla.filter(
          (p) =>
            getPlayerPassportType(p, chosenDestTeam.pais, useEurNationality, useCotNationality)
              .type === 'EXT'
        ).length;

        const incomingForeigners = incomingPlayers.filter(
          (p) =>
            getPlayerPassportType(p, chosenDestTeam.pais, useEurNationality, useCotNationality)
              .type === 'EXT'
        ).length;

        const totalRosterAfter = chosenDestTeam.plantilla.length + incomingPlayers.length;
        const totalForeignersAfter = currentForeigners + incomingForeigners;

        return {
          incomingCount: incomingPlayers.length,
          totalRosterAfter,
          isOverRosterLimit: totalRosterAfter > 15,
          totalForeignersAfter,
          isOverForeignLimit: totalForeignersAfter > 2,
        };
      })()
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 right-6 z-50 bg-[#1e3462] border-2 border-[#ffce42] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in backdrop-blur-md">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-5 h-5 font-bold" />
          </div>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Directorio Global de Jugadores
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30 font-semibold">
                  Traspasos por Lote y Drag & Drop
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {filtered.length} de {allPlayersWithTeam.length} jugadores en la base de datos
                {selectedPlayerPunteros.size > 0 && (
                  <span className="ml-2 font-bold text-[#ffce42]">
                    · {selectedPlayerPunteros.size} seleccionado(s)
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
            <button
              onClick={() => setShowDropDock(!showDropDock)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                showDropDock
                  ? 'bg-amber-500/20 border-[#ffce42]/60 text-[#ffce42]'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{showDropDock ? 'Ocultar Banquillos' : 'Ver Banquillos Destino'}</span>
            </button>

            {selectedPlayerPunteros.size > 0 && (
              <button
                onClick={clearSelection}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Limpiar ({selectedPlayerPunteros.size})</span>
              </button>
            )}
          </div>
        </div>

        {/* Real-time Search Bar */}
        <div className="pt-4">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-[#ffce42] absolute left-4 pointer-events-none transition-colors" />
            <input
              type="text"
              placeholder="Buscar jugadores por nombre (ej. Herreros, Djordjevic) o por equipo (ej. Real Madrid, Barcelona)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-28 py-3 bg-slate-950/90 border-2 border-slate-700 focus:border-[#ffce42] rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none transition-all shadow-inner"
            />
            <div className="absolute right-3 flex items-center gap-2">
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  title="Borrar búsqueda"
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <span className="text-[11px] font-mono px-2 py-1 rounded-md bg-slate-800 text-slate-400 hidden sm:inline border border-slate-700">
                {filtered.length} {filtered.length === 1 ? 'jugador' : 'jugadores'}
              </span>
            </div>
          </div>
          {searchTerm && (
            <div className="mt-2 flex items-center justify-between text-xs text-slate-400 px-1">
              <span>
                Filtrando en tiempo real por:{' '}
                <b className="text-[#ffce42] font-semibold">«{searchTerm}»</b> ({filtered.length}{' '}
                {filtered.length === 1 ? 'coincidencia' : 'coincidencias'})
              </span>
              <button
                onClick={() => setSearchTerm('')}
                className="text-[#ffce42] hover:underline font-semibold cursor-pointer"
              >
                Limpiar filtro de búsqueda
              </button>
            </div>
          )}
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Filtrar por Posición:
            </label>
            <select
              value={selectedPos}
              onChange={(e) => setSelectedPos(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:border-[#ffce42] focus:outline-none"
            >
              <option value="all">Todas las posiciones</option>
              <option value="0">Bases (PG)</option>
              <option value="1">Escoltas (SG)</option>
              <option value="2">Aleros (SF)</option>
              <option value="3">Ala-Pívots (PF)</option>
              <option value="4">Pívots (C)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Filtrar por Equipo:
            </label>
            <select
              value={selectedTeamPuntero}
              onChange={(e) => setSelectedTeamPuntero(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:border-[#ffce42] focus:outline-none"
            >
              <option value="all">Todos los equipos</option>
              {teams.map((t) => (
                <option key={t.puntero} value={String(t.puntero)}>
                  {t.nombreCorto} ({t.plantilla?.length || 0} jug.)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Ordenar por:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:border-[#ffce42] focus:outline-none"
            >
              <option value="ratingQ">Media Quinteto (Mayor a menor)</option>
              <option value="ratingP">Media Plantilla (Mayor a menor)</option>
              <option value="altura">Altura (Mayor a menor)</option>
              <option value="nombre">Nombre alfabético</option>
            </select>
          </div>
        </div>
      </div>

      {/* TARGET TEAMS DROP DOCK (Drag & Drop or Click to Move Zone) */}
      {showDropDock && teams.length > 0 && (
        <div
          className={`bg-slate-900/90 border rounded-2xl shadow-xl p-5 transition-all ${
            isDragging
              ? 'border-[#ffce42] bg-[#121c33]/90 ring-2 ring-[#ffce42]/40 shadow-[#ffce42]/10'
              : 'border-slate-800'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#ffce42]" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Banquillos de Destino (Zona de Traspasos)
              </h3>
            </div>
            <p className="text-[11px] text-slate-400">
              {isDragging ? (
                <span className="font-bold text-[#ffce42] animate-pulse">
                  🎯 Suelta a los {draggedPunteros.length} jugador(es) sobre cualquier equipo
                </span>
              ) : selectedPlayerPunteros.size > 0 ? (
                <span>
                  Haz clic en <b className="text-[#ffce42]">"Traspasar aquí"</b> o arrastra los
                  jugadores seleccionados
                </span>
              ) : (
                <span>Arrastra cualquier fila o selecciona varios para transferirlos</span>
              )}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {teams.map((t) => {
              const isOver = dragOverTeamPuntero === t.puntero;
              const rosterCount = t.plantilla?.length || 0;
              const isFull = rosterCount >= 15;

              return (
                <div
                  key={t.puntero}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverTeamPuntero(t.puntero);
                  }}
                  onDragLeave={() => {
                    if (dragOverTeamPuntero === t.puntero) {
                      setDragOverTeamPuntero(null);
                    }
                  }}
                  onDrop={(e) => handleDropOnTeam(e, t)}
                  className={`p-3 rounded-xl border transition-all flex flex-col justify-between select-none relative group ${
                    isOver
                      ? 'border-[#ffce42] bg-[#ffce42]/20 scale-105 shadow-xl ring-2 ring-[#ffce42]'
                      : isDragging
                      ? 'border-dashed border-slate-600 bg-slate-800/60 hover:border-[#ffce42] hover:bg-slate-800'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-bold text-white truncate" title={t.nombreLargo}>
                        {t.nombreCorto}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                          isFull
                            ? 'bg-rose-500/20 text-rose-300'
                            : rosterCount >= 12
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {rosterCount}/15
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {t.entrenador || 'Sin entrenador'}
                    </div>
                  </div>

                  {/* If users have selected players, provide direct click action */}
                  {selectedPlayerPunteros.size > 0 && !isDragging && (
                    <button
                      onClick={() => {
                        setTargetTeamPuntero(t.puntero);
                        setIsTransferModalOpen(true);
                      }}
                      className="mt-2.5 w-full py-1 px-2 rounded-lg bg-amber-500/20 hover:bg-[#ffce42] text-amber-300 hover:text-black border border-amber-500/30 font-bold text-[10px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ArrowRightLeft className="w-3 h-3" />
                      <span>Traspasar aquí</span>
                    </button>
                  )}

                  {isDragging && (
                    <div className="mt-2 text-center text-[10px] font-bold text-[#ffce42]">
                      {isOver ? '¡Soltar aquí!' : 'Zona de drop'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Players Table with Multi-Select and Drag Handles */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Table Toolbar Header */}
        <div className="bg-slate-800/70 px-6 py-3 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAllVisible}
              className="flex items-center gap-2 text-slate-300 hover:text-white font-semibold cursor-pointer select-none"
            >
              {isAllVisibleSelected ? (
                <CheckSquare className="w-4 h-4 text-[#ffce42]" />
              ) : isSomeVisibleSelected ? (
                <MinusSquare className="w-4 h-4 text-[#ffce42]" />
              ) : (
                <Square className="w-4 h-4 text-slate-500" />
              )}
              <span>
                {isAllVisibleSelected
                  ? 'Deseleccionar visibles'
                  : `Seleccionar visibles (${filtered.length})`}
              </span>
            </button>

            {selectedPlayerPunteros.size > 0 && (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-[#ffce42] border border-amber-400/30 font-bold">
                {selectedPlayerPunteros.size} seleccionados
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <span className="flex items-center gap-1">
              <GripVertical className="w-3.5 h-3.5 text-slate-500" />
              Arrastra una fila o selección para traspasar a otro equipo
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#121c33] text-slate-300 font-semibold uppercase tracking-wider border-b border-slate-800">
                {/* Checkbox Header */}
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllVisibleSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeVisibleSelected;
                    }}
                    onChange={handleSelectAllVisible}
                    className="w-4 h-4 rounded border-slate-700 text-[#ffce42] focus:ring-0 focus:ring-offset-0 bg-slate-950 cursor-pointer accent-[#ffce42]"
                  />
                </th>

                {/* Drag Handle Column */}
                <th className="py-3 px-2 w-8 text-center" title="Arrastrar"></th>

                <th className="py-3 px-3 text-center w-14">ID</th>
                <th className="py-3 px-3 text-center w-12">#</th>
                <th className="py-3 px-4">Jugador</th>
                <th className="py-3 px-4">Equipo Actual</th>
                <th className="py-3 px-3 text-center">Pos.</th>
                <th className="py-3 px-3 text-center">Med.Q</th>
                <th className="py-3 px-3 text-center">Med.P</th>
                <th className="py-3 px-3 text-center">Alt (cm)</th>
                <th className="py-3 px-3 text-center">Peso</th>
                <th className="py-3 px-4">Nacionalidad</th>
                <th className="py-3 px-3 text-center">Nac</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filtered.map(({ player, team }) => {
                const isSelected = selectedPlayerPunteros.has(player.puntero);
                const country = getCountry(player.nacionalidad);
                const q = calculateMediaQuinteto(player.medias);
                const p = calculateMediaPlantilla(player.medias);
                const passport = getPlayerPassportType(
                  player,
                  team.pais,
                  useEurNationality,
                  useCotNationality
                );

                return (
                  <tr
                    key={`${team.puntero}-${player.puntero}`}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, player)}
                    onDragEnd={handleDragEnd}
                    className={`transition-colors cursor-grab active:cursor-grabbing ${
                      isSelected
                        ? 'bg-amber-500/15 border-l-4 border-l-[#ffce42] text-white hover:bg-amber-500/20'
                        : 'hover:bg-slate-800/50 text-slate-300'
                    }`}
                  >
                    {/* Checkbox Cell */}
                    <td
                      className="py-3 px-3 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectPlayer(player.puntero)}
                        className="w-4 h-4 rounded border-slate-700 text-[#ffce42] bg-slate-950 cursor-pointer accent-[#ffce42]"
                      />
                    </td>

                    {/* Drag Handle Cell */}
                    <td className="py-3 px-2 text-center text-slate-500 hover:text-slate-300">
                      <GripVertical className="w-4 h-4 inline opacity-60 hover:opacity-100" />
                    </td>

                    {/* Player ID */}
                    <td className="py-3 px-3 text-center font-mono font-bold text-amber-400">
                      {player.puntero}
                    </td>

                    {/* Dorsal */}
                    <td className="py-3 px-3 text-center font-mono font-bold text-white">
                      {player.dorsal}
                    </td>

                    {/* Player Name */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white tracking-wide">
                        {highlightMatch(player.nombreLargo, searchTerm)}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {highlightMatch(player.nombreCorto, searchTerm)}
                      </div>
                    </td>

                    {/* Current Team */}
                    <td className="py-3 px-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTeam(team);
                        }}
                        className="hover:underline flex items-center space-x-1.5 text-blue-400 font-semibold cursor-pointer"
                      >
                        <Shield className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">
                          {highlightMatch(team.nombreCorto, searchTerm)}
                        </span>
                      </button>
                    </td>

                    {/* Position */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-semibold text-xs border ${
                          POS_BADGE_COLORS[player.demarcacion] || 'bg-slate-800 text-slate-200'
                        }`}
                      >
                        {POS_NAMES[player.demarcacion]}
                      </span>
                    </td>

                    {/* Medias */}
                    <td className="py-3 px-3 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded font-black text-xs bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        {q}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-300">
                      {p}
                    </td>

                    {/* Altura / Peso */}
                    <td className="py-3 px-3 text-center font-mono text-slate-400">
                      {player.altura}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-400">
                      {player.peso}
                    </td>

                    {/* Nacionalidad & Passport */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{country.banderaEmoji}</span>
                        <span className="text-slate-300">{country.nombre}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-semibold border ${passport.badgeClass}`}
                        >
                          {passport.type}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center font-mono text-slate-400">
                      {player.anoNacimiento}
                    </td>

                    {/* Individual Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditPlayer(player, (updatedPlayer) => {
                              const playerIndex = team.plantilla.findIndex(
                                (j) => j.puntero === player.puntero
                              );
                              if (playerIndex >= 0) {
                                team.plantilla[playerIndex] = updatedPlayer;
                              }
                            });
                          }}
                          className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Editar
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPlayerPunteros(new Set([player.puntero]));
                            setIsTransferModalOpen(true);
                          }}
                          title="Traspasar a otro equipo"
                          className="px-2 py-1 bg-amber-500/20 hover:bg-[#ffce42] text-amber-300 hover:text-black rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={14} className="py-16 text-center text-slate-400">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 text-slate-400 flex items-center justify-center">
                        <Search className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-sm font-semibold text-white">
                        {searchTerm
                          ? `No se encontraron jugadores que coincidan con «${searchTerm}»`
                          : 'No se encontraron jugadores con los filtros seleccionados'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {searchTerm
                          ? 'Comprueba que el nombre del jugador o del equipo esté bien escrito (ej. "Herreros", "Real Madrid", "Barcelona").'
                          : 'Prueba a cambiar la posición o el equipo seleccionado en los filtros.'}
                      </p>
                      {(searchTerm || selectedPos !== 'all' || selectedTeamPuntero !== 'all') && (
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setSelectedPos('all');
                            setSelectedTeamPuntero('all');
                          }}
                          className="px-4 py-1.5 rounded-lg bg-[#ffce42] hover:bg-amber-400 text-black text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5 mt-2"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Restablecer búsqueda y filtros</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FLOATING BATCH ACTION BAR (Shown when players are selected) */}
      {selectedPlayerPunteros.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-full px-4 animate-bounce-subtle">
          <div className="bg-[#121c33]/95 border-2 border-[#ffce42] text-white p-4 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ffce42]/20 text-[#ffce42] flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{selectedPlayerPunteros.size} Jugador(es) Seleccionados</span>
                  <span className="text-[10px] bg-amber-500/20 text-[#ffce42] px-2 py-0.5 rounded border border-[#ffce42]/40">
                    Lote Activo
                  </span>
                </div>
                <div className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                  {selectedPlayersList.slice(0, 4).map((i) => i.player.nombreCorto).join(', ')}
                  {selectedPlayersList.length > 4 && ` y ${selectedPlayersList.length - 4} más...`}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => setIsTransferModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#ffce42] hover:bg-amber-400 text-black font-bold text-xs shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>Traspasar Selección</span>
              </button>

              <button
                onClick={clearSelection}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Cancelar selección"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BATCH MOVE / TRANSFER CONFIRMATION MODAL */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ffce42]/20 text-[#ffce42] flex items-center justify-center">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Traspaso en Lote de Jugadores
                  </h3>
                  <p className="text-xs text-slate-400">
                    Mover {selectedPlayerPunteros.size} jugador(es) a una nueva plantilla
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Destination Team Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                Selecciona el Equipo de Destino:
              </label>
              <select
                value={targetTeamPuntero || ''}
                onChange={(e) => setTargetTeamPuntero(Number(e.target.value) || null)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#ffce42] focus:outline-none"
              >
                <option value="">-- Elige un equipo de destino --</option>
                {teams.map((t) => (
                  <option key={t.puntero} value={t.puntero}>
                    {t.nombreLargo} ({t.nombreCorto}) · {t.plantilla?.length || 0}/15 jugadores
                  </option>
                ))}
              </select>
            </div>

            {/* Target Team Card Preview & Validation */}
            {chosenDestTeam && transferValidation && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#ffce42]" />
                    <span className="font-bold text-white text-xs">
                      {chosenDestTeam.nombreLargo}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {chosenDestTeam.pabellon}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Plantilla tras mover:</span>
                    <span
                      className={`font-bold ${
                        transferValidation.isOverRosterLimit ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {chosenDestTeam.plantilla.length} → {transferValidation.totalRosterAfter} / 15
                    </span>
                  </div>

                  <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Extranjeros tras mover:</span>
                    <span
                      className={`font-bold ${
                        transferValidation.isOverForeignLimit ? 'text-rose-400' : 'text-slate-200'
                      }`}
                    >
                      {transferValidation.totalForeignersAfter} / 2 permitidos
                    </span>
                  </div>

                  <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-400 block">Entrenador:</span>
                    <span className="font-semibold text-slate-200 truncate block">
                      {chosenDestTeam.entrenador || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Validation Warnings */}
                {transferValidation.isOverRosterLimit && (
                  <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-2.5 rounded-lg text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>
                      Atención: La plantilla superará el límite de 15 jugadores permitido por PC
                      Basket ({transferValidation.totalRosterAfter} jugadores).
                    </span>
                  </div>
                )}

                {transferValidation.isOverForeignLimit && (
                  <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-2.5 rounded-lg text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>
                      Reglamento ACB: El equipo tendrá {transferValidation.totalForeignersAfter}{' '}
                      extranjeros (el máximo permitido en competición oficial es 2).
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* List of Players Being Transferred */}
            <div>
              <span className="text-xs font-bold text-slate-400 block mb-2">
                Jugadores a traspasar ({selectedPlayersList.length}):
              </span>
              <div className="max-h-52 overflow-y-auto border border-slate-800 rounded-xl divide-y divide-slate-800/80 bg-slate-950/50">
                {selectedPlayersList.map(({ player, team }) => {
                  const country = getCountry(player.nacionalidad);
                  return (
                    <div
                      key={player.puntero}
                      className="px-3 py-2 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#ffce42] w-6 text-center">
                          #{player.dorsal}
                        </span>
                        <div>
                          <span className="font-bold text-white block">
                            {player.nombreLargo}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Equipo actual: {team.nombreCorto} · {POS_NAMES[player.demarcacion]}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{country.banderaEmoji}</span>
                        <span className="text-slate-400 text-[11px]">{country.nombre}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                * Si el dorsal del jugador ya está en uso en el equipo de destino, se reasignará
                automáticamente al siguiente dorsal libre para evitar duplicados.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (targetTeamPuntero) {
                    executeTransfer(Array.from(selectedPlayerPunteros), targetTeamPuntero);
                  }
                }}
                disabled={!targetTeamPuntero}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  targetTeamPuntero
                    ? 'bg-[#ffce42] hover:bg-amber-400 text-black shadow-lg shadow-[#ffce42]/20'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Confirmar Traspaso ({selectedPlayerPunteros.size})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
