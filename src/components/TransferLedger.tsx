import React, { useState, useMemo, useEffect } from 'react';
import {
  History,
  ArrowRight,
  ArrowLeftRight,
  Clock,
  Search,
  Filter,
  RotateCcw,
  Trash2,
  Download,
  Plus,
  Users,
  Shield,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Calendar,
  Sparkles,
  ChevronDown,
  X,
} from 'lucide-react';
import { Equipo, Jugador, TransferRecord, Demarcacion } from '../types/pcbasket';
import { StorageService } from '../services/storageService';
import { calculateMediaQuinteto } from '../utils/ratingsUtils';

interface TransferLedgerProps {
  teams: Equipo[];
  onBatchMovePlayers?: (playerPunteros: number[], targetTeamPuntero: number) => void;
  onRefreshTeams?: () => void;
}

const POS_NAMES = ['Base', 'Escolta', 'Alero', 'Ala-Pívot', 'Pívot'];
const POS_SHORT = ['B', 'E', 'A', 'AP', 'P'];
const POS_COLORS = [
  'bg-blue-500/20 text-blue-300 border-blue-500/40',
  'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  'bg-amber-500/20 text-amber-300 border-amber-500/40',
  'bg-rose-500/20 text-rose-300 border-rose-500/40',
];

export const TransferLedger: React.FC<TransferLedgerProps> = ({
  teams,
  onBatchMovePlayers,
  onRefreshTeams,
}) => {
  const [records, setRecords] = useState<TransferRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('ALL');
  const [selectedPosFilter, setSelectedPosFilter] = useState<string>('ALL');
  const [timeFilter, setTimeFilter] = useState<'ALL' | 'HOUR' | 'DAY' | 'WEEK'>('ALL');

  // Quick Direct Transfer Modal
  const [isQuickTransferOpen, setIsQuickTransferOpen] = useState(false);
  const [quickSourceTeamPuntero, setQuickSourceTeamPuntero] = useState<number | ''>('');
  const [quickPlayerPuntero, setQuickPlayerPuntero] = useState<number | ''>('');
  const [quickTargetTeamPuntero, setQuickTargetTeamPuntero] = useState<number | ''>('');
  const [quickTransferError, setQuickTransferError] = useState<string | null>(null);

  // Undo confirmation state
  const [undoTargetRecord, setUndoTargetRecord] = useState<TransferRecord | null>(null);

  // Load records from storage
  const loadRecords = () => {
    const list = StorageService.getTransferLedger();
    setRecords(list);
  };

  useEffect(() => {
    loadRecords();
  }, []);

  // Format timestamps
  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = Math.max(0, now - timestamp);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Hace unos segundos';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} h`;
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    return new Date(timestamp).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatExactDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Filter records
  const filteredRecords = useMemo(() => {
    const now = Date.now();
    return records.filter((rec) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesPlayer = rec.playerName.toLowerCase().includes(q);
        const matchesFrom = rec.fromTeamName.toLowerCase().includes(q);
        const matchesTo = rec.toTeamName.toLowerCase().includes(q);
        const matchesNotes = rec.notes?.toLowerCase().includes(q) || false;
        if (!matchesPlayer && !matchesFrom && !matchesTo && !matchesNotes) {
          return false;
        }
      }

      // Team filter (involved either as source or destination)
      if (selectedTeamFilter !== 'ALL') {
        const teamPuntero = parseInt(selectedTeamFilter);
        if (rec.fromTeamPuntero !== teamPuntero && rec.toTeamPuntero !== teamPuntero) {
          return false;
        }
      }

      // Position filter
      if (selectedPosFilter !== 'ALL') {
        const pos = parseInt(selectedPosFilter);
        if (rec.playerDemarcacion !== pos) {
          return false;
        }
      }

      // Time filter
      if (timeFilter === 'HOUR') {
        if (now - rec.timestamp > 3600 * 1000) return false;
      } else if (timeFilter === 'DAY') {
        if (now - rec.timestamp > 24 * 3600 * 1000) return false;
      } else if (timeFilter === 'WEEK') {
        if (now - rec.timestamp > 7 * 24 * 3600 * 1000) return false;
      }

      return true;
    });
  }, [records, searchQuery, selectedTeamFilter, selectedPosFilter, timeFilter]);

  // Statistics Summary
  const stats = useMemo(() => {
    const total = records.length;
    const teamActivity: Record<string, number> = {};
    let highRatedCount = 0;

    for (const r of records) {
      teamActivity[r.toTeamName] = (teamActivity[r.toTeamName] || 0) + 1;
      teamActivity[r.fromTeamName] = (teamActivity[r.fromTeamName] || 0) + 1;
      if (r.playerMedia && r.playerMedia >= 85) {
        highRatedCount++;
      }
    }

    let topActiveTeam = 'Ninguno';
    let maxOps = 0;
    for (const [teamName, ops] of Object.entries(teamActivity)) {
      if (ops > maxOps && teamName !== 'AGENTE LIBRE') {
        maxOps = ops;
        topActiveTeam = teamName;
      }
    }

    return { total, topActiveTeam, highRatedCount, maxOps };
  }, [records]);

  // Handle Undo / Revert Transfer
  const handleConfirmUndo = () => {
    if (!undoTargetRecord || !onBatchMovePlayers) return;

    const { playerPuntero, fromTeamPuntero, toTeamPuntero, playerName, fromTeamName } =
      undoTargetRecord;

    // Check if source team still exists
    const originalTeam = teams.find((t) => t.puntero === fromTeamPuntero);
    if (!originalTeam) {
      alert(`El equipo de origen (${fromTeamName}) ya no existe en la base de datos.`);
      setUndoTargetRecord(null);
      return;
    }

    if (originalTeam.plantilla.length >= 15) {
      alert(
        `El equipo de origen ${originalTeam.nombreCorto} tiene la plantilla completa (15 jugadores). No se puede revertir el traspaso.`
      );
      setUndoTargetRecord(null);
      return;
    }

    // Execute transfer back to original team
    onBatchMovePlayers([playerPuntero], fromTeamPuntero);

    // Record the reversal in ledger
    StorageService.recordTransfers([
      {
        playerPuntero,
        playerName,
        playerDorsal: undoTargetRecord.playerDorsal,
        playerDemarcacion: undoTargetRecord.playerDemarcacion,
        playerMedia: undoTargetRecord.playerMedia,
        fromTeamPuntero: toTeamPuntero,
        fromTeamName: undoTargetRecord.toTeamName,
        toTeamPuntero: fromTeamPuntero,
        toTeamName: fromTeamName,
        type: 'TRANSFER',
        notes: `Reversión de traspaso anterior (#${undoTargetRecord.id.slice(-4)})`,
      },
    ]);

    setUndoTargetRecord(null);
    loadRecords();
    onRefreshTeams?.();
  };

  // Delete a single record from ledger
  const handleDeleteRecord = (id: string) => {
    const updated = StorageService.deleteTransferRecord(id);
    setRecords(updated);
  };

  // Clear entire ledger
  const handleClearLedger = () => {
    if (window.confirm('¿Seguro que deseas vaciar todo el historial del Libro de Traspasos?')) {
      StorageService.clearTransferLedger();
      setRecords([]);
    }
  };

  // Reset to initial sample data
  const handleResetLedger = () => {
    const seeded = StorageService.resetTransferLedger();
    setRecords(seeded);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (records.length === 0) return;

    const headers = [
      'ID',
      'Fecha',
      'Hora',
      'Jugador',
      'Posicion',
      'Media',
      'Equipo Origen',
      'Equipo Destino',
      'Tipo',
      'Notas',
    ];

    const rows = records.map((r) => {
      const date = new Date(r.timestamp);
      return [
        r.id,
        date.toLocaleDateString('es-ES'),
        date.toLocaleTimeString('es-ES'),
        `"${r.playerName}"`,
        POS_NAMES[r.playerDemarcacion] || 'N/A',
        r.playerMedia || '',
        `"${r.fromTeamName}"`,
        `"${r.toTeamName}"`,
        r.type || 'TRANSFER',
        `"${r.notes || ''}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pcbasket_transfer_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Direct Quick Transfer execution
  const handleExecuteQuickTransfer = () => {
    setQuickTransferError(null);
    if (!quickSourceTeamPuntero || !quickPlayerPuntero || !quickTargetTeamPuntero) {
      setQuickTransferError('Debes seleccionar el equipo origen, el jugador y el equipo destino.');
      return;
    }

    if (quickSourceTeamPuntero === quickTargetTeamPuntero) {
      setQuickTransferError('El equipo de destino no puede ser el mismo que el de origen.');
      return;
    }

    const sourceTeam = teams.find((t) => t.puntero === quickSourceTeamPuntero);
    const destTeam = teams.find((t) => t.puntero === quickTargetTeamPuntero);
    if (!sourceTeam || !destTeam) {
      setQuickTransferError('Equipos no encontrados.');
      return;
    }

    if (destTeam.plantilla.length >= 15) {
      setQuickTransferError(
        `El equipo destino ${destTeam.nombreCorto} ya tiene el límite máximo de 15 jugadores.`
      );
      return;
    }

    const player = sourceTeam.plantilla.find((p) => p.puntero === quickPlayerPuntero);
    if (!player) {
      setQuickTransferError('Jugador no encontrado en la plantilla de origen.');
      return;
    }

    // Execute transfer
    if (onBatchMovePlayers) {
      onBatchMovePlayers([player.puntero], destTeam.puntero);
    }

    // Record in ledger
    const newLog: TransferRecord = {
      id: `tr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      playerPuntero: player.puntero,
      playerName: player.nombreLargo || player.nombreCorto,
      playerDorsal: player.dorsal,
      playerDemarcacion: player.demarcacion,
      playerMedia: calculateMediaQuinteto(player.medias),
      fromTeamPuntero: sourceTeam.puntero,
      fromTeamName: sourceTeam.nombreCorto,
      toTeamPuntero: destTeam.puntero,
      toTeamName: destTeam.nombreCorto,
      type: 'TRANSFER',
      notes: `Traspaso directo desde ManagerView`,
    };

    const updated = StorageService.recordTransfers([newLog]);
    setRecords(updated);
    setIsQuickTransferOpen(false);
    setQuickPlayerPuntero('');
    onRefreshTeams?.();
  };

  // Helper for source team selection in quick modal
  const selectedSourceTeam = useMemo(() => {
    if (!quickSourceTeamPuntero) return null;
    return teams.find((t) => t.puntero === quickSourceTeamPuntero) || null;
  }, [teams, quickSourceTeamPuntero]);

  return (
    <div className="space-y-6">
      {/* Top Ledger Header & Summary Bar */}
      <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-amber-500/20 text-[#ffce42] border border-amber-500/40 rounded-xl flex items-center justify-center shadow-inner">
              <History className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-[#ffce42] font-bold">
                  Historial de Movimientos de Plantilla
                </span>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded border border-amber-500/30">
                  TRANSFER LEDGER
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                Libro Oficial de Traspasos & Fichajes
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Registro cronológico con marcas de tiempo, datos de clubes de origen/destino y control de movimientos.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setQuickTransferError(null);
                setIsQuickTransferOpen(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black rounded-lg text-xs uppercase tracking-wide flex items-center gap-1.5 shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              Nuevo Traspaso Directo
            </button>

            <button
              onClick={handleExportCSV}
              disabled={records.length === 0}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Descargar libro de traspasos en formato CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              Exportar CSV
            </button>

            <button
              onClick={handleResetLedger}
              className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs flex items-center gap-1 transition-colors"
              title="Restaurar ejemplos históricos"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Ejemplos
            </button>

            <button
              onClick={handleClearLedger}
              disabled={records.length === 0}
              className="p-2 bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 disabled:opacity-40 text-slate-400 border border-slate-700 rounded-lg transition-colors"
              title="Limpiar todo el historial"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Quick Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800">
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Traspasos Registrados
            </span>
            <div className="text-2xl font-black text-white font-mono mt-0.5">
              {stats.total}
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Club Más Activo
            </span>
            <div className="text-sm font-bold text-[#ffce42] truncate mt-1">
              {stats.topActiveTeam}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {stats.maxOps > 0 ? `${stats.maxOps} operaciones` : 'Sin datos'}
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Fichajes Estrella (Media &ge;85)
            </span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
              {stats.highRatedCount}
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Última Actividad
            </span>
            <div className="text-xs font-semibold text-slate-300 mt-1 truncate">
              {records.length > 0 ? formatTimeAgo(records[0].timestamp) : 'Sin traspasos'}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {records.length > 0 ? formatExactDate(records[0].timestamp).split(',')[0] : '-'}
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-lg">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por jugador, equipo o notas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#ffce42] focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Team Filter */}
          <select
            value={selectedTeamFilter}
            onChange={(e) => setSelectedTeamFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:border-[#ffce42] focus:outline-none cursor-pointer"
          >
            <option value="ALL">Todos los Equipos</option>
            {teams.map((t) => (
              <option key={t.puntero} value={t.puntero.toString()}>
                {t.nombreCorto}
              </option>
            ))}
          </select>

          {/* Position Filter */}
          <select
            value={selectedPosFilter}
            onChange={(e) => setSelectedPosFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:border-[#ffce42] focus:outline-none cursor-pointer"
          >
            <option value="ALL">Todas las Posiciones</option>
            {POS_NAMES.map((name, idx) => (
              <option key={idx} value={idx.toString()}>
                {name}
              </option>
            ))}
          </select>

          {/* Time Filter */}
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:border-[#ffce42] focus:outline-none cursor-pointer"
          >
            <option value="ALL">Cualquier Momento</option>
            <option value="HOUR">Última Hora</option>
            <option value="DAY">Últimas 24 Horas</option>
            <option value="WEEK">Últimos 7 Días</option>
          </select>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-4 h-4 text-[#ffce42]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Registro de Operaciones ({filteredRecords.length}{' '}
              {filteredRecords.length === 1 ? 'movimiento' : 'movimientos'})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Actualización en vivo
          </span>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 mx-auto flex items-center justify-center text-slate-400">
              <Clock className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-300">
              No hay movimientos que coincidan con los filtros
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Realiza traspasos arrastrando jugadores en el Directorio de Jugadores o pulsa en "Nuevo Traspaso Directo" para registrar una nueva operación.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/60 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                  <th className="py-3 px-4">Fecha y Hora</th>
                  <th className="py-3 px-4">Jugador</th>
                  <th className="py-3 px-3 text-center">Pos</th>
                  <th className="py-3 px-3 text-center">Media</th>
                  <th className="py-3 px-4">Origen</th>
                  <th className="py-3 px-2 text-center"></th>
                  <th className="py-3 px-4">Destino</th>
                  <th className="py-3 px-4">Detalle / Notas</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRecords.map((record) => {
                  const posName = POS_NAMES[record.playerDemarcacion] || 'B';
                  const posShort = POS_SHORT[record.playerDemarcacion] || 'B';
                  const posColor = POS_COLORS[record.playerDemarcacion] || POS_COLORS[0];

                  return (
                    <tr
                      key={record.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Timestamp Column */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <div>
                            <span className="font-semibold text-slate-200 block">
                              {formatTimeAgo(record.timestamp)}
                            </span>
                            <span
                              className="text-[10px] text-slate-500 font-mono block"
                              title={formatExactDate(record.timestamp)}
                            >
                              {formatExactDate(record.timestamp)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Player Column */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                            #{record.playerDorsal}
                          </span>
                          <span className="font-bold text-white text-xs group-hover:text-[#ffce42] transition-colors">
                            {record.playerName}
                          </span>
                        </div>
                      </td>

                      {/* Position Column */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${posColor}`}
                          title={posName}
                        >
                          {posShort}
                        </span>
                      </td>

                      {/* Media Column */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span
                          className={`text-xs font-black font-mono px-2 py-0.5 rounded ${
                            (record.playerMedia || 0) >= 88
                              ? 'bg-amber-500/20 text-[#ffce42]'
                              : (record.playerMedia || 0) >= 80
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {record.playerMedia || '-'}
                        </span>
                      </td>

                      {/* Origin Team */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-rose-400" />
                          <span className="font-semibold text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                            {record.fromTeamName}
                          </span>
                        </div>
                      </td>

                      {/* Arrow */}
                      <td className="py-3 px-2 text-center text-slate-500">
                        <ArrowRight className="w-4 h-4 mx-auto text-amber-400" />
                      </td>

                      {/* Destination Team */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="font-bold text-white bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                            {record.toTeamName}
                          </span>
                        </div>
                      </td>

                      {/* Notes / Tag */}
                      <td className="py-3 px-4">
                        <span className="text-[11px] text-slate-400 max-w-xs truncate block">
                          {record.notes || 'Traspaso completado con éxito'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setUndoTargetRecord(record)}
                            title={`Revertir traspaso de ${record.playerName} hacia ${record.fromTeamName}`}
                            className="p-1.5 bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 text-slate-400 rounded-lg border border-slate-700 hover:border-amber-500/40 transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(record.id)}
                            title="Eliminar registro del libro"
                            className="p-1.5 bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 rounded-lg border border-slate-700 hover:border-rose-500/40 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QUICK TRANSFER MODAL */}
      {isQuickTransferOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ArrowLeftRight className="w-5 h-5 text-[#ffce42]" />
                <h3 className="text-base font-black text-white">
                  Registrar Nuevo Traspaso Directo
                </h3>
              </div>
              <button
                onClick={() => setIsQuickTransferOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {quickTransferError && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/50 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{quickTransferError}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* 1. Origin Team */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wide block mb-1.5">
                  1. Equipo de Origen
                </label>
                <select
                  value={quickSourceTeamPuntero}
                  onChange={(e) => {
                    const val = e.target.value ? parseInt(e.target.value) : '';
                    setQuickSourceTeamPuntero(val);
                    setQuickPlayerPuntero('');
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:border-[#ffce42] focus:outline-none"
                >
                  <option value="">-- Seleccionar Equipo de Origen --</option>
                  {teams.map((t) => (
                    <option key={t.puntero} value={t.puntero}>
                      {t.nombreCorto} ({t.plantilla.length} jug.)
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Player to Transfer */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wide block mb-1.5">
                  2. Jugador a Traspasar
                </label>
                <select
                  disabled={!quickSourceTeamPuntero}
                  value={quickPlayerPuntero}
                  onChange={(e) =>
                    setQuickPlayerPuntero(e.target.value ? parseInt(e.target.value) : '')
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:border-[#ffce42] focus:outline-none disabled:opacity-40"
                >
                  <option value="">-- Seleccionar Jugador --</option>
                  {selectedSourceTeam?.plantilla.map((p) => (
                    <option key={p.puntero} value={p.puntero}>
                      #{p.dorsal} - {p.nombreLargo || p.nombreCorto} (
                      {POS_SHORT[p.demarcacion]} | Med: {calculateMediaQuinteto(p.medias)})
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Destination Team */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wide block mb-1.5">
                  3. Equipo de Destino
                </label>
                <select
                  value={quickTargetTeamPuntero}
                  onChange={(e) =>
                    setQuickTargetTeamPuntero(
                      e.target.value ? parseInt(e.target.value) : ''
                    )
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:border-[#ffce42] focus:outline-none"
                >
                  <option value="">-- Seleccionar Equipo de Destino --</option>
                  {teams.map((t) => (
                    <option
                      key={t.puntero}
                      value={t.puntero}
                      disabled={t.puntero === quickSourceTeamPuntero}
                    >
                      {t.nombreCorto} ({t.plantilla.length}/15 jug.)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setIsQuickTransferOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleExecuteQuickTransfer}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wide flex items-center gap-2 shadow-lg"
              >
                <CheckCircle2 className="w-4 h-4" />
                Ejecutar y Registrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UNDO CONFIRMATION MODAL */}
      {undoTargetRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-amber-400">
              <RotateCcw className="w-6 h-6" />
              <h3 className="text-base font-black text-white">
                ¿Revertir este traspaso?
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              El jugador <strong className="text-white">{undoTargetRecord.playerName}</strong> será
              transferido de vuelta desde{' '}
              <strong className="text-rose-400">{undoTargetRecord.toTeamName}</strong> hacia su club
              de origen{' '}
              <strong className="text-emerald-400">{undoTargetRecord.fromTeamName}</strong>.
            </p>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1 font-mono">
              <div>Jugador: {undoTargetRecord.playerName} (#{undoTargetRecord.playerDorsal})</div>
              <div>Fecha traspaso original: {formatExactDate(undoTargetRecord.timestamp)}</div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setUndoTargetRecord(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmUndo}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirmar Reversión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
