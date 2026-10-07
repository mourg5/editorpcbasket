import React, { useState, useMemo } from 'react';
import {
  X,
  Save,
  Download,
  Plus,
  UserMinus,
  ArrowUp,
  ArrowDown,
  Shield,
  Trophy,
  Users,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Trash2,
  Info,
  Coins,
  CircleDollarSign,
  Wallet,
} from 'lucide-react';
import { Equipo, Jugador, Demarcacion } from '../types/pcbasket';
import { getAllCountries, getCountry } from '../utils/paises';
import {
  calculateTeamMedias,
  calculateMediaQuinteto,
  calculateMediaPlantilla,
  addRatingDelta,
  calculatePlayerSalary,
  calculateTeamPayroll,
} from '../utils/ratingsUtils';
import { downloadDbcFile } from '../utils/hexUtils';
import {
  validateTeamRoster,
  getPlayerPassportType,
  POS_NAMES,
} from '../utils/validationUtils';

interface TeamEditorModalProps {
  team: Equipo;
  onSave: (updatedTeam: Equipo) => void;
  onClose: () => void;
  onDelete?: (puntero: number) => void;
  onEditPlayer: (player: Jugador, onPlayerSave: (updatedPlayer: Jugador) => void) => void;
  startingYear: number;
  useCotNationality: boolean;
  useEurNationality: boolean;
}

const POS_LABELS = ['B', 'E', 'A', 'AP', 'P'];

export const TeamEditorModal: React.FC<TeamEditorModalProps> = ({
  team: initialTeam,
  onSave,
  onClose,
  onDelete,
  onEditPlayer,
  startingYear,
  useCotNationality,
  useEurNationality,
}) => {
  const [team, setTeam] = useState<Equipo>(JSON.parse(JSON.stringify(initialTeam)));
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number | null>(null);

  // Salary Cap state
  const [salaryCapPreset, setSalaryCapPreset] = useState<'LEAGUE' | 'BUDGET' | 'EUROLEAGUE' | 'CUSTOM'>('LEAGUE');
  const [customSalaryCap, setCustomSalaryCap] = useState<number>(2000);
  const [editingContractPlayer, setEditingContractPlayer] = useState<{
    index: number;
    player: Jugador;
    customVal: number;
  } | null>(null);

  // In-app confirmation dialog states
  const [playerToRemove, setPlayerToRemove] = useState<{ index: number; name: string } | null>(null);
  const [isDeletingTeam, setIsDeletingTeam] = useState<boolean>(false);
  const [showValidationPrompt, setShowValidationPrompt] = useState<'save' | 'export' | null>(null);

  const countries = getAllCountries();
  const teamMedias = calculateTeamMedias(team.plantilla);

  // Salary Cap & Payroll Calculations
  const effectiveSalaryCap = useMemo(() => {
    if (salaryCapPreset === 'LEAGUE') return 2000;
    if (salaryCapPreset === 'BUDGET') return Math.max(100, team.presupuesto || 1500);
    if (salaryCapPreset === 'EUROLEAGUE') return 2500;
    return customSalaryCap;
  }, [salaryCapPreset, customSalaryCap, team.presupuesto]);

  const payroll = useMemo(() => {
    return calculateTeamPayroll(team.plantilla);
  }, [team.plantilla]);

  const capSpace = effectiveSalaryCap - payroll.total;
  const capPercent =
    effectiveSalaryCap > 0 ? Math.round((payroll.total / effectiveSalaryCap) * 100) : 0;
  const isOverCap = capSpace < 0;
  const isNearCap = !isOverCap && capPercent >= 85;

  // Live PC Basket Roster Validation
  const validation = validateTeamRoster(team, {
    useEurNationality,
    useCotNationality,
  });

  const handleFieldChange = (field: keyof Equipo, value: any) => {
    setTeam((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubirMedia = () => {
    setTeam((prev) => {
      const updated = { ...prev };
      updated.plantilla = updated.plantilla.map((j) => {
        const copy = JSON.parse(JSON.stringify(j));
        addRatingDelta(copy.medias, 1);
        return copy;
      });
      return updated;
    });
  };

  const handleBajarMedia = () => {
    setTeam((prev) => {
      const updated = { ...prev };
      updated.plantilla = updated.plantilla.map((j) => {
        const copy = JSON.parse(JSON.stringify(j));
        addRatingDelta(copy.medias, -1);
        return copy;
      });
      return updated;
    });
  };

  const handleMovePlayer = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === team.plantilla.length - 1)
    ) {
      return;
    }
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newPlantilla = [...team.plantilla];
    const temp = newPlantilla[index];
    newPlantilla[index] = newPlantilla[newIndex];
    newPlantilla[newIndex] = temp;
    setTeam((prev) => ({ ...prev, plantilla: newPlantilla }));
    setSelectedPlayerIndex(newIndex);
  };

  const confirmRemovePlayer = () => {
    if (playerToRemove !== null) {
      const newPlantilla = team.plantilla.filter((_, i) => i !== playerToRemove.index);
      setTeam((prev) => ({ ...prev, plantilla: newPlantilla }));
      setSelectedPlayerIndex(null);
      setPlayerToRemove(null);
    }
  };

  const handleAddNewPlayer = () => {
    const nextPuntero =
      team.plantilla.length > 0
        ? Math.max(...team.plantilla.map((j) => j.puntero)) + 1
        : team.puntero * 10 + 1;

    const newJugador: Jugador = {
      jugadorId: nextPuntero,
      puntero: nextPuntero,
      dorsal: 10 + (team.plantilla.length % 20),
      nombreCorto: 'NUEVO',
      nombreLargo: 'Nuevo JUGADOR',
      demarcacion: (team.plantilla.length % 5) as Demarcacion,
      anoNacimiento: startingYear - 24,
      nacionalidad: team.pais || 22,
      altura: 198,
      peso: 95,
      colorPiel: false,
      medias: {
        velocidad: 65,
        resistencia: 65,
        agresividad: 65,
        salto: 65,
        oculto: 65,
        defensa: 65,
        tiro2: 65,
        tiro3: 65,
        tiroL: 65,
        rebotes: 65,
        asistencias: 65,
      },
      equipoPuntero: team.puntero,
    };

    setTeam((prev) => ({
      ...prev,
      plantilla: [...prev.plantilla, newJugador],
    }));
  };

  const handleSaveClick = () => {
    if (validation.hasErrors) {
      setShowValidationPrompt('save');
    } else {
      onSave(team);
    }
  };

  const handleExportDbcClick = () => {
    if (validation.hasErrors) {
      setShowValidationPrompt('export');
    } else {
      downloadDbcFile(team, {
        startingYear,
        useCotNationality,
        useEurNationality,
      });
    }
  };

  const executeConfirmedAction = () => {
    if (showValidationPrompt === 'save') {
      onSave(team);
    } else if (showValidationPrompt === 'export') {
      downloadDbcFile(team, {
        startingYear,
        useCotNationality,
        useEurNationality,
      });
    }
    setShowValidationPrompt(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-[#1e3462] rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden text-slate-100 relative">
        {/* Modal Top Header */}
        <div className="bg-[#1e3462] border-b-2 border-[#ffce42]/40 px-6 py-3 flex items-center justify-between select-none shrink-0">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-[#ffce42]" />
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>Editar Equipo:</span>
                <span className="text-[#ffce42] font-black">{team.nombreCorto}</span>
                <span className="text-xs bg-black/40 text-slate-300 font-mono px-2 py-0.5 rounded border border-white/10">
                  ID: {team.puntero}
                </span>
                {validation.isValid ? (
                  <span className="text-[11px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Reglas PC Basket OK
                  </span>
                ) : (
                  <span className="text-[11px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold animate-pulse">
                    <AlertOctagon className="w-3.5 h-3.5" /> Infracción de Reglas
                  </span>
                )}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split into Team Data & Roster Data */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Team Data (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-[#ffce42] uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                <Trophy className="w-4 h-4" />
                Datos del Club
              </h3>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Puntero
                  </label>
                  <input
                    type="number"
                    value={team.puntero}
                    onChange={(e) => handleFieldChange('puntero', parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:border-[#ffce42] focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Nombre Corto
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    value={team.nombreCorto}
                    onChange={(e) => handleFieldChange('nombreCorto', e.target.value.toUpperCase())}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold tracking-wide focus:border-[#ffce42] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Nombre Largo
                </label>
                <input
                  type="text"
                  value={team.nombreLargo}
                  onChange={(e) => handleFieldChange('nombreLargo', e.target.value.toUpperCase())}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-[#ffce42] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  País
                </label>
                <select
                  value={team.pais}
                  onChange={(e) => handleFieldChange('pais', parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-[#ffce42] focus:outline-none"
                >
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.banderaEmoji} {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Entrenador
                </label>
                <input
                  type="text"
                  value={team.entrenador}
                  onChange={(e) => handleFieldChange('entrenador', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-[#ffce42] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Pabellón
                </label>
                <input
                  type="text"
                  value={team.pabellon}
                  onChange={(e) => handleFieldChange('pabellon', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-[#ffce42] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Aforo
                  </label>
                  <input
                    type="number"
                    value={team.aforo}
                    onChange={(e) => handleFieldChange('aforo', parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-[#ffce42] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Presupuesto (M)
                  </label>
                  <input
                    type="number"
                    value={team.presupuesto}
                    onChange={(e) => handleFieldChange('presupuesto', parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-[#ffce42] focus:outline-none"
                  />
                </div>
              </div>

              {/* Escudos Section matching WPF */}
              <div className="border-t border-slate-800 pt-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Gráficos de Escudo (PC Basket)
                </label>
                <div className="grid grid-cols-4 gap-2 text-center text-[10px] text-slate-400 font-mono">
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded flex flex-col items-center justify-center">
                    <div className="w-12 h-12 bg-black/60 rounded flex items-center justify-center text-[#ffce42] font-black border border-white/5">
                      3D
                    </div>
                    <span className="mt-1">3DESC</span>
                  </div>
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded flex flex-col items-center justify-center">
                    <div className="w-8 h-10 bg-black/60 rounded flex items-center justify-center text-[#ffce42] font-bold border border-white/5 text-xs">
                      MINI
                    </div>
                    <span className="mt-1">MINI</span>
                  </div>
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded flex flex-col items-center justify-center">
                    <div className="w-6 h-6 bg-black/60 rounded flex items-center justify-center text-[#ffce42] font-bold border border-white/5 text-[9px]">
                      N
                    </div>
                    <span className="mt-1">NANO</span>
                  </div>
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded flex flex-col items-center justify-center">
                    <div className="w-4 h-4 bg-black/60 rounded flex items-center justify-center text-[#ffce42] font-bold border border-white/5 text-[8px]">
                      R
                    </div>
                    <span className="mt-1">RIDI</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Salary Cap & Team Payroll Control Panel */}
            <div
              className={`rounded-xl border p-4 space-y-3.5 shadow-lg transition-all ${
                isOverCap
                  ? 'bg-rose-950/20 border-rose-600/50 text-slate-100'
                  : isNearCap
                  ? 'bg-amber-950/20 border-amber-600/40 text-slate-100'
                  : 'bg-slate-950/70 border-slate-800 text-slate-100'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-[#ffce42] uppercase tracking-wider flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-[#ffce42]" />
                  Control Salarial (Salary Cap)
                </h3>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    isOverCap
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : isNearCap
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {isOverCap ? 'Tope Excedido' : isNearCap ? 'Cerca del Límite' : 'Cap OK'}
                </span>
              </div>

              {/* Cap Selector Preset */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold">Límite Salarial de Referencia:</span>
                </div>
                <select
                  value={salaryCapPreset}
                  onChange={(e) => setSalaryCapPreset(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-[#ffce42] focus:outline-none cursor-pointer"
                >
                  <option value="LEAGUE">Tope Liga ACB (2.000 M ptas)</option>
                  <option value="BUDGET">Presupuesto del Club ({team.presupuesto || 1500} M ptas)</option>
                  <option value="EUROLEAGUE">Tope Euroliga (2.500 M ptas)</option>
                  <option value="CUSTOM">Tope Personalizado...</option>
                </select>
                {salaryCapPreset === 'CUSTOM' && (
                  <div className="pt-1.5 flex items-center gap-2">
                    <span className="text-xs text-slate-400">Límite (M):</span>
                    <input
                      type="number"
                      min={100}
                      value={customSalaryCap}
                      onChange={(e) => setCustomSalaryCap(parseInt(e.target.value) || 1000)}
                      className="w-28 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono focus:border-[#ffce42] focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Big Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">
                    Masa Salarial
                  </div>
                  <div className="text-xl font-black text-white font-mono tracking-tight">
                    {payroll.total.toLocaleString()} <span className="text-xs font-normal text-slate-400">M</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {team.plantilla.length} jugadores
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">
                    {isOverCap ? 'Exceso Salarial' : 'Margen Disponible'}
                  </div>
                  <div
                    className={`text-xl font-black font-mono tracking-tight ${
                      isOverCap ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {isOverCap
                      ? `-${Math.abs(capSpace).toLocaleString()}`
                      : `+${capSpace.toLocaleString()}`}{' '}
                    <span className="text-xs font-normal text-slate-400">M</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {isOverCap ? 'Sobre el tope de liga' : 'Espacio para fichajes'}
                  </div>
                </div>
              </div>

              {/* Multi-Segment Visual Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span
                    className={`font-bold ${
                      isOverCap ? 'text-rose-400' : isNearCap ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {capPercent}% consumido
                  </span>
                  <span className="text-slate-400">
                    Tope: {effectiveSalaryCap.toLocaleString()} M
                  </span>
                </div>

                <div className="relative h-3.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5 flex">
                  {/* Starters Segment */}
                  <div
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round((payroll.starters / effectiveSalaryCap) * 100)
                      )}%`,
                    }}
                    title={`Quinteto Titular: ${payroll.starters} M`}
                    className="h-full bg-blue-500 rounded-l-full transition-all duration-300"
                  />
                  {/* Bench Segment */}
                  <div
                    style={{
                      width: `${Math.min(
                        Math.max(
                          0,
                          100 - Math.round((payroll.starters / effectiveSalaryCap) * 100)
                        ),
                        Math.round((payroll.bench / effectiveSalaryCap) * 100)
                      )}%`,
                    }}
                    title={`Banquillo: ${payroll.bench} M`}
                    className="h-full bg-amber-400 transition-all duration-300"
                  />
                  {/* Over-Cap Overflow Segment */}
                  {isOverCap && (
                    <div
                      style={{ width: `${Math.min(100, capPercent - 100)}%` }}
                      title={`Exceso sobre el tope: ${Math.abs(capSpace)} M`}
                      className="h-full bg-rose-500 animate-pulse transition-all duration-300"
                    />
                  )}
                </div>

                {/* Meter Legend */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Titulares ({payroll.starters}M)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Banquillo ({payroll.bench}M)</span>
                  </div>
                  {isOverCap && (
                    <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>Exceso</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Economic Highlights */}
              <div className="border-t border-slate-800/80 pt-2 text-[11px] space-y-1 text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Salario Promedio:</span>
                  <span className="font-mono font-bold text-white">
                    {payroll.avgSalary} M / jugador
                  </span>
                </div>
                {payroll.maxSalaryPlayer && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Ficha Más Alta:</span>
                    <span className="font-bold text-[#ffce42] truncate max-w-[150px]">
                      {payroll.maxSalaryPlayer.player.nombreCorto} ({payroll.maxSalaryPlayer.salary} M)
                    </span>
                  </div>
                )}
              </div>

              {/* Status Note */}
              {isOverCap ? (
                <div className="p-2 bg-rose-950/50 border border-rose-800/60 rounded-lg text-[11px] text-rose-200 flex items-start gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Tope Excedido (+{Math.abs(capSpace)} M):</strong> La plantilla supera el límite salarial de liga.
                  </span>
                </div>
              ) : isNearCap ? (
                <div className="p-2 bg-amber-950/50 border border-amber-800/60 rounded-lg text-[11px] text-amber-200 flex items-start gap-1.5">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Margen Ajustado:</strong> Quedan <strong>{capSpace} M</strong> para nuevos fichajes ({capPercent}% ocupado).
                  </span>
                </div>
              ) : (
                <div className="p-2 bg-emerald-950/40 border border-emerald-800/50 rounded-lg text-[11px] text-emerald-200 flex items-start gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Situación salarial saneada con <strong>{capSpace} M</strong> de margen disponible.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Plantilla + PC Basket Live Validation Panel (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Live PC Basket Rules Validation Alert Box */}
            <div
              className={`rounded-xl border p-4 transition-all ${
                validation.hasErrors
                  ? 'bg-rose-950/40 border-rose-600/60 text-rose-200'
                  : validation.hasWarnings
                  ? 'bg-amber-950/40 border-amber-600/60 text-amber-200'
                  : 'bg-emerald-950/30 border-emerald-600/50 text-emerald-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  {validation.hasErrors ? (
                    <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  ) : validation.hasWarnings ? (
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      {validation.hasErrors
                        ? 'Infracción del Reglamento Oficial de PC Basket'
                        : validation.hasWarnings
                        ? 'Avisos y Recomendaciones de Plantilla'
                        : 'Plantilla Válida según Reglas Oficiales (ACB)'}
                    </h4>

                    {/* Bullet list of issues */}
                    {validation.hasErrors && (
                      <ul className="mt-1.5 space-y-1 text-xs text-rose-300 list-disc list-inside">
                        {validation.errors.map((err) => (
                          <li key={err.id}>
                            <strong className="text-white">{err.title}:</strong> {err.message}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Detail foreign players if quota is exceeded */}
                    {validation.stats.foreignCount > 2 && (
                      <div className="mt-2 text-xs text-rose-200 bg-rose-950/60 p-2.5 rounded-lg border border-rose-800/60">
                        <span className="font-bold text-white block mb-1">
                          ⚠️ Jugadores Extranjeros Detectados ({validation.stats.foreignCount}/2 permitidos):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {validation.stats.foreignPlayers.map((fp) => (
                            <span
                              key={fp.puntero}
                              className="px-2 py-0.5 bg-rose-900/60 text-rose-200 rounded border border-rose-700/60 font-semibold"
                            >
                              #{fp.dorsal} {fp.nombreCorto} ({getCountry(fp.nacionalidad).nombre})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {validation.hasWarnings && (
                      <ul className="mt-1.5 space-y-1 text-xs text-amber-300 list-disc list-inside">
                        {validation.warnings.map((warn) => (
                          <li key={warn.id}>
                            <strong className="text-white">{warn.title}:</strong> {warn.message}
                          </li>
                        ))}
                      </ul>
                    )}

                    {validation.isValid && !validation.hasWarnings && (
                      <p className="mt-1 text-xs text-emerald-300 font-light">
                        El equipo cuenta con el cupo reglamentario de jugadores ({team.plantilla.length} jugadores, mínimo 10), cumple el límite de 2 extranjeros y cubre las 5 demarcaciones del quinteto.
                      </p>
                    )}
                  </div>
                </div>

                {/* Quota Counter Chips */}
                <div className="flex flex-wrap items-center gap-1.5 shrink-0 justify-end">
                  <span
                    className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold border ${
                      validation.stats.foreignCount > 2
                        ? 'bg-rose-500/30 text-rose-300 border-rose-500 animate-pulse'
                        : 'bg-slate-900 text-slate-300 border-slate-700'
                    }`}
                    title="Límite reglamentario: Máximo 2 extranjeros"
                  >
                    Extranjeros: {validation.stats.foreignCount}/2
                  </span>
                  <span className="px-2 py-1 rounded text-[11px] font-mono bg-slate-900 text-blue-300 border border-slate-700">
                    Comunitarios: {validation.stats.communityCount}
                  </span>
                  <span className="px-2 py-1 rounded text-[11px] font-mono bg-slate-900 text-teal-300 border border-slate-700">
                    Cotonou: {validation.stats.cotonouCount}
                  </span>
                  <span className="px-2 py-1 rounded text-[11px] font-mono bg-slate-900 text-emerald-300 border border-slate-700">
                    Nacionales: {validation.stats.nationalCount}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-[#ffce42] uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Plantilla de Jugadores ({team.plantilla.length}/15)
                </h3>
                <div className="flex flex-wrap items-center space-x-3 text-xs">
                  <span className="text-slate-400 font-medium">
                    Media Q:{' '}
                    <strong className="text-[#ffce42] font-black ml-1">
                      {teamMedias.mediaQuinteto}
                    </strong>
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-400 font-medium">
                    Media P:{' '}
                    <strong className="text-slate-200 font-black ml-1">
                      {teamMedias.mediaPlantilla}
                    </strong>
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-400 font-medium flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    Masa Salarial:{' '}
                    <strong className="text-white font-mono font-bold ml-0.5">
                      {payroll.total.toLocaleString()}M
                    </strong>
                    <span className="text-slate-500">/</span>
                    <span className="text-slate-300 font-mono">
                      {effectiveSalaryCap.toLocaleString()}M
                    </span>
                    <span
                      className={`ml-1 font-mono text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        isOverCap
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : isNearCap
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {capPercent}% Cap
                    </span>
                  </span>
                </div>
              </div>

              {/* Roster Table with Starters indicator and Ficha status column */}
              <div className="overflow-x-auto max-h-[380px] border border-slate-800 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#121c33] text-slate-300 font-semibold uppercase tracking-wider sticky top-0 z-10">
                    <tr className="border-b border-slate-800">
                      <th className="py-2 px-2 text-center w-10">Rol</th>
                      <th className="py-2 px-2 text-center w-12">#</th>
                      <th className="py-2 px-3">Nombre Corto</th>
                      <th className="py-2 px-3">Nombre Largo</th>
                      <th className="py-2 px-2 text-center">Pos.</th>
                      <th className="py-2 px-2 text-center" title="Cupo de pasaporte reglamentario">Cupo</th>
                      <th className="py-2 px-2 text-center" title="Ficha salarial / Contrato anual del jugador (M ptas)">Salario</th>
                      <th className="py-2 px-2 text-center">M.Q</th>
                      <th className="py-2 px-2 text-center">M.P</th>
                      <th className="py-2 px-2 text-center">Alt</th>
                      <th className="py-2 px-3">País</th>
                      <th className="py-2 px-2 text-center">Nac</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {team.plantilla.map((player, index) => {
                      const isStarter = index < 5;
                      const roleLabel = isStarter ? POS_LABELS[index] : String(index + 1);
                      const country = getCountry(player.nacionalidad);
                      const isSelected = selectedPlayerIndex === index;
                      const passport = getPlayerPassportType(
                        player,
                        team.pais || 22,
                        useEurNationality,
                        useCotNationality
                      );
                      const isForeignInfraction =
                        passport.type === 'EXT' && validation.stats.foreignCount > 2;
                      const playerSalary = calculatePlayerSalary(player);

                      return (
                        <tr
                          key={player.puntero || index}
                          onClick={() => setSelectedPlayerIndex(index)}
                          onDoubleClick={() =>
                            onEditPlayer(player, (updatedPlayer) => {
                              const copy = [...team.plantilla];
                              copy[index] = updatedPlayer;
                              setTeam((prev) => ({ ...prev, plantilla: copy }));
                            })
                          }
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-blue-600/30 text-white'
                              : isForeignInfraction
                              ? 'bg-rose-950/20 hover:bg-rose-950/40 text-slate-200'
                              : isStarter
                              ? 'bg-amber-500/5 hover:bg-amber-500/10 text-slate-200'
                              : 'hover:bg-slate-800/40 text-slate-300'
                          }`}
                        >
                          {/* Role Indicator (B, E, A, AP, P) */}
                          <td className="py-2 px-2 text-center font-bold">
                            <span
                              className={`inline-block w-6 h-6 rounded text-center leading-6 text-[10px] font-black ${
                                isStarter
                                   ? 'bg-[#ffce42] text-black shadow'
                                   : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {roleLabel}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-center font-mono font-bold text-amber-400">
                            {player.dorsal}
                          </td>
                          <td className="py-2 px-3 font-bold text-white tracking-wide">
                            {player.nombreCorto}
                          </td>
                          <td className="py-2 px-3 text-slate-300">
                            {player.nombreLargo}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <span className="text-[11px] font-semibold text-slate-300">
                              {POS_NAMES[player.demarcacion]}
                            </span>
                          </td>
                          {/* Cupo / Passport status */}
                          <td className="py-2 px-2 text-center">
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border ${passport.badgeClass}`}
                              title={passport.label}
                            >
                              {passport.type}
                            </span>
                          </td>
                          {/* Salario / Contrato */}
                          <td
                            className="py-2 px-2 text-center font-mono font-bold text-emerald-400 group/sal cursor-pointer"
                            title="Ficha salarial anual. Haz clic para ajustar contrato individual."
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingContractPlayer({
                                index,
                                player,
                                customVal: player.contrato || playerSalary,
                              });
                            }}
                          >
                            <span className="hover:underline hover:text-emerald-300 transition-colors">
                              {playerSalary} M
                            </span>
                          </td>
                          <td className="py-2 px-2 text-center font-black text-amber-400">
                            {calculateMediaQuinteto(player.medias)}
                          </td>
                          <td className="py-2 px-2 text-center font-bold text-slate-300">
                            {calculateMediaPlantilla(player.medias)}
                          </td>
                          <td className="py-2 px-2 text-center font-mono text-slate-400">
                            {player.altura}
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap">
                            <span className="mr-1">{country.banderaEmoji}</span>
                            <span className="text-slate-400 text-[11px]">{country.nombre}</span>
                          </td>
                          <td className="py-2 px-2 text-center font-mono text-slate-400">
                            {player.anoNacimiento}
                          </td>
                        </tr>
                      );
                    })}
                    {team.plantilla.length === 0 && (
                      <tr>
                        <td colSpan={12} className="py-8 text-center text-slate-500">
                          La plantilla no tiene jugadores. Añade uno con el botón inferior.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Roster Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400 font-semibold mr-1">
                    Ajustar Medias:
                  </span>
                  <button
                    onClick={handleSubirMedia}
                    title="Subir +1 a todas las medias"
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <TrendingUp className="w-3.5 h-3.5" /> +1 Todos
                  </button>
                  <button
                    onClick={handleBajarMedia}
                    title="Bajar -1 a todas las medias"
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <TrendingDown className="w-3.5 h-3.5" /> -1 Todos
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  {selectedPlayerIndex !== null && (
                    <>
                      <button
                        onClick={() => handleMovePlayer(selectedPlayerIndex, 'up')}
                        disabled={selectedPlayerIndex === 0}
                        title="Mover jugador arriba en plantilla"
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMovePlayer(selectedPlayerIndex, 'down')}
                        disabled={selectedPlayerIndex === team.plantilla.length - 1}
                        title="Mover jugador abajo en plantilla"
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          const p = team.plantilla[selectedPlayerIndex];
                          setPlayerToRemove({ index: selectedPlayerIndex, name: p.nombreLargo });
                        }}
                        title="Quitar jugador de plantilla"
                        className="px-2.5 py-1.5 bg-rose-900/30 hover:bg-rose-900/50 text-rose-300 border border-rose-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <UserMinus className="w-4 h-4" /> Quitar
                      </button>
                    </>
                  )}

                  <button
                    onClick={handleAddNewPlayer}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Añadir Jugador
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="bg-slate-950 border-t border-slate-800 px-6 py-4 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center space-x-3">
            {onDelete && (
              <button
                onClick={() => setIsDeletingTeam(true)}
                className="px-3.5 py-2 bg-rose-900/30 hover:bg-rose-900/60 text-rose-300 border border-rose-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Eliminar este equipo de la base de datos"
              >
                <Trash2 className="w-4 h-4" /> Borrar Equipo
              </button>
            )}
            <span className="text-xs text-slate-400 hidden sm:inline">
              Doble clic sobre cualquier jugador para editar sus atributos.
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportDbcClick}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#ffce42]" /> Generar DBC
            </button>
            <button
              onClick={handleSaveClick}
              className="px-6 py-2 bg-[#ffce42] hover:bg-amber-400 text-black font-extrabold rounded-lg text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" /> Guardar Equipo
            </button>
          </div>
        </div>

        {/* In-App Confirmation Dialog: Remove Player (No window.confirm!) */}
        {playerToRemove !== null && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-slate-900 border-2 border-slate-700 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center space-x-3 text-rose-400">
                <UserMinus className="w-6 h-6" />
                <h4 className="text-sm font-bold text-white">¿Quitar jugador de la plantilla?</h4>
              </div>
              <p className="text-xs text-slate-300">
                ¿Estás seguro de que deseas quitar a <strong className="text-white">{playerToRemove.name}</strong> del equipo?
              </p>
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={() => setPlayerToRemove(null)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmRemovePlayer}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Sí, quitar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* In-App Confirmation Dialog: Delete Team from Editor */}
        {isDeletingTeam && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border-2 border-rose-600 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center space-x-3 text-rose-400">
                <Trash2 className="w-6 h-6" />
                <h4 className="text-base font-bold text-white">¿Eliminar este equipo?</h4>
              </div>
              <p className="text-xs text-slate-300">
                ¿Estás seguro de que deseas eliminar permanentemente a <strong className="text-white">{team.nombreCorto}</strong> (ID: {team.puntero}) de la base de datos?
              </p>
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={() => setIsDeletingTeam(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setIsDeletingTeam(false);
                    if (onDelete) onDelete(team.puntero);
                    onClose();
                  }}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Sí, Eliminar Definitivamente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* In-App Confirmation Dialog: Validation Errors Alert */}
        {showValidationPrompt !== null && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-slate-900 border-2 border-rose-500/60 rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4">
              <div className="flex items-center space-x-3 text-rose-400">
                <AlertOctagon className="w-6 h-6" />
                <h4 className="text-sm font-bold text-white">Aviso de Reglamento PC Basket</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                La plantilla del equipo <strong className="text-white">{team.nombreCorto}</strong> actualmente no cumple con las reglas estándar de PC Basket:
              </p>
              <div className="bg-rose-950/40 border border-rose-800/60 rounded-lg p-3 text-xs text-rose-200 space-y-1.5">
                {validation.errors.map((err) => (
                  <div key={err.id} className="flex items-start gap-1.5">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>
                      <strong className="text-white">{err.title}:</strong> {err.message}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400">
                ¿Deseas continuar y {showValidationPrompt === 'save' ? 'guardar el equipo' : 'descargar el archivo .DBC'} de todos modos?
              </p>
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={() => setShowValidationPrompt(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Volver a corregir
                </button>
                <button
                  onClick={executeConfirmedAction}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-lg text-xs uppercase tracking-wider cursor-pointer"
                >
                  Continuar de todos modos
                </button>
              </div>
            </div>
          </div>
        )}

        {/* In-App Dialog: Adjust Player Contract / Ficha Salarial */}
        {editingContractPlayer !== null && (
          <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-slate-900 border-2 border-slate-700 rounded-xl p-5 max-w-sm w-full shadow-2xl space-y-4 text-slate-100">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white">
                    Ajustar Ficha Salarial
                  </h4>
                </div>
                <button
                  onClick={() => setEditingContractPlayer(null)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <div className="font-bold text-white text-sm">
                  #{editingContractPlayer.player.dorsal} {editingContractPlayer.player.nombreLargo}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Media Quinteto:{' '}
                  <strong className="text-[#ffce42]">
                    {calculateMediaQuinteto(editingContractPlayer.player.medias)}
                  </strong>{' '}
                  · Posición: {POS_NAMES[editingContractPlayer.player.demarcacion]}
                </div>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  Contrato Anual (Millones de pesetas / M):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={999}
                    value={editingContractPlayer.customVal}
                    onChange={(e) =>
                      setEditingContractPlayer((prev) =>
                        prev ? { ...prev, customVal: parseInt(e.target.value) || 0 } : null
                      )
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-base text-emerald-400 font-mono font-bold focus:border-[#ffce42] focus:outline-none"
                  />
                  <span className="text-sm font-bold text-slate-400">M</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Valor automático por nivel:{' '}
                  <strong>
                    {calculatePlayerSalary({
                      ...editingContractPlayer.player,
                      contrato: undefined,
                    })}{' '}
                    M
                  </strong>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    // Reset to auto market value
                    const copy = [...team.plantilla];
                    copy[editingContractPlayer.index] = {
                      ...copy[editingContractPlayer.index],
                      contrato: undefined,
                    };
                    setTeam((prev) => ({ ...prev, plantilla: copy }));
                    setEditingContractPlayer(null);
                  }}
                  className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                >
                  Restablecer Auto
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingContractPlayer(null)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      const copy = [...team.plantilla];
                      copy[editingContractPlayer.index] = {
                        ...copy[editingContractPlayer.index],
                        contrato: editingContractPlayer.customVal,
                      };
                      setTeam((prev) => ({ ...prev, plantilla: copy }));
                      setEditingContractPlayer(null);
                    }}
                    className="px-3.5 py-1.5 bg-[#ffce42] hover:bg-amber-400 text-black font-bold rounded-lg text-xs cursor-pointer shadow"
                  >
                    Guardar Ficha
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
